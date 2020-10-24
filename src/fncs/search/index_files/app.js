window.main = window.parent.main;
window.contApp = new (function(main, $){
	var _this = this;
	var pj = main.getCurrentProject();

	var pickles2CodeSearch;
	var SinD;
	var hitCount = 0;
	var targetCount = 0;

	/**
	 * 初期化
	 */
	function init(){
		pickles2CodeSearch = new Pickles2CodeSearch(
			document.getElementById('cont-pickles2-code-search')
		);
		console.log(document.getElementById('cont-pickles2-code-search'));

		pickles2CodeSearch.init(
			{
				'start': function(keyword, searchOptions, callback){
					console.log('----- start', searchOptions);

					callback();

					if( SinD ){
						SinD.cancel();
						return false;
					}

					// 検索を実施
					SinD = new main.SearchInDir(
						searchOptions['target'],
						{
							'keyword': keyword ,
							'filter': [],
							'ignore': searchOptions.ignore,
							'allowRegExp': searchOptions.allowRegExp,
							'ignoreCase': !searchOptions.caseSensitive,
							'matchFileName': searchOptions.matchFileName,
							'progress': function( done, total ){
								pickles2CodeSearch.update({
									'total': total,
									'done': done,
								});
							},
							'match': function( file, result ){
								pickles2CodeSearch.update({
									'total': total,
									'done': done,
									'new': [
										{
											'path': _this.getPath(file) ,
											'file': file ,
											'result': result
										}
									]
								});
							} ,
							'error': function( file, error ){
							} ,
							'complete': function(){
								pickles2CodeSearch.finished();
								SinD = null;
							}
						}
					);
					return false;

				},
				'abort': function(callback){
					console.log('abort -----');
					SinD.cancel();
					callback();
				}
			},
			function(){
				console.log('ready.');
			}
		);


	}

	/**
	 * イベント
	 */
	$(window).on('load', function(){
		init();
	});



	this.getPath = function(file){
		file = file.replace( new RegExp('^'+px.php.preg_quote(pj.get('path'))), '' );
		return file;
	}

})(main, $);
