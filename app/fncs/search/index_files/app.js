window.px = window.parent.px;
window.contApp = new (function(px, $){
	var _this = this;
	var pj = px.getCurrentProject();
	var $form, $progress, $results;
	var $tpl_searchForm;

	function getMain( options ){
		return new px.searchInDir;
	}

	/**
	 * 初期化
	 */
	function init(){
		$form = $('.cont_form');
		$progress = $('.cont_progress');
		$results = $('.cont_results');
		$tpl_searchForm = $('#template-search-form').html();

		$form.html('').append( $tpl_searchForm );
		$form
			.find('form')
				.bind('submit', function(){
					$results.html('');
					$progress.html( $('#template-progress').html() ).show();
					var keyword = $(this).find('[name=keyword]').val();
					// alert(keyword);
					px.searchInDir.find(
						[
							pj.get('path')+'/**/*'
						],
						{
							'keyword': keyword ,
							'ignore': [
								new RegExp('^'+px.php.preg_quote(pj.get('path')+'/vendor/'))
							],
							'progress': function( file, result ){
								if(!result.matched){
									return;
								}

								var src = $('#template-search-result').html();
								var tplDataObj = {
									'path': _this.getPath(file) ,
									'file': file ,
									'result': result
								};

								var html = window.twig({
									data: src
								}).render(tplDataObj);

								$results.append(html);
							} ,
							'error': function( file, error ){
							} ,
							'complete': function(){
								$progress.hide('fast');
							}
						}
					);
					return false;
				})
		;
	}

	/**
	 * イベント
	 */
	$(function(){
		init();
	});

	this.getPath = function(file){
		file = file.replace( new RegExp('^'+px.php.preg_quote(pj.get('path'))), '' );
		return file;
	}

})(px, $);
