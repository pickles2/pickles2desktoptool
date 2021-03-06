/**
 * main.watcher
 */
module.exports = function( main ){
	var _this = this;
	var _pj;
	var _watcher;
	var $ = main.$;

	var liveStatus = {
		'making_sitemap_cache': false,
		'publishing': false
	};
	var _targetPath, _pathHomedir;

	var $report = $('<div>');
	$report
		.addClass('theme_ui_px_live_report')
		.addClass('theme_ui_px_live_report--hidden')
	;

	/**
	 * ファイル監視を開始する
	 * @return {[type]} [description]
	 */
	this.start = function(pj){
		_pj = pj;
		_targetPath = main.path.resolve(pj.get('path'));
		_pathHomedir = main.path.resolve(pj.get('path')+'/'+pj.get('home_dir'));
		this.stop();

		if( !main.utils.isDirectory( _targetPath ) ){
			// ディレクトリが存在しないなら、監視は行わない。
			console.log('対象ディレクトリが存在しないため、 fs.watch を起動しません。', _targetPath);
			return;
		}

		// console.log(pj.get('path'));
		_watcher = main.fs.watch(
			_targetPath,
			{
				"recursive": true
			},
			function(event, filename) {
				var fileInfo = {};
				fileInfo.realpath = main.path.resolve(_targetPath+'/'+filename);
				// console.log(event + ' - ' + fileInfo.realpath);
				updateStatus(fileInfo);
			}
		);

		// 初期状態を確認
		updateStatus({'realpath': main.path.resolve(_pathHomedir+'/_sys/ram/caches/sitemaps/making_sitemap_cache.lock.txt')});
		updateStatus({'realpath': main.path.resolve(_pathHomedir+'/_sys/ram/publish/applock.txt')});

		return;
	}

	/**
	 * ファイル監視を停止する
	 * @return {[type]} [description]
	 */
	this.stop = function(){
		try {
			$report
				.removeClass('theme_ui_px_live_report--hidden')
				.addClass('theme_ui_px_live_report--hidden')
			;
			_watcher.close();
		} catch (e) {
		}
		return;
	}

	/**
	 * ライブステータスを更新
	 */
	function updateStatus(fileInfo){
		$('body').append($report);

		// console.info(fileInfo);
		switch( fileInfo.realpath ){
			case main.path.resolve( _pathHomedir+'/_sys/ram/caches/sitemaps/making_sitemap_cache.lock.txt' ):
				if( main.utils79.is_file(fileInfo.realpath) ){
					liveStatus.making_sitemap_cache = true;
				}else{
					liveStatus.making_sitemap_cache = false;
				}
				break;
			case main.path.resolve( _pathHomedir+'/_sys/ram/publish/applock.txt' ):
				if( main.utils79.is_file(fileInfo.realpath) ){
					liveStatus.publishing = true;
				}else{
					liveStatus.publishing = false;
				}
				break;
		}

		var msg = '';
		if( liveStatus.publishing ){
			msg = 'パブリッシュしています...';
		}else if( liveStatus.making_sitemap_cache ){
			msg = 'サイトマップキャッシュを生成しています...';
		}
		if( msg.length ){
			$report
				.text(msg)
				.removeClass('theme_ui_px_live_report--hidden')
			;
		}else{
			$report
				.removeClass('theme_ui_px_live_report--hidden')
				.addClass('theme_ui_px_live_report--hidden')
			;
		}
		return;
	}

	return this;
};
