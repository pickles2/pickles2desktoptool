function initContentsCSS( $html ){

	/**
	 * プレビューウィンドウ
	 */
	var update_preview_frame = function(){
		var $winframe = $html.find('.preview_window_frame');
		$winframe.find('iframe')
			.css({
				width: $winframe.outerWidth() -5 -15,
				height: $winframe.outerHeight() -50 -5
			})
		;
	}
	update_preview_frame($html);
	$(window).resize( function(){
		update_preview_frame($html);
	} );

}
$(window).load(function(){
	window.initContentsCSS( $('html') );
});