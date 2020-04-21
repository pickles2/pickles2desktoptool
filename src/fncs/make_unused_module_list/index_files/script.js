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

	var $snippet_for_script_instance_processor;
	var CodeMirrorInstans = {};
	var pathHomeDir;

	var _cancelRequest = false;
	var Processor = require('../../../fncs/make_unused_module_list/index_files/libs.ignore/processor.js');

	/**
	 * initialize
	 */
	function init(){
		px.it79.fnc(
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

					$snippet_for_script_instance_processor = $('select[name=snippet_for_script_instance_processor]')
						.on('change', function(){
							var val = $(this).val();
							$(this).val('');
							$cont.find('form').find('textarea[name=script_instance_processor]').val(val);
							CodeMirrorInstans['instance_processor'].setValue(val);
						})
					;

					CodeMirrorInstans['instance_processor'] = window.textEditor.attachTextEditor(
						$cont.find('form').find('textarea[name=script_instance_processor]').get(0),
						'js',
						{
							save: function(){}
						}
					);


					$('.snippet-instance-processor').each(function(e){
						var $this = $(this);
						$snippet_for_script_instance_processor.append( $('<option>')
							.attr({'value': px.utils79.trim($this.html())})
							.text($this.attr('title'))
						);
					});

					$btn
						.on('click', function(){
							var btn = this;
							var $form = $cont.find('form');
							var target_path = '/*';
							var script_instance_processor = $form.find('textarea[name=script_instance_processor]').val();
							var is_dryrun = ( $form.find('input[name=is_dryrun]:checked').val()=='dryrun' ? true : false );

							_cancelRequest = false;

							$pre.text('');
							$(btn).attr('disabled', 'disabled');
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
								CodeMirrorInstans['instance_processor'].setOption("readonly", false);
								$form.find('input,select,textarea').removeAttr('disabled', 'disabled');
							}).attr({'disabled':'disabled'});

							var $btnCancel = $('<button class="px2-btn">').text('中断').click(function(){
								_cancelRequest = true;
							});

							px.dialog({
								"title": "一括加工",
								"body": $dialogBody,
								"buttons": [
									$btnCancel,
									$btnOk
								]
							});

							var processor = new Processor(_this, px, pj, pathHomeDir, $progressMessage, $progress, $pre);
							processor.run(
								target_path,
								script_instance_processor,
								is_dryrun,
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

})(window.px);
