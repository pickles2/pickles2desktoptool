window.px = window.parent.px;
window.contApp = new (function(px){
	var _this = this;
	var pj = px.getCurrentProject();
	this.pj = pj;
	var $cont, $btn, $pre;

	var $snippet_for_script_source_processor;
	var $snippet_for_script_instance_processor;

	/**
	 * initialize
	 */
	function init(){
		$cont = $('.contents').html('');

		var html = $('#template-main-form').html();
		$cont.html(html);
		$btn = $cont.find('button');
		$pre = $cont.find('pre.cont_console');

		$snippet_for_script_source_processor = $('select[name=snippet_for_script_source_processor]')
			.on('change', function(){
				var val = $(this).val();
				$(this).val('');
				$cont.find('form').find('textarea[name=script_source_processor]').val(val);
			})
		;
		$snippet_for_script_instance_processor = $('select[name=snippet_for_script_instance_processor]')
			.on('change', function(){
				var val = $(this).val();
				$(this).val('');
				$cont.find('form').find('textarea[name=script_instance_processor]').val(val);
			})
		;

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
				$pre.text('');
				$(btn).attr('disabled', 'disabled');
				$form.find('input,select,textarea').attr('disabled', 'disabled');
				$form.find('textarea[name=script_source_processor]').attr('disabled', 'disabled');
				$form.find('textarea[name=script_instance_processor]').attr('disabled', 'disabled');
				processor(
					target_path,
					script_source_processor,
					script_instance_processor,
					function(){
						$pre.text( $pre.text() + 'completed!' );
						$(btn).removeAttr('disabled').focus();
						$form.find('input,select,textarea').removeAttr('disabled', 'disabled');
						$form.find('textarea[name=script_source_processor]').removeAttr('disabled');
						$form.find('textarea[name=script_instance_processor]').removeAttr('disabled');
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


	var processor = function(target_path, script_source_processor, script_instance_processor, callback){
		// console.log(script_source_processor, script_instance_processor);

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

		var pageList = pj.site.getSitemap();

		px.utils.iterate(
			pageList ,
			function( it1, sitemapRow, idx1 ){
				// console.log(sitemapRow);
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
												.run(function(logs){
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
										pj.px2proj.get_path_content(arg2.pageInfo.path, function(contPath){
											if( !contPath ){
												// console.log( 'content path of ' + arg2.pageInfo.path + ' is ' + contPath );
												$pre.text( $pre.text() + ' -> ERROR' );
												$pre.text( $pre.text() + "\n" );
												it2.next(arg2);
												return;
											}

											pj.px2proj.get_path_controot(function(contRoot){
												pj.px2proj.get_path_docroot(function(docRoot){
													var _contentsPath = px.path.resolve(docRoot + contRoot + contPath);
													var src = px.fs.readFileSync( _contentsPath ).toString();
													srcProcessor( src, procType, function(after){
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
