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
		_pathsModTpl = JSON.parse(JSON.stringify(pathsModTpl));
		for( var modIdx in _pathsModTpl ){
			_pathsModTpl[modIdx] = px.fs.realpathSync( pathBase+'/'+_pathsModTpl[modIdx] );
		}

		var modIdList = [];
		modIdList.push( '_sys/root' );
		modIdList.push( '_sys/unknown' );

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
							px.utils.iterate(
								modIdList ,
								function( it3, dirname3, idx3 ){
									_modTplsIdMap[dirname3] = idx3;
									_modTpls[idx3] = new classModTpl( dirname3, function(){
										it3.next();
									} );
								} ,
								function(){
									it0.next();
								}
							);
						}
					);
				} );

			},
			function(){
				cb();
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
		this.path = null;
		if( !contApp.moduleTemplates.isSystemMod(modId) && !opt.src ){
			this.path = px.fs.realpathSync( getPathModTpl(modId) );
		}
		this.fields = {};

		if(opt.subModName){
			this.subModName = opt.subModName;
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
				if( field.input ){
					if( contApp.fieldDefinitions[field.input.type] ){
						// フィールドタイプ定義を呼び出す
						rtn += contApp.fieldDefinitions[field.input.type].bind( fieldData[field.input.name], mode );
					}else{
						// ↓未定義のフィールドタイプの場合のデフォルトの挙動
						rtn += contApp.fieldBase.bind( fieldData[field.input.name], mode );
					}
				}else if( field.module ){
					rtn += fieldData[field.module.name].join('');

				}else if( field.loop ){
					var tmpSearchResult = searchEndTag( src, 'loop' );
					rtn += fieldData[field.loop.name].join('');
					src = tmpSearchResult.nextSrc;

				}
				src = RegExp.$3;

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
					// ここを通る場合は、対応する開始タグがない loopend がある場合。
				}
			}
			cb();
		}

		if( modId == '_sys/root' ){
			parseTpl( '{&{"module":{"name":"main"}}&}', _this, _this, cb );
		}else if( modId == '_sys/unknown' ){
			parseTpl( '<div style="background:#f00;padding:10px;color:#fff;text-align:center;border:1px solid #fdd;">[ERROR] 未知のモジュールテンプレートです。<!-- .error --></div>', _this, _this, cb );
		}else if( typeof(opt.src) === typeof('') ){
			parseTpl( opt.src, _this, opt.topThis, cb );
		}else if( this.path ){
			px.fs.readFile( this.path+'/template.html', function( err, buffer ){
				if( err ){
					parseTpl( '<div style="background:#f00;padding:10px;color:#fff;text-align:center;border:1px solid #fdd;">[ERROR] モジュールテンプレートの読み込みエラーです。<!-- .error --></div>', _this, _this, cb );
					return;
				}
				var src = buffer.toString();
				src = JSON.parse( JSON.stringify( src ) );
				parseTpl( src, _this, _this, cb );
			} );
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