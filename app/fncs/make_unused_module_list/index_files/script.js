(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.main = window.parent.main;
window.contApp = new (function(main){
	var _this = this;
	var pj = main.getCurrentProject();
	this.pj = pj;
	var $cont,
		$btn,
		$pre,
		$progress,
		$progressMessage;

	var pathHomeDir;

	var _cancelRequest = false;
	var Processor = require('../../../fncs/make_unused_module_list/index_files/libs.ignore/processor.js');

	/**
	 * initialize
	 */
	function init(){
		main.it79.fnc(
			{},
			[
				function(it1, data){
					// broccoli-html-editor-php エンジン利用環境の要件を確認
					if( pj.getGuiEngineName() == 'broccoli-html-editor-php' ){
						pj.checkPxCmdVersion(
							{
								px2dthelperVersion: '>=2.0.8'
							},
							function(){
								// API設定OK
								it1.next(data);
							},
							function( errors ){
								// API設定が不十分な場合のエラー処理
								var html = main.utils.bindEjs(
									main.fs.readFileSync('app/common/templates/broccoli-html-editor-php-is-not-available.html').toString(),
									{errors: errors}
								);
								$('.contents').html( html );
								// エラーだったらここで離脱。
								return;
							}
						);
						return;
					}
					it1.next(data);
				},
				function(it1, data){
					pj.px2proj.get_path_homedir(function(path){
						pathHomeDir = path;
						it1.next(data);
					});
				},
				function(it1, data){

					$cont = $('.contents').html('');

					var html = $('#template-main-form').html();
					$cont.html(html);
					$btn = $cont.find('button');
					$pre = $('<pre>');


					$btn
						.on('click', function(){
							var btn = this;
							var $form = $cont.find('form');
							var target_path = '/*';

							_cancelRequest = false;

							$pre.text('');
							$(btn).attr('disabled', 'disabled');
							$form.find('input,select,textarea').attr('disabled', 'disabled');
							var $dialogBody = $(document.getElementById('template-modal-content').innerHTML);
							$pre = $dialogBody.find('pre');
							$pre.css({'height': '300px'});
							$progress = $dialogBody.find('.cont_progress-bar .progress-bar');
							$progress.html('');
							$progressMessage = $dialogBody.find('.cont_message');
							$progressMessage.html('準備中...');

							var $btnOk = $('<button class="px2-btn px2-btn--primary">').text('OK').click(function(){
								main.closeDialog();
								$(btn).removeAttr('disabled').focus();
								$form.find('input,select,textarea').removeAttr('disabled', 'disabled');
							}).attr({'disabled':'disabled'});

							var $btnCancel = $('<button class="px2-btn">').text('中断').click(function(){
								_cancelRequest = true;
							});

							main.dialog({
								"title": "モジュールを検索",
								"body": $dialogBody,
								"buttons": [
									$btnCancel,
									$btnOk
								]
							});

							var processor = new Processor(_this, main, pj, pathHomeDir, $progressMessage, $progress, $pre);
							processor.run(
								target_path,
								function(){
									$progressMessage.html('completed!');
									$progress.css({"width": '100%'}).removeClass('progress-bar-striped');
									$pre.text( $pre.text() + 'completed!' );
									$btnOk.removeAttr('disabled').focus();
									$btnCancel.attr({'disabled':'disabled'});
								}
							);
						} )
					;
					$pre
						.css({
							'max-height': 360,
							'height': 360
						})
					;

					it1.next(data);
				},
				function(it1, data){
					$('*').tooltip();
					it1.next(data);
				},
				function(it1, data){
					$(window).scrollTop(0);
					it1.next(data);
				}
			]
		);
	}

	/**
	 * キャンセルボタンの状態を取得する
	 */
	this.isCanceled = function(){
		return _cancelRequest;
	}


	/**
	 * イベント
	 */
	$(window).on('load', function(){
		init();
	});

})(window.main);

},{"../../../fncs/make_unused_module_list/index_files/libs.ignore/processor.js":2}],2:[function(require,module,exports){
/**
 * processor.js
 */
module.exports = function(app, main, pj, pathHomeDir, $progressMessage, $progress, $pre){

	this.run = function(target_path, callback){

		$progressMessage.html('実行中...');
		$progress.html('計算中...');

		var pageList = pj.site.getSitemap();
		var fileProgressCounter = 0;
		var pageListFullCount = main.utils79.count(pageList);
		$progress.html(fileProgressCounter+'/'+pageListFullCount);

		var counter = {};
		var fileCounter = {};
		var currentEditorMode = '';
		var currentExtension = '';
		var pathCurrentContent = null;

		var moduleIdCounter = [];

		// 任意の項目を数える
		function count( key ){
			counter[key] = counter[key]||0;
			counter[key] ++;
			return counter[key];
		}

		// ファイルを数える
		function countFile(){
			fileCounter[pathCurrentContent] = fileCounter[pathCurrentContent]||{'ext':currentExtension,'editorMode':currentEditorMode, 'count':0};
			fileCounter[pathCurrentContent].count ++;
			return fileCounter[pathCurrentContent];
		}

		// 実行ログをファイル出力する
		function log(msg){
			console.log(msg);
			return true;
		}

		log('-----------------------------------');
		log('---- start contents processor; ----');
		log(new Date());
		log('');
		log('## Target path');
		log('`'+target_path+'`');
		log('');
		log('-----------------------------------');
		log('## Log by pages');


		main.it79.ary(
			pageList ,
			function( it1, sitemapRow, pagePath ){

				try{

					if( app.isCanceled() ){
						// キャンセルボタンが押されていたら、すべてスキップ
						log("\n\n\n\n");
						log('+++++++++++++++++++++++');
						log('++++ User Canceled ++++');
						log('+++++++++++++++++++++++');
						log("\n\n\n\n");
						it1.break();
						return;
					}
					// console.log(sitemapRow);

					fileProgressCounter ++;
					$progressMessage.text(pagePath);
					$progress
						.text(fileProgressCounter+'/'+pageListFullCount)
						.css({"width": Number(fileProgressCounter/pageListFullCount*100)+'%'})
					;
					$pre.text( $pre.text() + "\n" + sitemapRow.path );

					log("\n"+'---- page('+fileProgressCounter+'/'+pageListFullCount+'): '+pagePath); // コンテンツの加工処理開始 (を、ログファイルに記録)

					main.it79.fnc(
						{"pageInfo": sitemapRow},
						[
							function(it2, arg2){
								// 対象外のパスだったらここまで
								// console.log(arg2.pageInfo.content);
								var regx = main.utils79.regexp_quote(target_path);
								regx = regx.split('\\*').join('([\\s\\S]*)');
								regx = '^'+regx+'$';
								// console.log(regx);
								try {
									if( arg2.pageInfo.content.match(new RegExp(regx)) ){
										it2.next(arg2);
										return;
									}else if( arg2.pageInfo.path.match(new RegExp(regx)) ){
										it2.next(arg2);
										return;
									}
								} catch (e) {
								}
								$pre.text( $pre.text() + ' -> SKIP' );
								log('-> SKIP');
								$pre.text( $pre.text() + "\n" );
								it1.next();
								// it2.next(arg2);
							} ,
							function(it2, arg2){
								// コンテンツのパスを取得
								pj.px2proj.get_path_content(arg2.pageInfo.path, function(contPath){
									pathCurrentContent = contPath;
									it2.next(arg2);
								});
								return;
							} ,
							function(it2, arg2){
								// HTML拡張子のみ抽出
								var Extension = pj.get_path_proc_type( arg2.pageInfo.path );
								$pre.text( $pre.text() + "\n" + ' -> Extension: ' + Extension );
								log('Extension: '+Extension);
								currentExtension = Extension;
								switch( Extension ){
									case 'html':
									case 'htm':
										it2.next(arg2);
										break;
									default:
										$pre.text( $pre.text() + ' -> SKIP' );
										$pre.text( $pre.text() + "\n" );
										log('-> SKIP');
										it1.next();
										break;
								}
							} ,
							function(it2, arg2){
								pj.getPageContentEditorMode( arg2.pageInfo.path, function(procType){
									log('EditorMode: ' + procType);
									currentEditorMode = procType;
									$pre.text( $pre.text() + "\n" + ' -> ' + 'EditorMode: ' + procType );
									switch( procType ){
										case '.not_exists':
											$pre.text( $pre.text() + ' -> SKIP' );
											$pre.text( $pre.text() + "\n" );
											log('-> SKIP');
											it1.next();
											break;

										case 'html.gui':
											// broccoli-processor オブジェクトを生成する
											// console.log(arg2.pageInfo.path);

											pj.createBroccoliProcessor( arg2.pageInfo.path, function(broccoliProcessor){
												// console.log(broccoliProcessor);

												broccoliProcessor
													.each(
														function( editor ){
															var targetModuleName = /[\s\S]*/;
															var instance = editor.getInstance();

															if( instance.modId.match(targetModuleName) && !instance.subModName ){
																count('モジュール '+instance.modId+' が使われている件数');
																countFile();
																if( !moduleIdCounter[instance.modId] ){
																	moduleIdCounter[instance.modId] = 0;
																}
																moduleIdCounter[instance.modId] ++;
															}
															editor.done();
														}
													)
													['dryrun'](function(logs){
														// console.log(arg2.pageInfo.path, logs);
														// console.log('replace done!');
														$pre.text( $pre.text() + ' -> done' );
														$pre.text( $pre.text() + "\n" );
														if(main.utils79.count(logs)){
															log(JSON.stringify(logs,null,4));
														}
														log('-> done');
														it2.next(arg2);
													})
												;

											} );
											break;

										case 'html':
										case 'md':
										case '.page_not_exists':
										default:
											if( !pathCurrentContent ){
												// console.log( 'content path of ' + arg2.pageInfo.path + ' is ' + pathCurrentContent );
												$pre.text( $pre.text() + ' -> ERROR' );
												$pre.text( $pre.text() + "\n" );
												log('-> ERROR');
												it2.next(arg2);
												return;
											}
											pj.px2proj.get_path_controot(function(contRoot){
												pj.px2proj.get_path_docroot(function(docRoot){
													$pre.text( $pre.text() + ' -> SKIP' );
													$pre.text( $pre.text() + "\n" );
													log('-> SKIP');
													it2.next(arg2);
													return;
												});
											});
											break;
									}
								} );
							} ,
							function(it2, arg2){
								it1.next();
							}
						]
					);
				}catch(e){
					console.error(e);
					it1.next();
				}

			} ,
			function(){
				getAllModuleList(function(definedModuleList){

					main.message( '完了しました。検索結果は console に出力されています。デベロッパーツールを確認してください。' );
					console.log('----------------------------------- completed -----------------------------------');
					console.log('result: count()', counter);
					console.log('result: countFile()', main.utils79.count(fileCounter), fileCounter);
					console.log('result: moduleIdCounter', moduleIdCounter);
					log('');
					log('----------------------------------- completed -----------------------------------');
					log(new Date());
					log('result: count() - '+JSON.stringify(counter,null,4));
					log('result: countFile() - '+main.utils79.count(fileCounter)+' - '+JSON.stringify(fileCounter,null,4));
					log('');

					$pre.text( $pre.text() + '完了しました。' + "\n" );
					$pre.text( $pre.text() + '検索結果は console に出力されています。デベロッパーツールを確認してください。' );
					$pre.text( $pre.text() + "\n" );

					if(definedModuleList){
						for(var modId in definedModuleList){
							var modInfo = definedModuleList[modId];
							if(modInfo.isSystemModule){
								// システムモジュールはカウントしない
								continue;
							}
							if(modInfo.isClipModule){
								// クリップモジュールはカウントしない
								continue;
							}
							if(!moduleIdCounter[modId]){
								log(modId + ' は使われていません。');
							}
						}
					}

					callback();

				});


			}
		);

	}


	/**
	 * 定義されているモジュールの一覧を取得する
	 */
	function getAllModuleList(callback){
		pj.px2dthelperGetAll('/', {}, function(px2all){
			var page_path = '/';
			var realpathDataDir = px2all.realpath_homedir+'_sys/ram/data/';
			var gpiOptions = {
				'api': 'broccoliBridge',
				'forBroccoli': {
					'api': 'getAllModuleList',
					'options': {
						'lang': 'ja'
					}
				},
				'page_path': page_path
			};

			var tmpFileName = '__tmp_'+main.utils79.md5( Date.now() )+'.json';
			main.fs.writeFileSync( realpathDataDir+tmpFileName, JSON.stringify(gpiOptions) );
			var PxCommand = 'PX=px2dthelper.px2ce.gpi&appMode=desktop&data_filename='+encodeURIComponent(tmpFileName);
			pj.px2proj.query(
				pj.getConcretePath(page_path)+'?'+PxCommand, {
					"output": "json",
					"complete": function(data, code){
						main.fs.unlinkSync( realpathDataDir+tmpFileName );

						var definedModuleList = false;
						try{
							definedModuleList = JSON.parse(data);
						}catch(e){
							console.error(e);
						}

						callback( definedModuleList );

						return;
					}
				}
			);
		});

	}

}

},{}]},{},[1])