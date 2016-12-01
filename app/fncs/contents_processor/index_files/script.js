window.px = window.parent.px;
window.contApp = new (function(px){
	var _this = this;
	var pj = px.getCurrentProject();
	this.pj = pj;
	var $cont, $btn, $pre;

	/**
	 * initialize
	 */
	function init(){
		$cont = $('.contents').html('');

		var html = $('#template-main-form').html();
		$cont.html(html);
		$btn = $cont.find('button');
		$pre = $cont.find('pre');

		$btn
			.click( function(){
				var btn = this;
				var $form = $cont.find('form');
				var script_source_processor = $form.find('textarea[name=script_source_processor]').val();
				var script_instance_processor = $form.find('textarea[name=script_instance_processor]').val();
				$pre.text('');
				$(btn).attr('disabled', 'disabled');
				$form.find('textarea[name=script_source_processor]').attr('disabled', 'disabled');
				$form.find('textarea[name=script_instance_processor]').attr('disabled', 'disabled');
				processor(
					script_source_processor,
					script_instance_processor,
					function(){
						$pre.text( $pre.text() + 'completed!' );
						$(btn).removeAttr('disabled').focus();
						$form.find('textarea[name=script_source_processor]').removeAttr('disabled');
						$form.find('textarea[name=script_instance_processor]').removeAttr('disabled');
					}
				);
			} );
		$pre
			.css({
				'max-height': 360,
				'height': 360
			});
	}


	var processor = function(script_source_processor, script_instance_processor, callback){
		// console.log(script_source_processor, script_instance_processor);

		function srcProcessor( html, next ){
			try {
				eval(script_source_processor.toString());
			} catch (e) {
				console.log('eval ERROR');
				next();
			}
		}

		pj.createSearcher().getGuiEditPages( function(pageList){

			px.utils.iterate(
				pageList ,
				function( it1, sitemapRow, idx1 ){
					// console.log(sitemapRow);
					$pre.text( $pre.text() + sitemapRow.path );

					px.it79.fnc(
						{"pageInfo": sitemapRow},
						[
							function(it2, arg2){
								// HTMLコンテンツのみ抽出
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
								// そのうち、GUI編集コンテンツのみ抽出
								pj.getPageContentEditorMode( arg2.pageInfo.path, function(procType){
									$pre.text( $pre.text() + ' -> ' + procType );
									switch( procType ){
										case 'html.gui':
											it2.next(arg2);
											break;
										default:
											$pre.text( $pre.text() + ' -> SKIP' );
											$pre.text( $pre.text() + "\n" );
											it1.next();
											break;
									}
								} );
							} ,
							function(it2, arg2){
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
											console.log(arg2.pageInfo.path, logs);
											console.log('replace done!');
											it2.next(arg2);
										})
									;

								} );
							} ,
							function(it2, arg2){
								// broccoli コンテンツを再生成する
								pj.buildGuiEditContent( arg2.pageInfo.path, function(result){
									if(result){
										$pre.text( $pre.text() + ' -> done' );
									}else{
										$pre.text( $pre.text() + ' -> ERROR!' );
									}
									$pre.text( $pre.text() + "\n" );
									it2.next(arg2);
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

		} );
	}

	/**
	 * イベント
	 */
	$(function(){
		init();
	});

})(window.px);
