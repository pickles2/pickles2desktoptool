module.exports = function( px ) {
	var _this = this;

	var gui = px.nw;
	var Updater = require('node-webkit-updater');
	var upd = new Updater(px.packageJson);

	/**
	 * インストーラーモードかを判断する
	 */
	this.isInstallerMode = function(){
		if(gui.App.argv.length == 2) {
			return true;
		}
		return false;
	}

	/**
	 * インストーラーモードを判断し、処理する
	 */
	this.doAsInstallerMode = function( $body ){
		// Args passed when new app is launched from temp dir during update

		var copyPath = gui.App.argv[0];
		var execPath = gui.App.argv[1];

		px.it79.fnc({},
			[
				function(it1){
					console.log('Starting installation...');
					$body.html( '<div class="installer-mode"><div class="installer-mode__appname"></div><div class="installer-mode__version"></div><div class="installer-mode__progress-msg"></div></div>' );
					$body.find('.installer-mode__appname').text(px.packageJson.window.title);
					$body.find('.installer-mode__version').text(px.packageJson.version);
					$body.find('.installer-mode__progress-msg').text('インストールしています...。');

					setTimeout(function(){
						it1.next();
					}, 3000);
				},
				function(it1){
					console.log('Starting copy application files...');
					if( !_this.isInstallerMode() ){
						it1.next();
						return;
					}

					// Replace old app, Run updated app from original location and close temp instance
					// 本来 node-webkit-updater の作法では upd.install() を使うが、
					// これが mac でうまく動作しなかったため、 fsEx.copy() に置き換えた。
					px.fsEx.copy(upd.getAppPath(), copyPath, {"overwrite": true}, function(err) {
						console.log('Copy application files done.');

						if (err) {
							console.error(err);
							$('body').find('.installer-mode__progress-msg').text('[ERROR] アプリケーションの更新に失敗しました。アプリケーションファイルのコピーが失敗しました。');
							alert('[ERROR] アプリケーションの更新に失敗しました。アプリケーションファイルのコピーが失敗しました。');
							return;
						}

						it1.next();
					});
				},
				function(it1){
					console.log('Installation done.');
					$body.find('.installer-mode__progress-msg').text('アップデートが完了しました。');

					setTimeout(function(){
						alert('アップデートが完了しました。 アプリケーションを再起動します。');
						it1.next();
					}, 500);
				},
				function(it1){
					setTimeout(function(){
						it1.next();
					}, 1000);
				},
				function(it1){
					if( _this.isInstallerMode() ){
						console.log('Reboot...', execPath);
						upd.run(execPath, null);
					}

					px.exit();
				}
			]
		);

		return;
	}


	/**
	 * 新しいバージョンがあるかどうか確認する
	 */
	this.checkNewVersion = function(){

		upd.checkNewVersion(function(error, newVersionExists, manifest) {
			if( error ){
				console.error(error);
				return;
			}
			if ( !newVersionExists ) {
				alert('お使いのアプリケーションは最新版です。');

			} else {
				if( !confirm('新しいバージョンが見つかりました。'+"\n"+'・最新バージョン: '+manifest.version+"\n"+'・お使いのバージョン: '+px.packageJson.version+"\n"+'更新しますか？') ){
					return;
				}
				if( !confirm('アプリケーションの更新には、数分かかることがあります。'+"\n"+'更新中には作業は行なえません。'+"\n"+'いますぐ更新しますか？') ){
					return;
				}
				console.info('インストーラーをダウンロードしています...。');

				// 最新版のZIPアーカイブをダウンロード
				upd.download(function(error, filename) {
					if( error ){
						console.error(error);
						return;
					}

					console.info('インストーラーアーカイブを展開しています...。');

					// ZIPを解凍
					upd.unpack(filename, function(error, newAppPath) {
						if( error ){
							console.error(error);
							return;
						}

						console.info('インストールの準備が整いました。インストーラーを起動します。');
						setTimeout(function(){
							upd.runInstaller(newAppPath, [upd.getAppPath(), upd.getAppExec()],{});
							px.exit();
							return;
						}, 3000);

					}, manifest);

				}, manifest);

			}
		});

		return;
	}

	/**
	 * Updaterを取得する
	 */
	this.getUpdater = function(){
		return upd;
	}

};
