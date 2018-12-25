window.px = window.parent.px;
window.contApp = new (function( px ){
	var _this = this;
	var _pj = px.getCurrentProject();
	var $elms = {};
	$elms.editor = $('<div>');

	/**
	 * 初期化
	 */
	$(window).on('load', function(){

		$(window).on('resize', function(){
			onWindowResize();
		});
	});

	/**
	 * ウィンドウリサイズイベントハンドラ
	 */
	function onWindowResize(){
		$elms.editor
			.css({
				'height': $(window).innerHeight() - 0
			})
		;
	}

})( window.parent.px );
