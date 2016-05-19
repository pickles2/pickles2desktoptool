/**
 * px.project.git
 */
module.exports = function( px, pj ) {
	var _this = this;

	this.nodePhpBin = px.nodePhpBin;
	this.utils79 = px.utils79;
	this.entryScript = require('path').resolve(pj.get('path'), pj.get('entry_script'));

	/**
	 * サイトマップをコミットする
	 * @return {[type]} [description]
	 */
	this.commitSitemap = function(callback){
		callback = callback||function(){};
		// console.log('under construction.');
		var path_px2git = require('path').resolve(__dirname+'/../common/php/git/px2-git.php');
		// console.log(path_px2git);

		var param = {
			'method': 'commit_sitemap',
			'entryScript': this.entryScript
		};

		// PHPスクリプトを実行する
		var rtn = '';
		var err = '';
		this.nodePhpBin.script(
			[
				path_px2git,
				_this.utils79.base64_encode(JSON.stringify(param))
			],
			{
				"success": function(data){
					rtn += data;
					console.log(data);
				} ,
				"error": function(data){
					rtn += data;
					err += data;
					console.log(data);
				} ,
				"complete": function(data, error, code){
					setTimeout(function(){
						console.log(rtn, err, code);
						callback();
					},1000);
				}
			}
		);
		return;
	}

	return this;
};
