/**
 * lib-px2-theme-editor.js
 */
module.exports = function(main){
	const it79 = require('iterate79');
	var pj = main.getCurrentProject();
	var utils79 = main.utils79;
	var pickles2ThemeEditor;
	var realpathDataDir;
	var px2all;

	this.init = function( callback ){

		it79.fnc({}, [
			function(it1){
				pj.px2dthelperGetAll('/', {}, function(result){
					px2all = result;
					realpathDataDir = px2all.realpath_homedir+'_sys/ram/data/';
					it1.next();
				});
			},
			function(it1){
				// クライアントリソースをロード
				pj.execPx2(
					'/?PX=px2dthelper.px2te.client_resources',
					{
						complete: function(resources){
							try{
								resources = JSON.parse(resources);
							}catch(e){
								console.error('Failed to parse JSON "client_resources".', e);
							}
							console.log(resources);
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
				pickles2ThemeEditor = new Pickles2ThemeEditor(); // px2te client
				it1.next();
			},
			function(it1){

				pickles2ThemeEditor.init(
					{
						'elmCanvas': $('.contents').get(0), // <- 編集画面を描画するための器となる要素
						'lang': main.getDb().language,
						'gpiBridge': function(input, callback){
							// GPI(General Purpose Interface) Bridge
							// broccoliは、バックグラウンドで様々なデータ通信を行います。
							// GPIは、これらのデータ通信を行うための汎用的なAPIです。

							var testTimestamp = (new Date()).getTime();
							var tmpFileName = '__tmp_'+utils79.md5( Date.now() )+'.json';
							main.fs.writeFileSync( realpathDataDir+tmpFileName, JSON.stringify(input) );

							pj.execPx2(
								'/?PX=px2dthelper.px2te.gpi&appMode=desktop&data_filename='+encodeURIComponent( tmpFileName ),
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
												main.fs.unlinkSync( realpathDataDir+tmpFileName );
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
						},
						'themeLayoutEditor': function(themeId, layoutId){
							alert('themeLayoutEditor: '+themeId+'/'+layoutId);
						},
						'openInFinder': function(path){
							alert('openInFinder: '+path);
						},
						'openInTextEditor': function(path){
							alert('openInTextEditor: '+path);
						}
					},
					function(){
						// スタンバイ完了したら呼び出されるコールバックメソッドです。
						it1.next();
					}
				);

			} ,
			function(it1){
				console.log('Theme Editor: Standby.');
				callback();
			}
		]);

	}

}

