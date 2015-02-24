window.contApp.moduleTemplates = new(function(px, contApp){
	var _this = this;
	// var _pathBase;
	var _pathsModTpl;
	// var _pathModTpl;
	var _modTpls = [];
	var _modTplsIdMap = {};

	/**
	 * システムテンプレートかどうか判断する
	 */
	this.isSystemMod = function( modId ){
		if( !modId.match(new RegExp('^_sys\\/')) ){
			return false;
		}
		return true;
	}

	/**
	 * 初期化
	 */
	this.init = function( pathBase, pathsModTpl, cb ){
		_pathsModTpl = JSON.parse( JSON.stringify(pathsModTpl) );
		if( typeof( _pathsModTpl ) !== typeof({}) ){ _pathsModTpl = {}; }
		for( var modIdx in _pathsModTpl ){
			if( !px.utils.isDirectory( pathBase+'/'+_pathsModTpl[modIdx] ) ){
				continue;
			}
			_pathsModTpl[modIdx] = px.fs.realpathSync( pathBase+'/'+_pathsModTpl[modIdx] );
		}

		var modIdList = [];
		modIdList.push( '_sys/root' );
		modIdList.push( '_sys/unknown' );
		modIdList.push( '_sys/html' );

		px.utils.iterate(
			_pathsModTpl,
			function( it0, pathModTpl, modIdx ){
				px.fs.readdir( pathModTpl, function(err, data){
					px.utils.iterate(
						data,
						function( it1, dirname1, idx ){
							px.fs.readdir( pathModTpl+'/'+dirname1+'/', function(err, data){
								px.utils.iterate(
									data,
									function( it2, dirname2, idx2 ){
										if( !px.utils.isFile( pathModTpl+'/'+dirname1+'/'+dirname2+'/template.html' ) ){
											it2.next();//テンプレートが未定義
											return;
										}
										modIdList.push( modIdx+':'+dirname1+'/'+dirname2 );
										it2.next();
									} ,
									function(){
										it1.next();
									}
								);
							} );
						} ,
						function(){
							it0.next();
						}
					);
				} );

			},
			function(){
				px.utils.iterate(
					modIdList ,
					function( it3, dirname3, idx3 ){
						_modTplsIdMap[dirname3] = idx3;
						_modTpls[idx3] = new classModTpl( dirname3, function(){
							it3.next();
						} );
					} ,
					function(){
						cb();
					}
				);
			}
		);

		return this;
	}// init()

	/**
	 * モジュールテンプレートの物理格納パスを得る
	 */
	function getPathModTpl( modId ){
		// modId の形式は、 {$idx}:{$dir}/{$name}
		if( contApp.moduleTemplates.isSystemMod(modId) ){
			return false;
		}
		modId.match( new RegExp('^([0-9a-zA-Z]+?)\\:(.*)$') );
		var rtn = _pathsModTpl[RegExp.$1]+'/'+RegExp.$2+'/';
		if( typeof(rtn) !== typeof('') ){
			return false;
		}
		if( !px.utils.isDirectory(rtn) ){
			return false;
		}
		return rtn;
	}

	/**
	 * モジュールテンプレートオブジェクト
	 */
	function classModTpl( modId, cb, opt ){
		var _this = this;
		cb = cb || function(){};
		opt = opt || {};

		this.id = modId;
		this.isRootElement = false;
		this.path = null;
		if( !contApp.moduleTemplates.isSystemMod(modId) && !opt.src ){
			this.path = px.fs.realpathSync( getPathModTpl(modId) );
		}
		this.fields = {};

		if(opt.subModName){
			this.subModName = opt.subModName;
		}
		if( opt.topThis ){
			this.nameSpace = opt.topThis.nameSpace;
		}else{
			this.nameSpace = {"vars": {}};
		}

		/* 閉じタグを探す */
		function searchEndTag( src, fieldType ){
			var rtn = {
				content: '',
				nextSrc: src
			};
			var depth = 0;
			while( 1 ){
				if( !rtn.nextSrc.match(new RegExp('^((?:.|\r|\n)*?)\\{\\&((?:.|\r|\n)*?)\\&\\}((?:.|\r|\n)*)$') ) ){
					break;
				}
				rtn.content += RegExp.$1;
				var fieldSrc = RegExp.$2;
				var field = JSON.parse( fieldSrc );
				rtn.nextSrc = RegExp.$3;

				if( field == 'end'+fieldType ){
					if( depth ){
						depth --;
						rtn.content += '{&'+fieldSrc+'&}';
						continue;
					}
					return rtn;
				}else if( field[fieldType] ){
					depth ++;
					rtn.content += '{&'+fieldSrc+'&}';
					continue;
				}else{
					rtn.content += '{&'+fieldSrc+'&}';
					continue;
				}
			}
			return rtn;
		}

		/**
		 * 値を挿入して返す
		 */
		this.bind = function( fieldData, mode ){
			var src = this.template;
			var field = {};
			var rtn = '';

			while( 1 ){
				if( !src.match( new RegExp('^((?:.|\r|\n)*?)\\{\\&((?:.|\r|\n)*?)\\&\\}((?:.|\r|\n)*)$') ) ){
					rtn += src;
					break;
				}
				rtn += RegExp.$1;
				field = RegExp.$2;
				field = JSON.parse( field );
				src = RegExp.$3;

				if( typeof(field) == typeof('') ){
					// end系：無視
				}else if( field.input ){
					// input field
					var tmpVal = '';
					if( contApp.fieldDefinitions[field.input.type] ){
						// フィールドタイプ定義を呼び出す
						tmpVal += contApp.fieldDefinitions[field.input.type].bind( fieldData[field.input.name], mode );
					}else{
						// ↓未定義のフィールドタイプの場合のデフォルトの挙動
						tmpVal += contApp.fieldBase.bind( fieldData[field.input.name], mode );
					}
					if( !field.input.hidden ){//← "hidden": true だったら、非表示(=出力しない)
						rtn += tmpVal;
					}
					_this.nameSpace.vars[field.input.name] = {
						fieldType: "input", type: field.input.type, val: tmpVal
					}

				}else if( field.module ){
					// module field
					rtn += fieldData[field.module.name].join('');

				}else if( field.loop ){
					// loop field
					var tmpSearchResult = searchEndTag( src, 'loop' );
					rtn += fieldData[field.loop.name].join('');
					src = tmpSearchResult.nextSrc;

				}else if( field.if ){
					// if field
					// is_set に指定されたフィールドに値があったら、という評価ロジックを取り急ぎ実装。
					// もうちょっとマシな条件の書き方がありそうな気がするが、あとで考える。
					var tmpSearchResult = searchEndTag( src, 'if' );
					src = '';
					if( _this.nameSpace.vars[field.if.is_set] && px.php.trim(_this.nameSpace.vars[field.if.is_set].val).length ){
						src += tmpSearchResult.content;
					}
					src += tmpSearchResult.nextSrc;

				}else if( field.echo ){
					// echo field
					if( _this.nameSpace.vars[field.echo.ref] && _this.nameSpace.vars[field.echo.ref].val ){
						rtn += _this.nameSpace.vars[field.echo.ref].val;
					}

				}

			}
			return rtn;
		}

		/**
		 * テンプレートを解析する
		 */
		function parseTpl(src, _this, _topThis, cb){
			cb = cb||function(){};
			src = JSON.parse( JSON.stringify( src ) );
			_this.template = src;
			_this.info = {
				name: null
			};

			if( _this.path && px.utils.isDirectory( _this.path ) ){
				if( px.utils.isFile( _this.path+'/info.json' ) ){
					var tmpJson = JSON.parse( px.fs.readFileSync( _this.path+'/info.json' ) );
					if( tmpJson.name ){
						_this.info.name = tmpJson.name;
					}
				}
				if( px.utils.isFile( _this.path+'/thumb.png' ) ){
					_this.thumb = 'data:image/png;base64,'+px.utils.base64encode( px.fs.readFileSync( _this.path+'/thumb.png' ) );
				}
			}

			_this.isRootElement = (function(tplSrc){
				// 単一のルート要素を持っているかどうか判定。
				tplSrc = JSON.parse( JSON.stringify(tplSrc) );
				tplSrc = tplSrc.replace( new RegExp('\\<\\!\\-\\-.*?\\-\\-\\>','g'), '' );
				tplSrc = tplSrc.replace( new RegExp('\\{\\&.*?\\&\\}','g'), '' );
				tplSrc = tplSrc.replace( new RegExp('\r\n|\r|\n','g'), '' );
				tplSrc = tplSrc.replace( new RegExp('\t','g'), '' );
				tplSrc = tplSrc.replace( new RegExp('^[\s\r\n]*'), '' );
				tplSrc = tplSrc.replace( new RegExp('[\s\r\n]*$'), '' );
				if( tplSrc.length && tplSrc.indexOf('<') === 0 && tplSrc.match(new RegExp('\\>$')) ){
					var $jq = $(tplSrc);
					if( $jq.size() == 1 ){
						return true;
					}
				}
				return false;
			})(src);

			var field = null;
			while( 1 ){
				if( !src.match(new RegExp('^((?:.|\r|\n)*?)\\{\\&((?:.|\r|\n)*?)\\&\\}((?:.|\r|\n)*)$') ) ){
					break;
				}
				field = RegExp.$2;
				src = RegExp.$3;

				field = JSON.parse( field );
				if( field.input ){
					_this.fields[field.input.name] = field.input;
					_this.fields[field.input.name].fieldType = 'input';
				}else if( field.module ){
					_this.fields[field.module.name] = field.module;
					_this.fields[field.module.name].fieldType = 'module';
				}else if( field.loop ){
					_this.fields[field.loop.name] = field.loop;
					_this.fields[field.loop.name].fieldType = 'loop';
					var tmpSearchResult = searchEndTag( src, 'loop' );
					if( typeof(_this.subModule) !== typeof({}) ){
						_this.subModule = {};
					}
					_topThis.subModule[field.loop.name] = new classModTpl( _this.id, function(){}, {
						"src": tmpSearchResult.content,
						"subModName": field.loop.name,
						"topThis":_topThis
					} );
					src = tmpSearchResult.nextSrc;
				}else if( field == 'endloop' ){
					// ループ構造の閉じタグ
					// 本来ここは通らないはず。
					// ここを通る場合は、対応する開始タグがない endloop がある場合。
				}else if( field.if ){
					// _this.fields[field.if.name] = field.if;
					// _this.fields[field.if.name].fieldType = 'if';
					// var tmpSearchResult = searchEndTag( src, 'if' );
					// if( typeof(_this.subModule) !== typeof({}) ){
					// 	_this.subModule = {};
					// }
					// _topThis.subModule[field.if.name] = new classModTpl( _this.id, function(){}, {
					// 	"src": tmpSearchResult.content,
					// 	"subModName": field.if.name,
					// 	"topThis":_topThis
					// } );
					// src = tmpSearchResult.nextSrc;
				}else if( field == 'endif' ){
					// 分岐構造の閉じタグ
					// 本来ここは通らないはず。
					// ここを通る場合は、対応する開始タグがない endloop がある場合。
				}else if( field.echo ){
					// _this.fields[field.echo.name] = field.echo;
					// _this.fields[field.echo.name].fieldType = 'echo';
				}
			}
			cb();
		}

		if( modId == '_sys/root' ){
			parseTpl( '{&{"module":{"name":"main"}}&}', _this, _this, cb );
		}else if( modId == '_sys/unknown' ){
			parseTpl( '<div style="background:#f00;padding:10px;color:#fff;text-align:center;border:1px solid #fdd;">[ERROR] 未知のモジュールテンプレートです。<!-- .error --></div>', _this, _this, cb );
		}else if( modId == '_sys/html' ){
			parseTpl( '{&{"input":{"type":"html","name":"main"}}&}', _this, _this, cb );
		}else if( typeof(opt.src) === typeof('') ){
			parseTpl( opt.src, this, opt.topThis, cb );
		}else if( this.path ){
			var tmpTplSrc = px.fs.readFileSync( this.path+'/template.html' );
			if( !tmpTplSrc ){
				tmpTplSrc = '<div style="background:#f00;padding:10px;color:#fff;text-align:center;border:1px solid #fdd;">[ERROR] モジュールテンプレートの読み込みエラーです。<!-- .error --></div>';
			}
			tmpTplSrc = JSON.parse( JSON.stringify( tmpTplSrc.toString() ) );
			parseTpl( tmpTplSrc, this, this, cb );
		}

		return;
	}

	/**
	 * モジュールを取得
	 */
	this.get = function( modId, subModName ){
		var rtn = _modTpls[_modTplsIdMap[modId]];
		if( typeof( rtn ) !== typeof({}) ){
			rtn = false;
		}
		if( typeof(subModName) === typeof('') ){
			return rtn.subModule[subModName];
		}
		return rtn;
	}

	/**
	 * すべてのモジュールを取得
	 */
	this.getAll = function(){
		return _modTpls;
	}



})(window.px, window.contApp);