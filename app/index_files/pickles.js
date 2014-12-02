new (function($, window){
	window.px = $.px = this;

	var _utils = require('./index_files/_utils.node.js');
	this.utils = _utils;
	var _fs = require('fs');
	this.fs = _fs;
	var _db = {};
	var _path_data_dir = process.env.HOME + '/.pickles2desktoptool/';
	var _path_db = process.env.HOME + '/.pickles2desktoptool/db.json';
	var _current_app = null;
	var _selectedProject = null;
	if( !_utils.isDirectory( _path_data_dir ) ){
		_fs.mkdirSync( _path_data_dir );
	}
	if( !_fs.existsSync( _path_db ) ){
		_fs.writeFileSync( _path_db, JSON.stringify( {"projects":[]} ), {"encoding":"utf8","mode":436,"flag":"w"} );
	}
	_path_db = _fs.realpathSync( _path_db );
	var $header, $footer, $main, $contents;
	var _menu = [
		// {"label":"Reload(dev)", "cond":"always", "cb": function(){window.location.href='index.html?';}} ,
		{"label":"SELECT PROJ", "cond":"projectSelected", "app":"index.html", "cb": function(){px.deselectProject();px.subapp();}} ,
		{"label":"HOME", "cond":"pxStandby", "app":"home.html", "cb": function(){px.subapp();}} ,
		{"label":"Config", "cond":"pxStandby", "app":"fncs/config/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Filelist", "cond":"pxStandby", "app":"fncs/filelist/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Pages", "cond":"pxStandby", "app":"fncs/pages/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Preview", "cond":"pxStandby", "app":"fncs/preview/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"clearcache", "cond":"pxStandby", "app":"fncs/clearcache/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"publish", "cond":"pxStandby", "app":"fncs/publish/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"composer", "cond":"pxStandby", "app":"fncs/composer/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"git", "cond":"pxStandby", "app":"fncs/git/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Finderで開く", "cond":"pxStandby", "app":null, "cb": function(){px.getCurrentProject().open();}}
		// {"label":"閉じる", "cond":"always", "app":null, "cb": function(){px.exit();}}
	];

	this.server = require('./index_files/px_server_emurator.node.js').init(this,$);

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
		_db.projects.sort( function(a, b){
			if (a.name < b.name){
				return -1;
			}
			if (a.name > b.name){
				return 1;
			}
			return 0;
		} );
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
	this.createProject = function(projectInfo, opt){
		projectInfo = projectInfo||{};
		opt = opt||{};
		opt.success = opt.success||function(){};
		opt.error = opt.error||function(){};
		opt.complete = opt.complete||function(){};

		if( typeof(projectInfo.home_dir) != typeof('') || !projectInfo.home_dir.length ){
			projectInfo.home_dir = 'px-files/'
		}
		if( typeof(projectInfo.entry_script) != typeof('') || !projectInfo.entry_script.length ){
			projectInfo.entry_script = '.px_execute.php'
		}

		var pj = new this.classProject( projectInfo );
		var pjValidated = pj.validate();

		if( pjValidated.isError ){
			opt.error(pjValidated.errorMsg);
			opt.complete();
			return false;
		}

		_db.projects.push(projectInfo);
		this.save();
		opt.success();
		opt.complete();

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
		if( _selectedProject === null ){
			return null;
		}
		return new this.classProject( _db.projects[_selectedProject], _selectedProject );
	}

	/**
	 * サブアプリケーション
	 */
	this.subapp = function(appName){
		var $cont = $('.contents').eq(0);
		$cont.html('<p>Loading...</p>');

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
			$cont.html( $('script#template-selectProject-page').html() );

			var list = this.getProjectList();
			if( list.length ){
				var $ul = $('<ul data-inset="true"></ul>');
				for( var i = 0; i < list.length; i++ ){
					$ul.append(
						$('<li>')
							.append(
								$('<a>')
									.attr('href', 'javascript:;')
									.data('path', list[i].path)
									.data('num', i)
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

			}else{
				$('.cont_project_list', $cont)
					.html('<p>プロジェクトは登録されていません。</p>')
				;
			}
		}
		_current_app = appName;
		layoutReset();
		$contents.scrollTop(0);
	}

	/**
	 * レイアウトをリセット
	 */
	function layoutReset(){
		var cpj = px.getCurrentProject();
		var cpj_s = null;
		if( cpj !== null ){
			cpj_s = cpj.status()
		}

		$('.theme_gmenu').html('');
		for( var i in _menu ){
			if( _menu[i].cond == 'projectSelected' ){
				if( cpj === null ){
					continue;
				}
			}else if( _menu[i].cond == 'pxStandby' ){
				if( cpj === null || !cpj_s.isPxStandby ){
					continue;
				}
			}else if( _menu[i].cond != 'always' ){
				continue;
			}
			$('.theme_gmenu').append( $('<li>')
				.append( $('<a>')
					.attr({"href":"javascript:;"})
					.click(_menu[i].cb)
					.text(_menu[i].label)
					.data('app', _menu[i].app)
					.addClass( (_current_app==_menu[i].app ? 'current' : '') )
				)
			);
			var $li = $('<li>')
		}

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
		px.save();
	});
	process.on( 'uncaughtException', function(e){
		alert('Uncaught Exception;');
		console.log('Uncaught Exception;');
		console.log(e);
	} );
	$(window).on( 'resize', function(e){
		layoutReset();
	} );
	// $(document).on( 'dblclick', function(e){
	// 	e.stopPropagation();
	// 	e.preventDefault();
	// 	return false;
	// } );


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
