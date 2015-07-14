window.px2dtGuiEditor.moduleTemplates = new(function(px, px2dtGuiEditor){
	var _this = this;
	// var _pathBase;
	var _pathsModTpl;
	// var _pathModTpl;
	var _modTpls = [];
	var _modTplsIdMap = {};
	var _modPackages = {};

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
				px.log( 'module skiped: ' + pathBase+'/'+_pathsModTpl[modIdx] );
				continue;
			}
			_pathsModTpl[modIdx] = px.fs.realpathSync( pathBase+'/'+_pathsModTpl[modIdx] );
		}

		var modIdList = [];
		modIdList.push( {'id': '_sys/root'} );
		modIdList.push( {'id': '_sys/unknown'} );
		modIdList.push( {'id': '_sys/html'} );

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
										var pathTemplateDir = pathModTpl+'/'+dirname1+'/'+dirname2+'/';
										if( !px.utils.isDirectory( pathTemplateDir ) ){
											it2.next();//ディレクトリではなかった場合
											return;
										}
										if(
											!px.utils.isFile( pathTemplateDir+'template.html' )
											&& !px.utils.isFile( pathTemplateDir+'template.html.twig' )
										){
											px.log( 'template.html is not exists: ' + pathTemplateDir+'template.html' );
											it2.next();//テンプレートが未定義
											return;
										}
										if( !_modPackages[modIdx] ){
											_modPackages[modIdx] = {
												"id": modIdx,
												"name": modIdx,
												"contents":{}
											};
										}
										if( !_modPackages[modIdx].contents[dirname1] ){
											_modPackages[modIdx].contents[dirname1] = {
												"id": dirname1,
												"name": dirname1,
												"contents":[]
											};
										}
										_modPackages[modIdx].contents[dirname1].contents.push( modIdx+':'+dirname1+'/'+dirname2 );

										modIdList.push( {"id": modIdx+':'+dirname1+'/'+dirname2} );
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
					function( it3, modIdListRow, idx3 ){
						_modTplsIdMap[modIdListRow.id] = idx3;
						_modTpls[idx3] = new classModTpl( modIdListRow.id, function(){
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
		if( px2dtGuiEditor.moduleTemplates.isSystemMod(modId) ){
			return false;
		}
		modId.match( new RegExp('^([0-9a-zA-Z\\_\\-]+?)\\:(.*)$') );
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
		// console.log('classModTpl -> '+modId);
		// px.log('classModTpl -> '+modId);
		var _this = this;
		cb = cb || function(){};
		opt = opt || {};

		this.id = modId;
		this.isSingleRootElement = false;
		this.path = null;
		if( !px2dtGuiEditor.moduleTemplates.isSystemMod(modId) && typeof(opt.src) !== typeof('') ){
			this.path = px.fs.realpathSync( getPathModTpl(modId) );
		}
		this.fields = {};

		if(opt.subModName){
			this.subModName = opt.subModName;
		}
		if( opt.topThis ){
			this.topThis = opt.topThis;
			this.nameSpace = opt.topThis.nameSpace;
		}else{
			this.topThis = this;
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
		 * テンプレートに値を挿入して返す
		 */
		this.bind = function( fieldData, mode ){
			var src = this.template;
			var field = {};
			var rtn = '';

			// Twigテンプレート
			if( this.topThis.templateType == 'twig' ){
				// console.log(this.id + '/' + this.subModName);
				var tplDataObj = {};
				for( var fieldName in this.fields ){
					field = this.fields[fieldName];

					if( field.fieldType == 'input' ){
						// input field
						var tmpVal = '';
						if( px2dtGuiEditor.fieldDefinitions[field.type] ){
							// フィールドタイプ定義を呼び出す
							tmpVal += px2dtGuiEditor.fieldDefinitions[field.type].bind( fieldData[field.name], mode, field );
						}else{
							// ↓未定義のフィールドタイプの場合のデフォルトの挙動
							tmpVal += px2dtGuiEditor.fieldBase.bind( fieldData[field.name], mode, field );
						}
						if( !field.hidden ){//← "hidden": true だったら、非表示(=出力しない)
							tplDataObj[field.name] = tmpVal;
						}
						_this.nameSpace.vars[field.name] = {
							fieldType: "input", type: field.type, val: tmpVal
						}

					}else if( field.fieldType == 'module' ){
						// module field
						tplDataObj[field.name] = fieldData[field.name].join('');

					}else if( field.fieldType == 'loop' ){
						// loop field
						tplDataObj[field.name] = fieldData[field.name];

					}
				}

				// 環境変数登録
				tplDataObj._ENV = {
					"mode": mode
				};

				try {
					rtn = twig({
						data: src
					}).render(tplDataObj);
				} catch (e) {
					rtn = '<div class="error">Twig Rendering ERROR.</div>'
				}

				// rtn = px.twig.compile(src, {
				// 	"filename": this.templateFilename,
				// 	"settings": {
				// 		"twig options": {
				// 			"strict_variables": false,
				// 			"autoescape": false,
				// 			"allowInlineIncludes":false,
				// 			"rethrow":false
				// 		}
				// 	}
				// })(tplDataObj);


			}else{
				while( 1 ){
					if( !src.match( new RegExp('^((?:.|\r|\n)*?)\\{\\&((?:.|\r|\n)*?)\\&\\}((?:.|\r|\n)*)$') ) ){
						rtn += src;
						break;
					}
					rtn += RegExp.$1;
					field = RegExp.$2;
					try{
						field = JSON.parse( field );
					}catch(e){
						field = {'input':{
							'type':'html',
							'name':'__error__'
						}};
					}
					src = RegExp.$3;

					if( typeof(field) == typeof('') ){
						// end系：無視
					}else if( field.input ){
						// input field
						var tmpVal = '';
						if( px2dtGuiEditor.fieldDefinitions[field.input.type] ){
							// フィールドタイプ定義を呼び出す
							tmpVal += px2dtGuiEditor.fieldDefinitions[field.input.type].bind( fieldData[field.input.name], mode, field.input );
						}else{
							// ↓未定義のフィールドタイプの場合のデフォルトの挙動
							tmpVal += px2dtGuiEditor.fieldBase.bind( fieldData[field.input.name], mode, field.input );
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
						// → 2015-04-25: cond のルールを追加。
						var tmpSearchResult = searchEndTag( src, 'if' );
						var boolResult = false;
						src = '';
						if( field.if.cond && typeof(field.if.cond) == typeof([]) ){
							// cond に、2次元配列を受け取った場合。
							// 1次元目は or 条件、2次元目は and 条件で評価する。
							for( var condIdx in field.if.cond ){
								var condBool = true;
								for( var condIdx2 in field.if.cond[condIdx] ){
									var tmpCond = field.if.cond[condIdx][condIdx2];
									if( tmpCond.match( new RegExp('^([\\s\\S]*?)\\:([\\s\\S]*)$') ) ){
										var tmpMethod = px.php.trim(RegExp.$1);
										var tmpValue = px.php.trim(RegExp.$2);

										if( tmpMethod == 'is_set' ){
											if( !_this.nameSpace.vars[tmpValue] || !px.php.trim(_this.nameSpace.vars[tmpValue].val).length ){
												condBool = false;
												break;
											}
										}else if( tmpMethod == 'is_mode' ){
											if( tmpValue != mode ){
												condBool = false;
												break;
											}
										}
									}else if( tmpCond.match( new RegExp('^([\\s\\S]*?)(\\!\\=|\\=\\=)([\\s\\S]*)$') ) ){
										var tmpValue = px.php.trim(RegExp.$1);
										var tmpOpe = px.php.trim(RegExp.$2);
										var tmpDiff = px.php.trim(RegExp.$3);
										if( tmpOpe == '==' ){
											if( _this.nameSpace.vars[tmpValue].val != tmpDiff ){
												condBool = false;
												break;
											}
										}else if( tmpOpe == '!=' ){
											if( _this.nameSpace.vars[tmpValue].val == tmpDiff ){
												condBool = false;
												break;
											}
										}
									}

								}
								if( condBool ){
									boolResult = true;
									break;
								}
							}
						}
						if( _this.nameSpace.vars[field.if.is_set] && px.php.trim(_this.nameSpace.vars[field.if.is_set].val).length ){
							boolResult = true;
						}
						if( boolResult ){
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

			}

			return rtn;
		} // bind()

		/**
		 * テンプレートを解析する
		 */
		function parseTpl(src, _this, _topThis, cb){
			cb = cb||function(){};
			if(src !== null){
				src = JSON.parse( JSON.stringify( src ) );
				_this.template = src;
			}
			_this.info = {
				name: null
			};

			if( _this.path && px.utils.isDirectory( _this.path ) ){
				if( px.utils.isFile( _this.path+'/info.json' ) ){
					var tmpJson = {};
					try{
						tmpJson = JSON.parse( px.fs.readFileSync( _this.path+'/info.json' ) );
					}catch(e){
						px.log( 'module info.json parse error: ' + _this.path+'/info.json' );
					}
					if( tmpJson.name ){
						_this.info.name = tmpJson.name;
					}
					if( tmpJson.interface ){
						if( tmpJson.interface.fields ){
							_this.fields = tmpJson.interface.fields;
							for( var tmpIdx in _this.fields ){
								// name属性を自動補完
								_this.fields[tmpIdx].name = tmpIdx;
							}
						}
						if( tmpJson.interface.subModule ){
							_this.subModule = tmpJson.interface.subModule;
							for( var tmpIdx in _this.subModule ){
								for( var tmpIdx2 in _this.subModule[tmpIdx].fields ){
									// name属性を自動補完
									_this.subModule[tmpIdx].fields[tmpIdx2].name = tmpIdx2;
								}
							}
						}
					}
				}
				if( px.utils.isFile( _this.path+'/thumb.png' ) ){
					_this.thumb = 'data:image/png;base64,'+px.utils.base64encode( px.fs.readFileSync( _this.path+'/thumb.png' ) );
				}
			}

			if( src ){
				_this.isSingleRootElement = (function(tplSrc){
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
			}

			var field = null;

			if( _topThis.templateType == 'twig' ){
				// Twigテンプレート
				if( _this.subModName ){
					_this.fields = _topThis.subModule[_this.subModName].fields;
				}
				for( var tmpFieldName in _this.fields ){
					if( _this.fields[tmpFieldName].fieldType == 'loop' ){
						if( typeof(_this.subModule) !== typeof({}) ){
							_this.subModule = {};
						}
						_topThis.subModule[tmpFieldName] = new classModTpl( _this.id, function(){}, {
							"src": null,
							"subModName": tmpFieldName,
							"topThis":_topThis
						} );
					}
				}

			}else{
				while( 1 ){
					if( !src.match(new RegExp('^((?:.|\r|\n)*?)\\{\\&((?:.|\r|\n)*?)\\&\\}((?:.|\r|\n)*)$') ) ){
						break;
					}
					field = RegExp.$2;
					src = RegExp.$3;

					try{
						field = JSON.parse( field );
					}catch(e){
						alert('module template parse error: ' + _this.templateFilename);
						px.log( 'module template parse error: ' + _this.templateFilename );
						field = {'input':{
							'type':'html',
							'name':'__error__'
						}};
					}
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
			}
			// console.log(_this.fields);
			cb();
		} // parseTpl()

		if( modId == '_sys/root' ){
			parseTpl( '{&{"module":{"name":"main"}}&}', _this, _this, cb );
		}else if( modId == '_sys/unknown' ){
			parseTpl( '<div style="background:#f00;padding:10px;color:#fff;text-align:center;border:1px solid #fdd;">[ERROR] 未知のモジュールテンプレートです。<!-- .error --></div>', _this, _this, cb );
		}else if( modId == '_sys/html' ){
			parseTpl( '{&{"input":{"type":"html","name":"main"}}&}', _this, _this, cb );
		}else if( typeof(opt.src) === typeof('') ){
			parseTpl( opt.src, this, opt.topThis, cb );
		}else if( this.topThis.templateType == 'twig' && typeof(this.subModName) == typeof('') ){
			parseTpl( null, this, opt.topThis, cb );
		}else if( this.path ){
			var tmpTplSrc = null;
			if( px.utils.isFile( this.path+'/template.html' ) ){
				this.templateFilename = this.path+'/template.html';
				this.templateType = 'px2dtGuiEditor';
				tmpTplSrc = px.fs.readFileSync( this.templateFilename );
			}else if( px.utils.isFile( this.path+'/template.html.twig' ) ){
				this.templateFilename = this.path+'/template.html.twig';
				this.templateType = 'twig';
				tmpTplSrc = px.fs.readFileSync( this.templateFilename );
			}
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

	/**
	 * パッケージの一覧を得る
	 */
	this.getPackages = function(){
		var rtn = _modPackages;
		return rtn;
	}

	/**
	 * パッケージに含まれるグループの一覧を得る
	 */
	this.getGroups = function( packageId ){
		var rtn = _modPackages[packageId].contents;
		return rtn;
	}

})(window.px, window.px2dtGuiEditor);
