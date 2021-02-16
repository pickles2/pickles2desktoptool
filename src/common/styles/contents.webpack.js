(function(){
	const $ = require('jquery');
	$(window).on('load', function(){
		window.parent.px.cancelDrop( window );
		// if( !window.parent.px.isLightMode() ){
		// 	$('body').addClass('px2-darkmode');
		// }
	});
})();
