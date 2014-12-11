window.contApp.modTpl = new(function(px, contApp){
	var _pathModTpl;
	var _modTpls = [];
	var _modTplsIdMap = {};

	/**
	 * 初期化
	 */
	this.init = function( pathModTpl, cb ){
		_pathModTpl = pathModTpl;

		px.fs.readdir( _pathModTpl, function(err, data){
			px.utils.iterate(
				data,
				function( it, dirname1, idx ){
					px.fs.readdir( _pathModTpl+'/'+dirname1+'/', function(err, data){
						px.utils.iterate(
							data,
							function( it2, dirname2, idx2 ){
								_modTpls.push( new classModTpl( dirname1+'/'+dirname2, function(){
									_modTplsIdMap[dirname1+'/'+dirname2] = _modTpls.length-1;
									it2.next();
								} ) );
							} ,
							function(){
								it.next();
							}
						);
					} );
				} ,
				function(){
					cb();
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
		this.path = px.fs.realpathSync(_pathModTpl+'/'+modId+'/');
		this.fields = {};
		px.fs.readFile( this.path+'/template.html', function( err, buffer ){
			var src = buffer.toString();
			src = JSON.parse( JSON.stringify( src ) );
			_this.template = src;

			var field = null;
			while( 1 ){
				if( !src.match(new RegExp('^(.*?)\\{\\&(.*?)\\&\\}(.*)$', 'm')) ){
					break;
				}
				field = RegExp.$2;
				src = RegExp.$3;

				field = JSON.parse( field );
				_this.fields[field.input.name] = field.input;
			}

			cb();
		} );
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