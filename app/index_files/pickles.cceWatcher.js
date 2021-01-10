/**
 * main.cceWatcher
 */
module.exports = function( main ){
	var _this = this;
	var _pj;
	var _watcher;
	var $ = main.$;
	var _targetPath;
	this.main = main;

	/**
	 * 監視対象ディレクトリパスを取得する
	 */
	this.getWatchDir = function(){
		var pathAppDataDir = require('path').resolve(main.px2dtLDA.getAppDataDir('px2dt'))+'/customConsoleExtensions/watcher/';
		return main.path.resolve(pathAppDataDir)+'/';
	}

	/**
	 * ファイル監視を開始する
	 */
	this.start = function(){
		var pathAppDataDir = require('path').resolve(main.px2dtLDA.getAppDataDir('px2dt'))+'/';
		// console.log(pathAppDataDir);
		var tmpDirs = [
			'/customConsoleExtensions/',
			'/customConsoleExtensions/watcher/',
			'/customConsoleExtensions/watcher/async/',
			'/customConsoleExtensions/watcher/broadcast/',
		];
		for(var idx in tmpDirs){
			if( !main.utils.isDirectory(pathAppDataDir + tmpDirs[idx]) ){
				main.fs.mkdirSync(pathAppDataDir + tmpDirs[idx]);
			}
		}

		_targetPath = main.path.resolve(pathAppDataDir + '/customConsoleExtensions/watcher/');
		console.log(_targetPath);

		this.stop();

		if( !main.utils.isDirectory( _targetPath ) ){
			// ディレクトリが存在しないなら、監視は行わない。
			console.error('CustomConsoleExtensions: 対象ディレクトリが存在しないため、 fs.watch を起動しません。', _targetPath);
			return;
		}

		// console.log(pj.get('path'));
		_watcher = main.fs.watch(
			_targetPath,
			{
				"recursive": true
			},
			function(event, filename) {
				console.log(event, filename);
				var fileInfo = {};
				fileInfo.realpath = main.path.resolve(_targetPath+'/'+filename);
				// console.log(event + ' - ' + fileInfo.realpath);
			}
		);

		return;
	}

	/**
	 * ファイル監視を停止する
	 */
	this.stop = function(){
		try{
			_watcher.close();
		}catch(e){}
		return;
	}

};
