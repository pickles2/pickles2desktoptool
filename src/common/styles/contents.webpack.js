(function(){
	const $ = require('jquery');
	$(window).on('load', function(){
		window.parent.px.cancelDrop( window );
		if( window.parent.px.getAppearance() == 'dark' ){
			$('body').addClass('px2-darkmode');
		}
	});
})();
