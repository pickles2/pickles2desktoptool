window.px = window.parent.px;
window.contApp = new (function(px){
	var _this = this;
	var pj = px.getCurrentProject();
	this.pj = pj;
	var $cont,
		$btn,
		$pre,
		$progress,
		$progressMessage;

	var $snippet_for_script_source_processor;
	var $snippet_for_script_instance_processor;
	var CodeMirrorInstans = {};

	/**
	 * initialize
	 */
	function init(){
		$cont = $('.contents').html('');

		var html = $('#template-main-form').html();
		$cont.html(html);
		$btn = $cont.find('button');
		$pre = $('<pre>');

		$snippet_for_script_source_processor = $('select[name=snippet_for_script_source_processor]')
			.on('change', function(){
				var val = $(this).val();
				$(this).val('');
				$cont.find('form').find('textarea[name=script_source_processor]').val(val);
				CodeMirrorInstans['source_processor'].setValue(val);
			})
		;
		$snippet_for_script_instance_processor = $('select[name=snippet_for_script_instance_processor]')
			.on('change', function(){
				var val = $(this).val();
				$(this).val('');
				$cont.find('form').find('textarea[name=script_instance_processor]').val(val);
				CodeMirrorInstans['instance_processor'].setValue(val);
			})
		;

		CodeMirrorInstans['source_processor'] = window.textEditor.attachTextEditor(
			$cont.find('form').find('textarea[name=script_source_processor]').get(0),
			'js',
			{
				save: function(){}
			}
		);
		CodeMirrorInstans['instance_processor'] = window.textEditor.attachTextEditor(
			$cont.find('form').find('textarea[name=script_instance_processor]').get(0),
			'js',
			{
				save: function(){}
			}
		);


		$('.snippet-source-processor').each(function(e){
			var $this = $(this);
			$snippet_for_script_source_processor.append( $('<option>')
				.attr({'value': px.utils79.trim($this.html())})
				.text($this.attr('title'))
			);
		});

		$('.snippet-instance-processor').each(function(e){
			var $this = $(this);
			$snippet_for_script_instance_processor.append( $('<option>')
				.attr({'value': px.utils79.trim($this.html())})
				.text($this.attr('title'))
			);
		});

		$btn
			.click( function(){
				var btn = this;
				var $form = $cont.find('form');
				var target_path = $form.find('input[name=target_path]').val();
				var script_source_processor = $form.find('textarea[name=script_source_processor]').val();
				var script_instance_processor = $form.find('textarea[name=script_instance_processor]').val();
				var is_dryrun = ( $form.find('input[name=is_dryrun]:checked').val()=='dryrun' ? true : false );

				$pre.text('');
				$(btn).attr('disabled', 'disabled');
				CodeMirrorInstans['source_processor'].setOption("readonly", "nocursor");
				CodeMirrorInstans['instance_processor'].setOption("readonly", "nocursor");
				$form.find('input,select,textarea').attr('disabled', 'disabled');
				var $dialogBody = $(document.getElementById('template-modal-content').innerHTML);
				$pre = $dialogBody.find('pre');
				$pre.css({'height': '300px'});
				$progress = $dialogBody.find('.cont_progress-bar .progress-bar');
				$progress.html('');
				$progressMessage = $dialogBody.find('.cont_message');
				$progressMessage.html('準備中...');

				var $btnOk = $('<button class="px2-btn px2-btn--primary">').text('OK').click(function(){
					px.closeDialog();
					$(btn).removeAttr('disabled').focus();
					CodeMirrorInstans['source_processor'].setOption("readonly", false);
					CodeMirrorInstans['instance_processor'].setOption("readonly", false);
					$form.find('input,select,textarea').removeAttr('disabled', 'disabled');
				}).attr({'disabled':'disabled'});

				px.dialog({
					"title": "一括加工",
					"body": $dialogBody,
					"buttons": [
						$btnOk
					]
				});

				processor(
					target_path,
					script_source_processor,
					script_instance_processor,
					is_dryrun,
					function(){
						$progressMessage.html('completed!');
						$progress.css({"width": '100%'}).removeClass('progress-bar-striped');
						$pre.text( $pre.text() + 'completed!' );
						$btnOk.removeAttr('disabled').focus();
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
	}


	var processor = function(target_path, script_source_processor, script_instance_processor, is_dryrun, callback){
		// console.log(script_source_processor, script_instance_processor);

		$progressMessage.html('実行中...');
		$progress.html('計算中...');

		var pageList = pj.site.getSitemap();
		var fileProgressCounter = 0;
		$progress.html(fileProgressCounter+'/'+px.utils79.count(pageList));

		var counter = {};
		var fileCounter = {};
		var pathCurrentContent = null;

		// HTMLソース加工
		function srcProcessor( src, type, next ){
			var supply = {
				// supplying libs
				'cheerio': px.cheerio,
				'iterate79': px.it79
			};
			try {
				eval(script_source_processor.toString());
			} catch (e) {
				console.log('eval ERROR');
				next(src);
			}
		}

		// 任意の項目を数える
		function count( key ){
			counter[key] = counter[key]||0;
			counter[key] ++;
			return counter[key];
		}

		// ファイルを数える
		function countFile(){
			fileCounter[pathCurrentContent] = fileCounter[pathCurrentContent]||0;
			fileCounter[pathCurrentContent] ++;
			return fileCounter[pathCurrentContent];
		}

		px.utils.iterate(
			pageList ,
			function( it1, sitemapRow, pagePath ){
				// console.log(sitemapRow);
				fileProgressCounter ++;
				$progressMessage.text(pagePath);
				$progress
					.text(fileProgressCounter+'/'+px.utils79.count(pageList))
					.css({"width": Number(fileProgressCounter/px.utils79.count(pageList)*100)+'%'})
				;
				$pre.text( $pre.text() + sitemapRow.path );

				px.it79.fnc(
					{"pageInfo": sitemapRow},
					[
						function(it2, arg2){
							// 対象外のパスだったらここまで
							// console.log(arg2.pageInfo.content);
							var regx = px.utils79.regexp_quote(target_path);
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
							var procType = pj.get_path_proc_type( arg2.pageInfo.path );
							$pre.text( $pre.text() + ' -> ' + procType );
							switch( procType ){
								case 'html':
								case 'htm':
									it2.next(arg2);
									break;
								default:
									$pre.text( $pre.text() + ' -> SKIP' );
									$pre.text( $pre.text() + "\n" );
									it1.next();
									break;
							}
						} ,
						function(it2, arg2){
							pj.getPageContentEditorMode( arg2.pageInfo.path, function(procType){
								$pre.text( $pre.text() + ' -> ' + procType );
								switch( procType ){
									case '.not_exists':
										$pre.text( $pre.text() + ' -> SKIP' );
										$pre.text( $pre.text() + "\n" );
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
														// console.log(data);
														// next();
														try {
															eval(script_instance_processor.toString());
														} catch (e) {
															console.log('eval ERROR', e);
															editor.done();
														}
													}
												)
												[(is_dryrun ? 'dryrun' : 'run')](function(logs){
													// console.log(arg2.pageInfo.path, logs);
													// console.log('replace done!');
													$pre.text( $pre.text() + ' -> done' );
													$pre.text( $pre.text() + "\n" );
													it2.next(arg2);
												})
											;

										} );
										break;

									case 'html':
									case 'md':
									default:
										if( !pathCurrentContent ){
											// console.log( 'content path of ' + arg2.pageInfo.path + ' is ' + pathCurrentContent );
											$pre.text( $pre.text() + ' -> ERROR' );
											$pre.text( $pre.text() + "\n" );
											it2.next(arg2);
											return;
										}
										pj.px2proj.get_path_controot(function(contRoot){
											pj.px2proj.get_path_docroot(function(docRoot){
												var _contentsPath = px.path.resolve(docRoot + contRoot + pathCurrentContent);
												var src = px.fs.readFileSync( _contentsPath ).toString();
												srcProcessor( src, procType, function(after){
													if( is_dryrun ){
														// dryrun で実行されていたら、加工結果を保存しない
														$pre.text( $pre.text() + ' -> done' );
														$pre.text( $pre.text() + "\n" );
														it2.next(arg2);
														return;
													}

													px.fs.writeFile( _contentsPath, after, {}, function(err){
														if(err){
															console.error( err );
														}
														$pre.text( $pre.text() + ' -> done' );
														$pre.text( $pre.text() + "\n" );

														it2.next(arg2);
													} );
												} );
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

			} ,
			function(){
				px.message( '完了しました。' );
				console.log('----------------------------------- completed -----------------------------------');
				console.log('result: count()', counter);
				console.log('result: countFile()', px.utils79.count(fileCounter), fileCounter);
				callback();
			}
		);

	}

	/**
	 * イベント
	 */
	$(function(){
		init();
	});

})(window.px);
