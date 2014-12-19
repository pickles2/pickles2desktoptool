window.contApp.moduleTemplates = new(function(px, contApp){
	var _pathModTpl;
	var _modTpls = [];
	var _modTplsIdMap = {};

	/**
	 * システムテンプレートかどうか判断する
	 */
	function isSystemMod( modId ){
		if( !modId.match(new RegExp('^_sys\\/')) ){
			return false;
		}
		return true;
	}

	/**
	 * 初期化
	 */
	this.init = function( pathModTpl, cb ){
		_pathModTpl = pathModTpl;

		var modIdList = [];
		modIdList.push( '_sys/root' );
		modIdList.push( '_sys/unknown' );

		px.fs.readdir( _pathModTpl, function(err, data){
			px.utils.iterate(
				data,
				function( it, dirname1, idx ){
					px.fs.readdir( _pathModTpl+'/'+dirname1+'/', function(err, data){
						px.utils.iterate(
							data,
							function( it2, dirname2, idx2 ){
								if( !px.utils.isFile( _pathModTpl+'/'+dirname1+'/'+dirname2+'/template.html' ) ){
									it2.next();//テンプレートが未定義
									return;
								}
								modIdList.push( dirname1+'/'+dirname2 );
								it2.next();
							} ,
							function(){
								it.next();
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
							cb();
						}
					);
				}
			);
		} );

		return this;
	}// init()


	/**
	 * モジュールテンプレートオブジェクト
	 */
	function classModTpl( modId, cb ){
		var _this = this;
		this.id = modId;
		this.path = null;
		if( !isSystemMod(modId) ){
			this.path = px.fs.realpathSync(_pathModTpl+'/'+modId+'/');
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
				switch( field.input.type ){
					case 'module':
						rtn += fieldData[field.input.name].join('');
						break;
					case 'markdown':
						var mdData = fieldData[field.input.name];
						mdData = px.utils.markdown( mdData );
						rtn += mdData;
						break;
					default:
						rtn += fieldData[field.input.name];
						break;
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

		function parseTpl(src, cb){
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
				_this.fields[field.input.name] = field.input;
			}
			cb();
		}

		if( modId == '_sys/root' ){
			parseTpl( '{&{"input":{"type":"module","name":"main"}}&}', cb );
		}else if( modId == '_sys/unknown' ){
			parseTpl( '<div style="background:#f00;padding:10px;color:#fff;text-align:center;border:1px solid #fdd;">[ERROR] 未知のモジュールテンプレートです。<!-- .error --></div>', cb );
		}else if( this.path ){
			px.fs.readFile( this.path+'/template.html', function( err, buffer ){
				if( err ){
					parseTpl( '<div style="background:#f00;padding:10px;color:#fff;text-align:center;border:1px solid #fdd;">[ERROR] モジュールテンプレートの読み込みエラーです。<!-- .error --></div>', cb );
					return;
				}
				var src = buffer.toString();
				src = JSON.parse( JSON.stringify( src ) );
				parseTpl( src, cb );
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