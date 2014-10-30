new (function($, window){
	window.px = $.px = this;
	var _fs = require('fs');
	var _db = {};
	var _current_project_num = null;

	/**
	 * DBをロードする
	 */
	this.load = function(){
		// UTODO: スタブ実装
		_db = {
			"projects":[
				{
					"path": _fs.realpathSync('../../github/pickles2/.px_execute.php')
				}
			]
		};
		return true;
	}

	/**
	 * DBを保存する
	 */
	this.save = function(){
		// UTODO: 開発中
		alert('開発中です');
		return true;
	}

	/**
	 * プロジェクト一覧を取得する
	 */
	this.getProjectList = function(){
		var rtn = _db.projects;
		return rtn;
	}

	/**
	 * アプリケーションを終了する
	 */
	this.exit = function(){
		if(!confirm('exit?'))return;
		process.exit();
	}

	this.load();

	return this;
})(jQuery, window);
