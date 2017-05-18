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

		// Replace old app, Run updated app from original location and close temp instance
		upd.install(copyPath, function(err) {
			if(!err) {

				// ------------- Step 6 -------------
				upd.run(execPath, null);
				gui.App.quit();
			}
		});
	}

	/**
	 * Updaterを取得する
	 */
	this.getUpdater = function(){
		return upd;
	}

};
