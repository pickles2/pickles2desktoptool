window.main = window.parent.main;
window.contApp = new (function(){
	if( !main ){ alert('px が宣言されていません。'); }
	var _this = this;
	var it79 = require('iterate79');
	var pj = main.getCurrentProject();
	var getParams = (new URL(document.location)).searchParams;
	var customConsoleExtensionId;
	var $elm;
	var cceInfo;
	var px2dthelperCceAgent;


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
				// 拡張機能情報をロード
				pj.execPx2(
					'/?PX=px2dthelper.custom_console_extensions.'+customConsoleExtensionId,
					{
						complete: function(res){
							var objRes = false;
							try{
								objRes = JSON.parse(res);
							}catch(e){
							}
							console.log(objRes);
							if( !objRes ){
								alert('Undefined Extension.');
								return;
							}
							if( !objRes.result ){
								alert('Undefined Extension. ' + res.message);
								return;
							}
							cceInfo = objRes.info;
							it1.next();
						}
					}
				);
			},
			function(it1){
				// クライアントリソースをロード
				pj.execPx2(
					'/?PX=px2dthelper.custom_console_extensions.'+customConsoleExtensionId+'.client_resources',
					{
						complete: function(res){
							try{
								res = JSON.parse(res);
							}catch(e){
								console.error('Failed to parse JSON "client_resources".', e);
							}
							console.log(res);
							if( !res.result ){
								alert('Undefined Extension. ' + res.message);
								return;
							}
							var resources = res.resources;

							it79.ary(
								resources.css,
								function(it2, row, idx){
									var link = document.createElement('link');
									link.addEventListener('load', function(){
										it2.next();
									});
									$('head').append(link);
									link.rel = 'stylesheet';
									link.href = 'file://'+row;
								},
								function(){
									it79.ary(
										resources.js,
										function(it3, row, idx){
											var script = document.createElement('script');
											script.addEventListener('load', function(){
												it3.next();
											});
											$('head').append(script);
											script.src = 'file://'+row;
										},
										function(){
											it1.next();
										}
									);
								}
							);

						}
					}
				);
			},
			function(it1){

				px2dthelperCceAgent = new Px2dthelperCceAgent({
					'elm': $('.contents').get(0),
					'lang': main.getDb().language,
					'gpiBridge': function(input, callback){
						// GPI(General Purpose Interface) Bridge

						// var testTimestamp = (new Date()).getTime();
						// var tmpFileName = '__tmp_'+utils79.md5( Date.now() )+'.json';
						// main.fs.writeFileSync( realpathDataDir+tmpFileName, JSON.stringify(input) );

						pj.execPx2(
							'/?PX=px2dthelper.custom_console.extensions.'+customConsoleExtensionId+'.gpi&request='+encodeURIComponent( JSON.stringify(input) ),
							{
								complete: function(rtn){
									console.log('--- returned(millisec)', (new Date()).getTime() - testTimestamp);
									new Promise(function(rlv){rlv();})
										.then(function(){ return new Promise(function(rlv, rjt){
											try{
												rtn = JSON.parse(rtn);
											}catch(e){
												console.error('Failed to parse JSON String -> ' + rtn);
											}
											rlv();
										}); })
										.then(function(){ return new Promise(function(rlv, rjt){
											// main.fs.unlinkSync( realpathDataDir+tmpFileName );
											// pj.updateGitStatus(function(){});
											rlv();
										}); })
										.then(function(){ return new Promise(function(rlv, rjt){
											callback( rtn );
										}); })
									;
								}
							}
						);
						return;
					}
				});
				it1.next();

			} ,
			function(it1){
				eval(cceInfo.client_initialize_function+'(px2dthelperCceAgent);');
				it1.next();

			} ,
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
