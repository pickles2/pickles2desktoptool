module.exports = function( window, px ) {
	var _this = this;

	var gui = px.nw;
	var Updater = require('node-webkit-updater');
	var upd = new Updater(px.packageJson);
	var copyPath, execPath;

	// Args passed when new app is launched from temp dir during update
	if(gui.App.argv.length) {
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
					alert('[ERROR] アプリケーションの更新に失敗しました。アプリケーションファイルのコピーが失敗しました。');
					return;
				}

				alert('アップデートが完了しました。 アプリケーションを再起動します。');

				setTimeout(function(){
					// ------------- Step 6 -------------
					upd.run(execPath, null);

					px.exit();
				}, 1000);

			});
		}, 3000);
	}

	/**
	 * Updaterを取得する
	 */
	this.getUpdater = function(){
		return upd;
	}

};
