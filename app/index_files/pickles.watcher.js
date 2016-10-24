/**
 * px.watcher
 */
module.exports = function( px ){
	var _this = this;
	var _pj;
	var _watcher;
	this.px = px;

	/**
	 * ファイル監視を開始する
	 * @return {[type]} [description]
	 */
	this.start = function(pj){
		_pj = pj;
		this.stop();

		// console.log(pj.get('path'));
		_watcher = px.fs.watch(
			pj.get('path'),
			{
				"recursive": true
			},
			function(event, filename) {
				console.log(event + ' - ' + filename);
			}
		);
		return;
	}

	/**
	 * ファイル監視を停止する
	 * @return {[type]} [description]
	 */
	this.stop = function(){
		try {
			_watcher.close();
		} catch (e) {
		}
		return;
	}

	return this;
};
