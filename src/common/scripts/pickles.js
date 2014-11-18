new (function($, window){
	window.px = $.px = this;
	this.debugMode = true;
	var _fs = {};
	var _db = {};
	var _current_project_num = null;

	try{
		this.debugMode = !!!process;
		_fs = require('fs');
	}catch(e){
		console.log(e);
	}
	// console.log(this.debugMode);

	/**
	 * DBをロードする
	 */
	this.load = function(){
		// UTODO: スタブ実装
		_db = {
			"projects":[
				{
					"path": '../../github/pickles2/.px_execute.php'
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

	/**
	 * サブアプリケーション
	 */
	this.subapp = function(appName){
		if( appName ){
			alert('開発中');
		}else{
			var list = this.getProjectList();
			var $ul = $('<ul>');
			$('.contents').html('');
			for( var i = 0; i < list.length; i++ ){
				var $li = $('<li>').append($('<a>').attr('href', 'javascript:alert(123);').text(list[i].path));
				$ul.append($li);
			}
			$('.contents').append($ul);
		}
	}

	return this;
})(jQuery, window);
