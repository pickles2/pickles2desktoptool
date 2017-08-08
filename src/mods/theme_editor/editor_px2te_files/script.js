window.px = window.parent.px;
window.contApp = new (function( px ){
	var _this = this;
	var it79 = require('iterate79');
	var utils79 = require('utils79');
	var php = require('phpjs');
	var _pj = px.getCurrentProject();
	var broccoli = new Broccoli();
	var resizeTimer;

	var _param = px.utils.parseUriParam( window.location.href );

	function resizeEvent(){
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function(){
			fitWindowSize(function(){
				if(broccoli.redraw){
					broccoli.redraw();
				}
			});
		}, 500);
		return;
	}
	function fitWindowSize(callback){
		callback = callback||function(){};
		callback();
		return;
	}

	function init(){
		it79.fnc({}, [
			function(it1, data){
				px.cancelDrop( window );
				fitWindowSize(function(){
					it1.next(data);
				});

			},
			function(it1, data){

				var _page_url = px.preview.getUrl( '/'+encodeURIComponent(_param.layout_id)+'.html' );
				var elmA = document.createElement('a');
				elmA.href = _page_url;

				window.contAppBroccoliServer(px, '/'+encodeURIComponent(_param.layout_id)+'.html', function(px2ceServer){
					broccoli.init(
						{
							'page_path': '/'+encodeURIComponent(_param.layout_id)+'.html' , // <- 編集対象ページのパス
							'elmCanvas': document.getElementById('canvas'), // <- 編集画面を描画するための器となる要素
							'preview':{ // プレビュー用サーバーの情報を設定します。
								'origin': elmA.origin
							},
							'customFields': _pj.mkBroccoliCustomFieldOptionFrontend(window, false),
							'lang': px.getDb().language,
							'gpiBridge': function(input, callback){
								// GPI(General Purpose Interface) Bridge
								// broccoliは、バックグラウンドで様々なデータ通信を行います。
								// GPIは、これらのデータ通信を行うための汎用的なAPIです。
								px2ceServer.gpi(
									input,
									function(rtn){
										callback(rtn);
									}
								);
								return;
							},
							'clipboard': px.clipboard,
							'complete': function(){
								window.parent.contApp.closeEditor();
							},
							'onClickContentsLink': function( url, data ){
							},
							'onMessage': function( message ){
								px.message(message);
							}
						},
						function(){
							// スタンバイ完了したら呼び出されるコールバックメソッドです。
							it1.next(data);
						}
					);
				});
			} ,
			function(it1, _data){
				px.progress.close();
				console.info('standby!!');
			}
		]);

		return;
	}

	$(function(){
		init();
	})
	$(window).resize(function(){
		resizeEvent();
	});

})( window.parent.px );
