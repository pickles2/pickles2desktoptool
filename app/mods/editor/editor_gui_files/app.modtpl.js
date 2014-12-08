window.contApp.modtpl = new(function(px, contApp){
	var _cont_pathModTpl;

	this.init = function( pathModTpl, cb ){
		_cont_pathModTpl = pathModTpl;

		// UTODO: まだ作ってない↓
		setTimeout( function(){
			cb();
		}, 1000 );
	}


})(window.px, window.contApp);