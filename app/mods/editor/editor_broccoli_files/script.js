window.px = window.parent.px;
window.contApp = new (function( px ){
	var _this = this;
	var it79 = require('iterate79');
	var php = require('phpjs');
	var data = {};
	var param = {};
	var broccoli = new Broccoli();
	var _pj;

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
				broccoli.init(
					{
						'elmCanvas': document.getElementById('canvas'),
						'elmModulePalette': document.getElementById('palette'),
						'elmInstanceTreeView': document.getElementById('instanceTreeView'),
						'elmInstancePathView': document.getElementById('instancePathView'),
						'contents_area_selector': _pj.getConfig().plugins.px2dt.contents_area_selector,
						'contents_bowl_name_by': _pj.getConfig().plugins.px2dt.contents_bowl_name_by,
						'customFields': {
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
		return;
	}

})( window.parent.px );
