new (function($, window){
	window.px = $.px = this;

	this.utils = require('./common/scripts/_utils.node.js');
	var _fs = require('fs');
	var _db = {};
	var _path_db = process.env.HOME + '/.pickles2desktoptool.json';
	// _path_db = './_stab.json';
	var _current_project_num = null;
	var _selectedProject = null;
	if( !_fs.existsSync( _path_db ) ){
		_fs.writeFileSync( _path_db, JSON.stringify( {"projects":[]} ), {"encoding":"utf8","mode":436,"flag":"w"} );
	}
	_path_db = _fs.realpathSync( _path_db );
	var $header, $footer, $main, $contents;

	// var findpath = require('nodewebkit').findpath;
	// var nwpath = findpath();
	// console.log(findpath);
	// alert(nwpath);

	(function(){
		// node-webkit の標準的なメニューを出す
		var gui = require('nw.gui');
		win = gui.Window.get();
		var nativeMenuBar = new gui.Menu({ type: "menubar" });
		try {
			nativeMenuBar.createMacBuiltin("Pickles 2 Desktop Tool");
			win.menu = nativeMenuBar;
		} catch (ex) {
			console.log(ex.message);
		}
	})();


	/**
	 * DBをロードする
	 */
	this.load = function(){
		_db = require( _path_db );
		_db.projects = _db.projects||[];
		return true;
	}

	/**
	 * DBを保存する
	 */
	this.save = function(){
		var data = JSON.stringify( _db );
		_fs.writeFileSync( _path_db, data, {"encoding":"utf8","mode":436,"flag":"w"} );
		return true;
	}

	/**
	 * アプリケーションを終了する
	 */
	this.exit = function(){
		// if(!confirm('exit?')){return;}
		process.exit();
	}

	/**
	 * プロジェクト一覧を取得する
	 */
	this.getProjectList = function(){
		var rtn = _db.projects;
		return rtn;
	}

	/**
	 * プロジェクトを追加する
	 */
	this.createProject = function(projectInfo){
		projectInfo = projectInfo||{};
		if( typeof(projectInfo.name) != typeof('') || !projectInfo.name.length ){
			return false;
		}
		if( typeof(projectInfo.path) != typeof('') || !projectInfo.path.length ){
			return false;
		}
		if( typeof(projectInfo.entry_script) != typeof('') || !projectInfo.entry_script.length ){
			return false;
		}
		if( typeof(projectInfo.vcs) != typeof('') || !projectInfo.vcs.length ){
			return false;
		}


		_db.projects.push(projectInfo);
		this.save();
		return true;
	}

	/**
	 * プロジェクトを削除する
	 */
	this.deleteProject = function(projectId){
		_db.projects.splice(projectId, 1)
		this.deselectProject();
		this.save();
		this.subapp();
		return true;
	}

	/**
	 * プロジェクトを選択する
	 */
	this.selectProject = function(num){
		if( typeof(num) != typeof(0) ){
			return false;
		}
		_selectedProject = num;
		// alert(num);
		return true;
	}

	/**
	 * プロジェクトの選択を解除する
	 */
	this.deselectProject = function(){
		_selectedProject = null;
		return true;
	}

	/**
	 * 選択中のプロジェクトの情報を得る
	 */
	this.getCurrentProject = function(){
		return new (function(projectInfo, _selectedProject){
			this.projectInfo = projectInfo;
			this.projectId = _selectedProject;
			this.get = function(key){
				return this.projectInfo[key];
			}
			this.exec_px2 = function( cmd, fnc ){
				var _pjInfo = this.projectInfo;
				window.px.utils.spawn('php',
					[
						_pjInfo.path + '/' + _pjInfo.entry_script,
						cmd
					],
					fnc
				);
				return this;
			}
			this.exec_git = function( cmd, fnc ){
				return this;
			}
		})( _db.projects[_selectedProject], _selectedProject );
	}

	/**
	 * サブアプリケーション
	 */
	this.subapp = function(appName){
		var $cont = $('.contents').eq(0);
		if( typeof(_selectedProject) != typeof(0) ){
			appName = '';
		}else if( !appName && typeof(_selectedProject) == typeof(0) ){
			appName = 'home.html';
		}
		if( appName ){
			$cont
				.html('')
				.append(
					$('<iframe>')
						.attr('src', './'+appName)
				)
			;
			// alert(appName+': 開発中');
		}else{
			// プロジェクト選択画面を描画
			$cont.html('<div class="container">'
				+'<h1>Select Project</h1>'
				+'<div class="cont_project_list unit"><p>...</p></div>'
				+'<h2>Or create new Project</h2>'
				+'<div class="cont_project_form unit">'
					+'<form action="javascript:;" onsubmit="cont_createProject(this);return false;" class="inline">'
						+'name: <input type="text" name="pj_name" value="Your Project Name" /><br />'
						+'path: <input type="text" name="pj_path" value="" /><br />'
						+'entry script: <input type="text" name="pj_entry_script" value=".px_execute.php" /><br />'
						+'vcs: <input type="text" name="pj_vcs" value="git" /><br />'
						+'<p><button>新規プロジェクト作成</button></p>'
					+'</form>'
				+'</div>'
			+'</div>');

			var list = this.getProjectList();
			var $ul = $('<ul data-inset="true"></ul>');
			for( var i = 0; i < list.length; i++ ){
				$ul.append(
					$('<li>')
						.append(
							$('<a>')
								.attr('href', 'javascript:;')
								.attr('data-path', list[i].path)
								.attr('data-num', i)
								.click(function(){ if( !px.selectProject( $(this).data('num') ) ){alert('ERROR');return false;} px.subapp(); })
								.text(list[i].name)
							)
				);
			}
			$ul.listview(); // ← jQuery mobile の data-role="listview" を動的に適用
			$('.cont_project_list', $cont)
				.html('')
				.append($ul)
			;
		}
		layoutReset();
	}

	/**
	 * レイアウトをリセット
	 */
	function layoutReset(){
		$('body')
			.css({
				'margin':'0 0 0 0' ,
				'padding':'0 0 0 0' ,
				'width':'auto',
				'height':'auto',
				'min-height':0,
				'max-height':10000,
				'overflow':'hidden'
			})
		;
		$contents
			.css({
				'margin':'0 0 0 0' ,
				'padding':'0 0 0 0' ,
				'position':'fixed' ,
				'left':0 ,
				'top': $header.height()+25 ,
				'right': 0 ,
				'height': $(window).height() - $header.height() - $footer.height() - 50
			})
		;
		$contents.find('>iframe')
			.css({
				'height': $contents.height() - 10
			})
		;
	}

	/**
	 * イベントセット
	 */
	process.on( 'exit', function(e){
		// console.log(e);
		// e.preventDefault();
		px.save();
		// return false;
	});
	process.on( 'uncaughtException', function(e){
		alert('uncaughtException;');
		console.log('uncaughtException;', e);
	} )
	$(window).on( 'resize', function(e){
		layoutReset();
	} )


	$(function(){
		// アプリケーション開始
		px.load();

		// DOMスキャン
		$header   = $('.theme_header');
		$contents = $('.contents');
		$footer   = $('.theme_footer');

		layoutReset();
		px.subapp();
	});

	return this;
})(jQuery, window);
