(function(px, $){
	var $msgBox = $('<div>');
	$msgBox
		.css('position', 'fixed')
		.css('top', 0)
		.css('left', 0)
		.css('height', 'auto')
		.css('width', '100%')
		.css('z-index', 10000)
	;

	px.message = function( message, opt ){
		opt = opt || {};
		opt.complete = opt.complete || function(){};
		var $newMsg = $('<div>')
			.text(message)
			.css({
				'background': '#ffd',
				'text-align': 'center',
				'border': '1px solid #f93',
				'color': '#f93',
				'padding': 4,
				'margin': 4
			})
			.hide()
		;
		$msgBox.append(
			$newMsg
				.hide()
				.fadeIn('slow', function(){
					setTimeout(function(){
						$newMsg
							.animate({
								"font-size": 0 ,
								"opacity": 0.5 ,
								"height": 0 ,
								'padding': 0,
								'margin-bottom': 0
							}, {
								duration: "slow",
								easing: "linear",
								complete: function(){
									$newMsg.remove();
									opt.complete();
								}
							})
						;
					}, 3000);
				})
		);
		return this;
	}

	$(function(){
		$('body').append($msgBox);
	});

})(px, jQuery);