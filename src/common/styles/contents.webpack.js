(function(){
	const $ = require('jquery');
	$(window).on('load', function(){
		window.parent.px.cancelDrop( window );
	});
})();
