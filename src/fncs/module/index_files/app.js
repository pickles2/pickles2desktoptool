window.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }
	var _this = this;
	var pj = this.pj = px.getCurrentProject();
	var it79 = px.it79;
	var utils79 = px.utils79;
	var guiEngine;
	var client_resources;
	var realpathDataDir;

	var pxConf,
		path_controot;

	var $content;

	/**
	 * 初期化
	 */
	function init(){
		it79.fnc({},
			[
				function(it1, arg){
					// broccoli-html-editor-php エンジン利用環境の要件を確認
					if( pj.getGuiEngineName() == 'broccoli-html-editor-php' ){
						pj.checkPxCmdVersion(
							{
								px2dthelperVersion: '>=2.0.8'
							},
							function(){
								// API設定OK
								it1.next(arg);
							},
							function( errors ){
								// API設定が不十分な場合のエラー処理
								var html = px.utils.bindEjs(
									px.fs.readFileSync('app/common/templates/broccoli-html-editor-php-is-not-available.html').toString(),
									{errors: errors}
								);
								$('.contents').html( html );
								// エラーだったらここで離脱。
								return;
							}
						);
						return;
					}
					it1.next(arg);
				},
				function(it1, arg){
					$content = $('.contents');
					pxConf = pj.getConfig();
					try{
						guiEngine = pxConf.plugins.px2dt.guiEngine;
					}catch(e){}
					path_controot = pj.get_realpath_controot();
					onWindowResize();
					it1.next(arg);
				},
				function(it1, arg){
					pj.px2dthelperGetAll('/', {}, function(px2all){
						realpathDataDir = px2all.realpath_homedir+'_sys/ram/data/';
						it1.next(arg);
					});
					// console.log(arg);
				},
				function(it1, arg){
					// クライアントリソース情報を収集
					if( guiEngine == 'broccoli-html-editor-php' ){
						pj.execPx2(
							'/?PX=px2dthelper.px2me.client_resources',
							{
								complete: function(resources){
									try{
										client_resources = JSON.parse(resources);
									}catch(e){
										console.error('Failed to parse JSON "client_resources".', e);
										console.error(resources);
									}
									for( var idx in client_resources.css ){
										client_resources.css[idx] = 'file://'+client_resources.css[idx];
									}
									for( var idx in client_resources.js ){
										client_resources.js[idx] = 'file://'+client_resources.js[idx];
									}
									it1.next(arg);
								}
							}
						);
						return;

					}else{
						client_resources = {
							css: [
								'../../common/broccoli-html-editor/client/dist/broccoli.css',
								'../../common/pickles2-contents-editor/dist/pickles2-contents-editor.css',
								'../../common/pickles2-module-editor/dist/pickles2-module-editor.css'
							],
							js: [
								'../../common/broccoli-html-editor/client/dist/broccoli.js',
								'../../common/pickles2-contents-editor/dist/pickles2-contents-editor.js',
								'../../common/pickles2-contents-editor/dist/libs/broccoli-field-table/dist/broccoli-field-table.js',
								'../../common/pickles2-module-editor/dist/pickles2-module-editor.js'
							]
						};
						it1.next(arg);
						return;
					}
				},
				function(it1, arg){
					// クライアントリソースをロード
					it79.ary(
						client_resources.css,
						function(it2, row, idx){
							var link = document.createElement('link');
							link.addEventListener('load', function(){
								it2.next();
							});
							$('head').append(link);
							link.rel = 'stylesheet';
							link.href = row;
						},
						function(){
							it79.ary(
								client_resources.js,
								function(it3, row, idx){
									var script = document.createElement('script');
									script.addEventListener('load', function(){
										it3.next();
									});
									$('head').append(script);
									script.src = row;
								},
								function(){
									it1.next(arg);
								}
							);
						}
					);
				},
				function(it1, arg){
					var pickles2ModuleEditor = new Pickles2ModuleEditor();
					pickles2ModuleEditor.init(
						{
							'elmCanvas': $content.get(0), // <- 編集画面を描画するための器となる要素
							'lang': px.getDb().language,
							'preview':{ // プレビュー用サーバーの情報を設定します。
								'origin': 'http://127.0.0.1:'+px.px2dtLDA.db.network.preview.port
							},
							'gpiBridge': function(input, callback){
								// GPI(General Purpose Interface) Bridge
								// broccoliは、バックグラウンドで様々なデータ通信を行います。
								// GPIは、これらのデータ通信を行うための汎用的なAPIです。
								if( guiEngine == 'broccoli-html-editor-php' ){
									var tmpFileName = '__tmp_'+utils79.md5( Date.now() )+'.json';
									px.fs.writeFileSync( realpathDataDir+tmpFileName, JSON.stringify(input) );
									pj.execPx2(
										'/?PX=px2dthelper.px2me.gpi&appMode=desktop&data_filename='+encodeURIComponent( tmpFileName ),
										{
											complete: function(rtn){
												try{
													rtn = JSON.parse(rtn);
												}catch(e){
													console.error('Failed to parse JSON String -> ' + rtn);
												}
												px.fs.unlinkSync( realpathDataDir+tmpFileName );
												callback( rtn );
											}
										}
									);
								}else{
									pj.createPickles2ModuleEditorServer(function(px2me){
										px2me.gpi(input, function(res){
											callback(res);
										});
									});
								}
								return;
							},
							'complete': function(){
								alert('完了しました。');
							},
							'onMessage': function( message ){
								// ユーザーへ知らせるメッセージを表示する
								console.info('message: '+message);
							}
						},
						function(){
							// スタンバイ完了したら呼び出されるコールバックメソッドです。
							it1.next(arg);
						}
					);
				},
				function(it1, arg){
					console.info('standby OK.');
					it1.next(arg);
				}
			]
		);
	}// init()

	/**
	 * ウィンドウリサイズイベントハンドラ
	 */
	function onWindowResize(){
		$content.css({
			'height': $(window).height() - $('.container').eq(0).height() - 10
		});
	}

	$(function(){
		init();
		$(window).resize(function(){
			onWindowResize();
		});

	});

})( window.parent.px );
