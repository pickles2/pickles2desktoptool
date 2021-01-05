window.main = window.parent.main;
window.contApp = new (function(){
	if( !main ){ alert('px が宣言されていません。'); }
	var _this = this;
	var it79 = require('iterate79');
	var pj = main.getCurrentProject();
	var getParams = (new URL(document.location)).searchParams;
	var customConsoleExtensionId;
	var $elm;


	/**
	 * 画面を初期化する
	 */
	function init( callback ){
		it79.fnc({}, [
			function(it1){
				customConsoleExtensionId = getParams.get('cce_id');
				$elm = $('.contents');
				it1.next();
			},
			function(it1){
				$elm.text(customConsoleExtensionId);
				it1.next();
			},
			function(it1){
				// --------------------------------------
				// スタンバイ完了
				callback();
			}
		]);
	}





	/**
	 * ウィンドウリサイズイベントハンドラ
	 */
	function onWindowResize(){
	}

	/**
	 * イベント
	 */
	$(window).on('load', function(){
		init(function(){
			$(window).on('resize', function(){
				onWindowResize();
			});
			console.log('Standby.');
		});
	});

})();
