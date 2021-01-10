/**
 * main.cceWatcher
 */
module.exports = function( main ){
	var _this = this;
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
		this.stop();

		var pathAppDataDir = require('path').resolve(main.px2dtLDA.getAppDataDir('px2dt'))+'/';
		console.log(pathAppDataDir);
		main.fsEx.removeSync(pathAppDataDir + '/customConsoleExtensions/');
		console.log(pathAppDataDir + '/customConsoleExtensions/');
		var tmpDirs = [
			'/customConsoleExtensions/',
			'/customConsoleExtensions/watcher/',
			'/customConsoleExtensions/watcher/async/',
			'/customConsoleExtensions/watcher/broadcast/',
		];
		for(var idx in tmpDirs){
			main.fsEx.mkdirSync(pathAppDataDir + tmpDirs[idx]);
		}

		_targetPath = main.path.resolve(pathAppDataDir + '/customConsoleExtensions/watcher/');
		console.log(_targetPath);

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
				// console.log('=-=-=-=-=', event, filename);
				if( !filename.match(/^(async|broadcast)[\/\\]([a-zA-Z0-9\_\-]+)[\/\\]([\s\S]+\.json)$/) ){
					return;
				}
				var eventType = RegExp.$1;
				var projectId = RegExp.$2;
				// console.log('* ', eventType, projectId);

				var fileInfo = {};
				fileInfo.realpath = main.path.resolve(_targetPath+'/'+filename);
				// console.log(event + ' - ' + fileInfo.realpath);
				if( !fileInfo.realpath || !main.utils.isFile(fileInfo.realpath) ){
					return;
				}

				var pj = main.getCurrentProject();
				// console.log('current pj:', pj.projectInfo);
				var fileBin = main.fs.readFileSync(fileInfo.realpath).toString();
				var fileJson = JSON.parse(fileBin);
				if(eventType == 'broadcast'){
					main.fsEx.removeSync(fileInfo.realpath);
				}
				if( pj && pj.projectInfo.id == projectId ){
					pj.recieveCceEvents(eventType, fileJson);
				}
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
