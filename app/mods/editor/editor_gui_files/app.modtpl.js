window.contApp.modtpl = new(function(px, contApp){
	var _pathModTpl;
	var _modtpls = [];
	var _modtplsIdMap = {};

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
								_modtpls.push( new classModTpl( dirname1+'/'+dirname2, function(){
									_modtplsIdMap[dirname1+'/'+dirname2] = _modtpls.length-1;
									it2.next();
								} ) );
								// _modtpls[dirname1+'/'+dirname2] = new classModTpl( dirname1+'/'+dirname2, function(){
								// 	it2.next();
								// } );
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
		px.fs.readFile( this.path+'/template.html', function( err, buffer ){
			var src = buffer.toString();
			src = JSON.parse( JSON.stringify( src ) );
			_this.template = src;
			cb();
		} );
		return;
	}

	/**
	 * モジュールを取得
	 */
	this.get = function( modId ){
		return _modtpls[_modtplsIdMap[modId]];
	}

	/**
	 * すべてのモジュールを取得
	 */
	this.getAll = function(){
		return _modtpls;
	}



})(window.px, window.contApp);