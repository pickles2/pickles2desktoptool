window.px = window.parent.px;
window.contApp = new (function(px, $){
	var _this = this;
	var pj = px.getCurrentProject();
	var $form, $progress, $results, $resultsUl;
	var $tpl_searchForm;
	var SinD;
	var hitCount = 0;
	var targetCount = 0;


	/**
	 * 初期化
	 */
	function init(){
		$form = $('.cont_form');
		$progress = $('.cont_progress');
		$results = $('.cont_results');
		$resultsProgress = $('<div>');
		$resultsUl = $('<ul>');
		$tpl_searchForm = $('#template-search-form').html();

		$form.html('').append( $tpl_searchForm );
		$form
			.find('form')
				.bind('submit', function(){
					if( SinD ){
						SinD.cancel();
						return false;
					}
					hitCount = 0;
					targetCount = 0;
					$results
						.html('')
						.append( $resultsProgress.html('') )
						.append( $resultsUl.html('') )
					;
					updateResultsProgress();
					$progress.html( $('#template-progress').html() ).show();
					var keyword = $(this).find('[name=keyword]').val();
					// alert(keyword);
					SinD = new px.SearchInDir(
						[
							pj.get('path')+'/**/*'
						],
						{
							'keyword': keyword ,
							'ignore': [
								new RegExp('^'+px.php.preg_quote(pj.get('path')+'/vendor/'))
							],
							'progress': function( done, max ){
								targetCount = max;
								var per = px.php.intval(done/max*100);
								$progress.find('.progress .progress-bar')
									.text(done+'/'+max)
									.css({'width':per+'%'})
								;
								updateResultsProgress();
							},
							'match': function( file, result ){
								hitCount ++;
								updateResultsProgress();

								var src = $('#template-search-result').html();
								var tplDataObj = {
									'path': _this.getPath(file) ,
									'file': file ,
									'result': result
								};

								var html = window.twig({
									data: src
								}).render(tplDataObj);
								var $html = $(html);
								$html.find('a[data-role=openInFinder]')
									.click(function(){
										px.utils.openURL( px.php.dirname($(this).attr('data-file-path')) );
										return false;
									})
								;
								$html.find('a[data-role=openInTextEditor]')
									.click(function(){
										px.openInTextEditor( $(this).attr('data-file-path') );
										return false;
									})
								;
								$html.find('a[data-role=open]')
									.click(function(){
										px.utils.openURL( $(this).attr('data-file-path') );
										return false;
									})
								;

								$resultsUl.append($html);
							} ,
							'error': function( file, error ){
							} ,
							'complete': function(){
								updateResultsProgress();
								setTimeout(function(){
									$progress.hide('fast');
									SinD = null;
								},2000);
							}
						}
					);
					return false;
				})
		;
	}

	function updateResultsProgress(){
		$resultsProgress.html(targetCount + 'ファイル中、' + hitCount + 'ファイルがヒット')
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
