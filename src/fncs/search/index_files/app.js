window.main = window.parent.main;
window.contApp = new (function(main, $){
	var _this = this;
	var pj = main.getCurrentProject();

	var pickles2CodeSearch;
	var SinD;
	var publicCacheDir = pj.getConfig().public_cache_dir || '/caches/';

	/**
	 * 初期化
	 */
	function init(){
		pickles2CodeSearch = new Pickles2CodeSearch(
			document.getElementById('cont-pickles2-code-search')
		);
		pickles2CodeSearch.init(
			{
				'start': function(keyword, searchOptions, callback){
					console.log('----- start', searchOptions);

					callback();

					if( SinD ){
						SinD.cancel();
						return false;
					}

					var searchInDirOptions = decideTargets( searchOptions );
					// console.log(searchInDirOptions);

					// 検索を実施
					SinD = new main.SearchInDir(
						searchInDirOptions['target'],
						{
							'keyword': keyword ,
							'filter': searchInDirOptions.filter,
							'ignore': searchInDirOptions.ignore,
							'allowRegExp': searchInDirOptions.allowRegExp,
							'ignoreCase': searchInDirOptions.ignoreCase,
							'matchFileName': searchInDirOptions.matchFileName,
							'progress': function( done, total ){
								pickles2CodeSearch.update({
									'total': total,
									'done': done,
								});
							},
							'match': function( file, result ){
								// console.log(file, result);
								pickles2CodeSearch.update({
									'new': [
										{
											'path': _this.getPath(file) ,
											'highlights': result.highlights ,
										}
									]
								});
							} ,
							'error': function( file, error ){
								console.error(file, error);
							} ,
							'complete': function(){
								pickles2CodeSearch.finished();
								SinD = null;
							}
						}
					);
					return;

				},
				'abort': function(callback){
					console.log('abort -----');
					SinD.cancel();
					callback();
					return;
				},
				'tools': [
					{
						'label': 'テキストエディタで開く',
						'open': function(path){
							main.openInTextEditor( pj.get('path') + path );
						}
					},
					{
						'label': 'フォルダを開く',
						'open': function(path){
							main.utils.openURL( main.php.dirname( pj.get('path') + path ) );
						}
					},
					{
						'label': '関連付けられたアプリケーションで開く',
						'open': function(path){
							main.utils.openURL( pj.get('path') + path );
						}
					}
				]
			},
			function(){
				console.log('ready.');
			}
		);


	}



	function decideTargets( searchOptions ){
		var rtn = {
			'target': [],
			'filter':[],
			'ignore': [],
			'allowRegExp': false,
			'ignoreCase': false,
			'matchFileName': false
		};

		var targetDir = searchOptions.target;
		switch(targetDir){
			case 'home_dir':
				rtn['target'].push(main.fs.realpathSync(pj.get('path')+'/'+pj.get('home_dir'))+'/**/*');
				break;
			case 'contents_comment':
				rtn['target'].push(main.fs.realpathSync(pj.get('path'))+'/**/*');
				rtn['filter'].push( new RegExp( main.php.preg_quote('/comments.ignore/comment.') ) );
				break;
			case 'sitemaps':
				rtn['target'].push(main.fs.realpathSync(pj.get('path')+'/'+pj.get('home_dir')+'/sitemaps')+'/**/*');
				break;
			case 'sys-caches':
				rtn['target'].push(main.fs.realpathSync(pj.get('path')+'/'+publicCacheDir)+'/**/*');
				rtn['target'].push(main.fs.realpathSync(pj.get('path')+'/'+pj.get('home_dir')+'/_sys')+'/**/*');
				break;
			case 'packages':
				if(pj.get_realpath_composer_root()){
					rtn['target'].push(main.fs.realpathSync(pj.get_realpath_composer_root()+'vendor')+'/**/*');
					rtn['target'].push(main.fs.realpathSync(pj.get_realpath_composer_root()+'composer.json'));
					rtn['target'].push(main.fs.realpathSync(pj.get_realpath_composer_root()+'composer.lock'));
				}
				if(pj.get_realpath_npm_root()){
					rtn['target'].push(main.fs.realpathSync(pj.get_realpath_npm_root()+'node_modules')+'/**/*');
					rtn['target'].push(main.fs.realpathSync(pj.get_realpath_npm_root()+'package.json'));
				}
				break;
			case 'all':
			default:
				rtn['target'].push(main.fs.realpathSync(pj.get('path'))+'/**/*');
				break;
		}

		function setIgnore( itemName, path ){
			if( !main.utils79.is_dir(path) ){
				return;
			}
			path = main.fs.realpathSync(path);
			path = new RegExp( main.php.preg_quote( path ) );
			if( searchOptions.ignore.find(item => item === itemName) ){
				rtn['ignore'].push( path );
			}
			return;
		}

		if( searchOptions.ignore.find(item => item === 'contents-comment') ){
			rtn['ignore'].push( new RegExp( main.php.preg_quote('/comments.ignore/comment.') ) );
		}
		setIgnore( 'sitemap', pj.get('path')+'/'+pj.get('home_dir')+'sitemaps/' );
		setIgnore( 'px-files', pj.get('path')+'/'+pj.get('home_dir') );
		setIgnore( 'sys-caches', pj.get('path')+'/'+publicCacheDir );
		setIgnore( 'sys-caches', pj.get('path')+'/'+pj.get('home_dir')+'_sys/' );

		if(pj.get_realpath_composer_root()){
			setIgnore( 'packages', pj.get_realpath_composer_root()+'vendor/' );
			setIgnore( 'packages', pj.get_realpath_composer_root()+'composer.json' );
			setIgnore( 'packages', pj.get_realpath_composer_root()+'composer.lock' );
		}
		if(pj.get_realpath_npm_root()){
			setIgnore( 'packages', pj.get_realpath_npm_root()+'node_modules/' );
			setIgnore( 'packages', pj.get_realpath_npm_root()+'package.json' );
		}

		if( searchOptions.allowRegExp ){
			rtn.allowRegExp = true;
		}
		if( !searchOptions.caseSensitive ){
			rtn.ignoreCase = true;
		}
		if( searchOptions.matchFileName ){
			rtn.matchFileName = true;
		}

		return rtn;
	}


	this.getPath = function(file){
		file = file.replace( new RegExp('^'+main.php.preg_quote(pj.get('path'))), '' );
		return file;
	}

	/**
	 * onload
	 */
	$(window).on('load', function(){
		init();
	});

})(main, $);
