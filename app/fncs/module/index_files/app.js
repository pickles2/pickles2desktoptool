window.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }
	var _this = this;

	/**
	 * 初期化
	 */
	function init(){
	}// init()

	/**
	 * ウィンドウリサイズイベントハンドラ
	 */
	function onWindowResize(){
	}

	$(function(){
		init();
		$(window).resize(function(){
			onWindowResize();
		});

	});

})( window.parent.px );
