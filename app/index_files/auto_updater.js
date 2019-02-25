module.exports = function( window, px ) {
	var _this = this;

	var gui = px.nw;
	var Updater = require('node-webkit-updater');
	var upd = new Updater(px.packageJson);
	var copyPath, execPath;

	/**
	 * インストーラーモードかを判断する
	 */
	this.isInstallerMode = function(){
		if(gui.App.argv.length) {
			return true;
		}
		return false;
	}

	/**
	 * インストーラーモードを判断し、処理する
	 */
	this.doAsInstallerMode = function(){
		// Args passed when new app is launched from temp dir during update

		var html = '<div class="installer-mode"></div>';
		$('body').html( html );
		$('body').find('.installer-mode').text('インストールしています...。');

		// ------------- Step 5 -------------
		copyPath = gui.App.argv[0];
		execPath = gui.App.argv[1];

		setTimeout(function(){
			// Replace old app, Run updated app from original location and close temp instance
			// 本来 node-webkit-updater の作法では upd.install() を使うが、
			// これが mac でうまく動作しなかったため、 fsEx.copy() に置き換えた。
			px.fsEx.copy(upd.getAppPath(), copyPath, {"overwrite": true}, function(err) {
				if (err) {
					console.error(err);
					$('body').find('.installer-mode').text('[ERROR] アプリケーションの更新に失敗しました。アプリケーションファイルのコピーが失敗しました。');
					alert('[ERROR] アプリケーションの更新に失敗しました。アプリケーションファイルのコピーが失敗しました。');
					return;
				}

				$('body').find('.installer-mode').text('アップデートが完了しました。');

				alert('アップデートが完了しました。 アプリケーションを再起動します。');

				setTimeout(function(){
					// ------------- Step 6 -------------
					upd.run(execPath, null);

					px.exit();
				}, 1000);

			});
		}, 3000);
		return;
	}

	/**
	 * Updaterを取得する
	 */
	this.getUpdater = function(){
		return upd;
	}

};
