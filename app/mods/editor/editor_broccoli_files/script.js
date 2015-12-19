window.px = window.parent.px;
window.contApp = new (function( px ){
	var _this = this;
	var it79 = require('iterate79');
	var php = require('phpjs');
	var data = {};
	var param = {};
	var broccoli = new Broccoli();
	var _pj;

	var $elmCanvas,
		$elmModulePalette,
		$elmInstanceTreeView,
		$elmInstancePathView;

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
				$elmCanvas = $('#canvas');
				$elmModulePalette = $('#palette');
				$elmInstanceTreeView = $('#instanceTreeView');
				$elmInstancePathView = $('#instancePathView');

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

						$(window).resize(function(){
							// このメソッドは、canvasの再描画を行います。
							// ウィンドウサイズが変更された際に、UIを再描画するよう命令しています。
							onWindowResized();
						}).resize();

						it1.next(data);
					}
				);
			} ,
			function(it1, _data){
				px.progress.close();
				data = _data;
				console.log(data);
				console.log('Started!');
			}
		]);

	});

	function onWindowResized(){
		var h = $(window).innerHeight() - $elmInstancePathView.outerHeight();
		// console.log(h);
		$('.cont_outline').css( {'height': h} );
		$elmCanvas.css( {'height': h} );
		$elmModulePalette.css( {'height': h} );
		$elmInstanceTreeView.css( {'height': h} );

		broccoli.redraw();
		return;
	}

})( window.parent.px );
