/**
 * px.project.configEditor
 */
module.exports = function( px, pj ) {
	var _this = this;

	var utils79 = px.utils79;
	var entryScript = require('path').resolve(pj.get('path'), pj.get('entry_script'));

	this.setDefaultTheme = function(themeId, callback){
		callback = callback || function(){};

		var param = utils79.base64_encode(JSON.stringify({
			'symbols': {
				'theme_id': themeId
			}
		}));

		pj.px2proj.query(
			'/?PX=px2dthelper.config.update&base64_json='+encodeURIComponent(param),
			{
				"output": "json",
				"complete": function(data, code){
					var result = false;
					try {
						result = JSON.parse(data);
					} catch (e) {
						callback({
							"result": false,
							"message": "テーマIDを変更できませんでした。この機能は、プロジェクトに pickles2/px2-px2dthelper v2.0.12 以降が必要です。"
						});
						return;
					}

					if(!result.result){
						callback({
							"result": false,
							"message": result.message
						});
						return;
					}

					callback({
						"result": true,
						"message": "OK"
					});
					return;
				}
			}
		);

	}

	return this;
};
