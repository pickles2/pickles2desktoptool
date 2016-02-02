window.px = window.parent.px;
window.contApp = new (function( px ){
	var _this = this;
	var it79 = require('iterate79');
	var php = require('phpjs');
	var data = {};
	var _param = {};
	var broccoli = new Broccoli();
	var _pj;

	var $elmTitleBar,
		$elmButtons,
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

				_param = px.utils.parseUriParam( window.location.href );
				// console.log( _param );

				_pj = px.getCurrentProject();

				it1.next(data);
			} ,
			function(it1, data){
				// getting pageInfo
				_pj.px2proj.get_page_info(
					_param.page_path,
					function(pageInfo){
						data.pageInfo = pageInfo;
						it1.next(data);
					}
				);
			} ,
			function(it1, data){
				px.preview.serverStandby( function(){
					$('.cont_canvas .cont_canvas--main').attr({
						"data-broccoli-preview": px.preview.getUrl( _param.page_path )
					});
					it1.next(data);
				} );
			} ,
			function(it1, data){
				// broccoli-html-editor standby.
				$elmTitleBar = $('.cont_title_bar');
				$elmButtons = $('.cont_buttons');
				$elmCanvas = $('.cont_canvas');
				$elmModulePalette = $('.cont_palette');
				$elmInstanceTreeView = $('.cont_instanceTreeView');
				$elmInstancePathView = $('.cont_instancePathView');
				fitWindowSize(function(){
					it1.next(data);
				});
			} ,
			function(it1, data){
				// broccoli-html-editor standby.
				broccoli.init(
					{
						'elmCanvas': $elmCanvas.find('.cont_canvas--main').get(0),
						'elmModulePalette': $elmModulePalette.get(0),
						'elmInstanceTreeView': $elmInstanceTreeView.get(0),
						'elmInstancePathView': $elmInstancePathView.get(0),
						'contents_area_selector': _pj.getConfig().plugins.px2dt.contents_area_selector,
						'contents_bowl_name_by': _pj.getConfig().plugins.px2dt.contents_bowl_name_by,
						'customFields': {
							'href': window.BroccoliFieldHref,
							// 'psd': window.BroccoliFieldPSD,
							'table': window.BroccoliFieldTable
						},
						'gpiBridge': function(api, options, callback){
							// GPI(General Purpose Interface) Bridge
							// broccoliは、バックグラウンドで様々なデータ通信を行います。
							// GPIは、これらのデータ通信を行うための汎用的なAPIです。
							contAppBroccoliServer(px, api, options, function(rtn){
								// console.log(rtn);
								callback(rtn);
							});
							return;
						},
						'onClickContentsLink': function(url, data){
							// console.log(url);
							// console.log(data);
							var to = url;
							var pathControot = px.preview.getUrl();
							to = to.replace( new RegExp( '^'+px.utils.escapeRegExp( pathControot ) ), '' );
							to = to.replace( new RegExp( '^\\/*' ), '/' );

							if( to != _param.page_path ){
								// if(confirm( 'realy to go to "'+to+'"?' )){
								window.parent.contApp.openEditor( to );
								// window.location.href = './index.html?page_path='+encodeURIComponent( to );
								// }
							}
						},
						'onMessage': function( message ){
							px.message(message);
						}
					} ,
					function(){
						// 初期化が完了すると呼びだされるコールバック関数です。
						it1.next(data);
					}
				);
			} ,
			function(it1, data){
				$elmTitleBar
					.append( $('<span class="cont_title_bar--title">')
						.text(data.pageInfo.title)
					)
					.append( $('<span class="cont_title_bar--path">')
						.text(data.pageInfo.path)
					)
					.append( $('<span class="cont_title_bar--fnc">')
						.append( $('<a href="javascript:;">')
							.text('toggle "instance Tree View"')
							.click( function(){
								if( $elmInstanceTreeView.is(':visible') ){
									$elmInstanceTreeView.hide(0, function(){
										onWindowResized();
									});
								}else{
									$elmInstanceTreeView.show(0, function(){
										onWindowResized();
									});
								}
							} )
						)
					)
				;
				$elmButtons
					.find('button.cont_btn_close')
						.click( function(){
							window.parent.contApp.closeEditor();
						} )
				;
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
									px.utils.openURL( px.preview.getUrl( _param.page_path ) );
								});
							} );
						})
				;
				it1.next(data);
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
		var hToolBar = $elmTitleBar.outerHeight();
		$('.cont_outline').css( {'height': h} );
		$elmCanvas.css( {
			'height': h - hToolBar
		} );
		$elmModulePalette.css( {
			'height': h - $elmButtons.outerHeight() - hToolBar
		} );
		$elmButtons.css( {
			'top': h - $elmButtons.outerHeight()
		} );
		$elmInstanceTreeView.css( {
			'height': h - hToolBar
		} );
		if( $elmInstanceTreeView.is(':visible') ){
			$elmCanvas.css( {
				'left': '20%',
				'width': '65%'
			} );
		}else{
			$elmCanvas.css( {
				'left': 0,
				'width': '85%'
			} );
		}
		callback();
	}

})( window.parent.px );
