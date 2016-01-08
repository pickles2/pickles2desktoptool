window.px = window.parent.px;
window.contApp = new (function( px ){
	var _this = this;
	var it79 = require('iterate79');
	var php = require('phpjs');
	var data = {};
	var param = {};
	var broccoli = new Broccoli();
	var _pj;

	var $elmButtons,
		$elmCanvas,
		$elmModulePalette,
		$elmInstanceTreeView,
		$elmInstancePathView;

	var resizeTimer;
	var _Keypress = {};
	this.Keypress = _Keypress;

	function getCmdKeyName(){
		switch(px.getPlatform()){
			case 'mac':
				return 'cmd';
				break;
			default:
				return 'ctrl';
				break;
		}
		return 'ctrl';
	}

	$(function(){

		it79.fnc(data, [
			function(it1, data){
				px.cancelDrop( window );

				param = px.utils.parseUriParam( window.location.href );
				// console.log( param );

				_pj = px.getCurrentProject();

				it1.next(data);
			} ,
			// function(it1, data){
			// 	// getting Project Info
			// 	main.socket.send(
			// 		'getProject',
			// 		{'projectIdx': data.projectIdx},
			// 		function(pjInfo){
			// 			data.projectInfo = pjInfo;
			// 			// console.log(data);
			// 			it1.next(data);
			// 		}
			// 	);
			// } ,
			function(it1, data){
				px.preview.serverStandby( function(){
					$('#canvas').attr({
						"data-broccoli-preview": px.preview.getUrl( param.page_path )
					});
					it1.next(data);
				} );
			} ,
			function(it1, data){
				// broccoli-html-editor standby.
				$elmButtons = $('#buttons');
				$elmCanvas = $('#canvas');
				$elmModulePalette = $('#palette');
				$elmInstanceTreeView = $('#instanceTreeView');
				$elmInstancePathView = $('#instancePathView');
				fitWindowSize(function(){
					it1.next(data);
				});
			} ,
			function(it1, data){
				// broccoli-html-editor standby.
				broccoli.init(
					{
						'elmCanvas': $elmCanvas.get(0),
						'elmModulePalette': $elmModulePalette.get(0),
						'elmInstanceTreeView': $elmInstanceTreeView.get(0),
						'elmInstancePathView': $elmInstancePathView.get(0),
						'contents_area_selector': _pj.getConfig().plugins.px2dt.contents_area_selector,
						'contents_bowl_name_by': _pj.getConfig().plugins.px2dt.contents_bowl_name_by,
						'customFields': {
							// 'psd': window.BroccoliFieldPSD,
							'table': window.BroccoliFieldTable
						},
						'gpiBridge': function(api, options, callback){
							// GPI(General Purpose Interface) Bridge
							// broccoliは、バックグラウンドで様々なデータ通信を行います。
							// GPIは、これらのデータ通信を行うための汎用的なAPIです。
							contAppBroccoliServer(px, api, options, function(rtn){
								console.log(rtn);
								callback(rtn);
							});
							return;
						}
					} ,
					function(){
						// 初期化が完了すると呼びだされるコールバック関数です。
						it1.next(data);
					}
				);
			} ,
			function(it1, _data){
				$elmButtons
					.find('button.cont_btn_save_and_close')
						.click( function(){
							broccoli.saveContents( function(){
								px.message( 'ページを保存しました。' );
								window.parent.contApp.closeEditor();
							} );
						} )
				;
				$elmButtons
					.find('button.cont_btn_save_and_preview_in_browser')
						.click(function(){
							broccoli.saveContents( function(){
								px.message( 'ページを保存しました。' );
								px.preview.serverStandby(function(){
									px.utils.openURL( px.preview.getUrl( param.page_path ) );
								});
							} );
						})
				;
				it1.next(_data);
			} ,
			function(it1, _data){
				// キーボードイベントセット
				_Keypress = new window.keypress.Listener();
				this.Keypress = _Keypress;
				_Keypress.simple_combo("backspace", function(e) {
					switch(e.target.tagName.toLowerCase()){
						case 'input': case 'textarea':
						return true; break;
					}
					e.preventDefault();
					broccoli.remove(function(){
						console.log('remove instance done.');
					});
				});
				_Keypress.simple_combo("delete", function(e) {
					switch(e.target.tagName.toLowerCase()){
						case 'input': case 'textarea':
						return true; break;
					}
					e.preventDefault();
					broccoli.remove(function(){
						console.log('remove instance done.');
					});
				});
				_Keypress.simple_combo("escape", function(e) {
					switch(e.target.tagName.toLowerCase()){
						case 'input': case 'textarea':
						return true; break;
					}
					e.preventDefault();
					broccoli.unselectInstance();
				});
				_Keypress.simple_combo(getCmdKeyName()+" c", function(e) {
					switch(e.target.tagName.toLowerCase()){
						case 'input': case 'textarea':
						return true; break;
					}
					e.preventDefault();
					broccoli.copy(function(){
						console.log('copy instance done.');
					});
				});
				_Keypress.simple_combo(getCmdKeyName()+" v", function(e) {
					switch(e.target.tagName.toLowerCase()){
						case 'input': case 'textarea':
						return true; break;
					}
					e.preventDefault();
					broccoli.paste(function(){
						console.log('paste instance done.');
					});
				});
				_Keypress.simple_combo(getCmdKeyName()+" z", function(e) {
					switch(e.target.tagName.toLowerCase()){
						case 'input': case 'textarea':
						return true; break;
					}
					e.preventDefault();
					broccoli.historyBack(function(){
						console.log('historyBack done.');
					});
				});
				_Keypress.simple_combo(getCmdKeyName()+" y", function(e) {
					switch(e.target.tagName.toLowerCase()){
						case 'input': case 'textarea':
						return true; break;
					}
					e.preventDefault();
					broccoli.historyGo(function(){
						console.log('historyGo done.');
					});
				});
				// _Keypress.simple_combo(getCmdKeyName()+" x", function(e) {
				// 	px.message('cmd x');
				// 	e.preventDefault();
				// });

				it1.next(_data);
			} ,
			function(it1, _data){

				$(window).resize(function(){
					// このメソッドは、canvasの再描画を行います。
					// ウィンドウサイズが変更された際に、UIを再描画するよう命令しています。
					onWindowResized();
				}).resize();

				it1.next(_data);
			} ,
			function(it1, _data){
				px.progress.close();
				// data = _data;
				// console.log(data);
				console.log('Started!');
			}
		]);

	});

	function onWindowResized(){
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
		var h = $(window).innerHeight() - $elmInstancePathView.outerHeight();
		// console.log(h);
		$('.cont_outline').css( {'height': h} );
		$elmCanvas.css( {'height': h} );
		$elmModulePalette.css( {'height': h - $elmButtons.outerHeight()} );
		$elmButtons.css( {'top': h - $elmButtons.outerHeight()} );
		$elmInstanceTreeView.css( {'height': h} );
		callback();
	}

})( window.parent.px );
