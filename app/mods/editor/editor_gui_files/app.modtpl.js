window.contApp.modTpl = new(function(px, contApp){
	var _pathModTpl;
	var _modTpls = [];
	var _modTplsIdMap = {};

	/**
	 * 初期化
	 */
	this.init = function( pathModTpl, cb ){
		_pathModTpl = pathModTpl;

		var modIdList = [];
		modIdList.push( '_root' );

		px.fs.readdir( _pathModTpl, function(err, data){
			px.utils.iterate(
				data,
				function( it, dirname1, idx ){
					px.fs.readdir( _pathModTpl+'/'+dirname1+'/', function(err, data){
						px.utils.iterate(
							data,
							function( it2, dirname2, idx2 ){
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
		if( modId !== '_root' ){
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
				if( typeof(fieldData[field.input.name]) === typeof([]) ){
					rtn += fieldData[field.input.name].join('');
				}else{
					rtn += fieldData[field.input.name];
				}
				src = RegExp.$3;

			}
			return rtn;
		}

		function parseTpl(src){
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

		if( modId == '_root' ){
			parseTpl( '{&{"input":{"type":"module","name":"main"}}&}' );
		}else if( this.path ){
			px.fs.readFile( this.path+'/template.html', function( err, buffer ){
				var src = buffer.toString();
				src = JSON.parse( JSON.stringify( src ) );
				parseTpl( src );
			} );
		}

		return;
	}

	/**
	 * モジュールを取得
	 */
	this.get = function( modId ){
		return _modTpls[_modTplsIdMap[modId]];
	}

	/**
	 * すべてのモジュールを取得
	 */
	this.getAll = function(){
		return _modTpls;
	}



})(window.px, window.contApp);