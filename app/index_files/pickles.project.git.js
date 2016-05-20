/**
 * px.project.git
 */
module.exports = function( px, pj ) {
	var _this = this;

	var nodePhpBin = px.nodePhpBin;
	var utils79 = px.utils79;
	var path_px2git = require('path').resolve(__dirname+'/../common/php/git/px2-git.php');
	entryScript = require('path').resolve(pj.get('path'), pj.get('entry_script'));

	function apiGen(apiName){
		return new (function(apiName){
			this.fnc = function(callback){
				callback = callback||function(){};

				var param = {
					'method': apiName,
					'entryScript': entryScript
				};

				// PHPスクリプトを実行する
				var rtn = '';
				var err = '';
				nodePhpBin.script(
					[
						path_px2git,
						utils79.base64_encode(JSON.stringify(param))
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
								try {
									rtn = JSON.parse(rtn);
								} catch (e) {
									console.error('Failed to parse JSON string.');
								}
								console.log(rtn, err, code);
								callback();
							},1000);
						}
					}
				);
				return;
			}
		})(apiName).fnc;
	}

	/**
	 * サイトマップをコミットする
	 * @return {[type]} [description]
	 */
	this.commitSitemap = new apiGen('commit_sitemap');

	/**
	 * git status
	 * @return {[type]} [description]
	 */
	this.status = new apiGen('status');

	return this;
};
