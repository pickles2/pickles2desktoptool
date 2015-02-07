$(window).load(function(){

	/**
	 * プレビューウィンドウ
	 */
	var update_preview_frame = function(){
		var $winframe = $('.preview_window_frame');
		$winframe.find('iframe')
			.css({
	// margin: -13px -2px -13px -57px;
				width: $winframe.outerWidth() -5 -15,
				height: $winframe.outerHeight() -50 -5
			})
		;
	}
	update_preview_frame();
	$(window).resize( update_preview_frame );


});