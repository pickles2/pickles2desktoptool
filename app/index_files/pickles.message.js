(function(px, $){

	px.message = function( message, opt ){
		opt = opt || {};
		opt.complete = opt.complete || function(){};

		window.px2style.flashMessage(message, opt.complete);

		return this;
	}

})(px, jQuery);
