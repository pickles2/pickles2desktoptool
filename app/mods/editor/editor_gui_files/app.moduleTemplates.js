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
		// _pathBase = pathBase;
		// console.log(pathsModTpl);
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
	function classModTpl( modId, cb ){
		var _this = this;
		this.id = modId;
		this.path = null;
		if( !contApp.moduleTemplates.isSystemMod(modId) ){
			this.path = px.fs.realpathSync( getPathModTpl(modId) );
		}
		this.fields = {};

		/**
		 * 値を挿入して返す
		 */
		this.bind = function( fieldData ){
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
					switch( field.input.type ){
						case 'module':
							rtn += fieldData[field.input.name].join('');
							break;
						case 'markdown':
							var mdData = fieldData[field.input.name];
							if(typeof(mdData)===typeof('')) mdData = px.utils.markdown( mdData );
							rtn += mdData;
							break;
						default:
							rtn += fieldData[field.input.name];
							break;
					}
				}else if( field.loop ){
					// UTODO: ？？？？？？
					console.log( 'debug: UTODO: "loop" (ModTpl.bind)' );

				}
				// if( typeof(fieldData[field.input.name]) === typeof([]) ){
				// 	rtn += fieldData[field.input.name].join('');
				// }else{
				// 	rtn += fieldData[field.input.name];
				// }
				src = RegExp.$3;

			}
			return rtn;
		}

		/**
		 * テンプレートを解析する
		 */
		function parseTpl(src, _this, cb){
			cb = cb||function(){};
			src = JSON.parse( JSON.stringify( src ) );
			_this.template = src;

			/* 閉じタグを探す */
			function searchEndTag( src, fieldType ){
				var rtn = {
					childSrc: '',
					nextSrc: src
				};
				var depth = 0;
				while( 1 ){
					if( !rtn.nextSrc.match(new RegExp('^((?:.|\r|\n)*?)\\{\\&((?:.|\r|\n)*?)\\&\\}((?:.|\r|\n)*)$') ) ){
						break;
					}
					rtn.childSrc += RegExp.$1;
					var fieldSrc = RegExp.$2;
					var field = JSON.parse( fieldSrc );
					rtn.nextSrc = RegExp.$3;

					if( field == 'end'+fieldType ){
						if( depth ){
							depth --;
							rtn.childSrc += '{&'+fieldSrc+'&}';
							continue;
						}
						return rtn;
					}else if( field[fieldType] ){
						depth ++;
						rtn.childSrc += '{&'+fieldSrc+'&}';
						continue;
					}else{
						rtn.childSrc += '{&'+fieldSrc+'&}';
						continue;
					}
				}
				return rtn;
			}

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
				}else if( field.loop ){
					_this.fields[field.loop.name] = field.loop;
					_this.fields[field.loop.name].fieldType = 'loop';
					var tmpSearchResult = searchEndTag( src, 'loop' );
					_this.fields[field.loop.name].fields = {};
					parseTpl( tmpSearchResult.childSrc, _this.fields[field.loop.name], cb );
					src = tmpSearchResult.nextSrc;
				}else if( field == 'endloop' ){
					// ループ構造の閉じタグ
					// 本来ここは通らないはず。
					// ここを通る場合は、対応する開始タグがない loopend がある場合。
					console.log('debug: ERROR: "endloop" defined');
				}
			}
			cb();
		}

		if( modId == '_sys/root' ){
			parseTpl( '{&{"input":{"type":"module","name":"main"}}&}', _this, cb );
		}else if( modId == '_sys/unknown' ){
			parseTpl( '<div style="background:#f00;padding:10px;color:#fff;text-align:center;border:1px solid #fdd;">[ERROR] 未知のモジュールテンプレートです。<!-- .error --></div>', _this, cb );
		}else if( this.path ){
			px.fs.readFile( this.path+'/template.html', function( err, buffer ){
				if( err ){
					parseTpl( '<div style="background:#f00;padding:10px;color:#fff;text-align:center;border:1px solid #fdd;">[ERROR] モジュールテンプレートの読み込みエラーです。<!-- .error --></div>', _this, cb );
					return;
				}
				var src = buffer.toString();
				src = JSON.parse( JSON.stringify( src ) );
				parseTpl( src, _this, cb );
			} );
		}

		return;
	}

	/**
	 * モジュールを取得
	 */
	this.get = function( modId ){
		var rtn = _modTpls[_modTplsIdMap[modId]];
		if( typeof( _modTpls[_modTplsIdMap[modId]] ) !== typeof({}) ){
			rtn = false;
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