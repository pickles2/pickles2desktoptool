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

		var isError = false;
		var errorMsg = {};
		if( typeof(projectInfo.name) != typeof('') || !projectInfo.name.length ){
			errorMsg.name = 'name is required.';
			isError = true;
		}
		if( typeof(projectInfo.path) != typeof('') || !projectInfo.path.length ){
			errorMsg.path = 'path is required.';
			isError = true;
		}else if( !_fs.existsSync(projectInfo.path) ){
			errorMsg.path = 'path is required as a existed directory path.';
			isError = true;
		}
		if( typeof(projectInfo.home_dir) != typeof('') || !projectInfo.home_dir.length ){
			projectInfo.home_dir = 'px-files/'
			// errorMsg.home_dir = 'home directory is required.';
			// isError = true;
		}
		if( typeof(projectInfo.entry_script) != typeof('') || !projectInfo.entry_script.length ){
			projectInfo.entry_script = '.px_execute.php'
			// errorMsg.entry_script = 'entry_script is required.';
			// isError = true;
		}
		if( typeof(projectInfo.vcs) != typeof('') || !projectInfo.vcs.length ){
			errorMsg.vcs = 'vcs is required.';
			isError = true;
		}

		if(isError){
			opt.error(errorMsg);
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
		return new (function(projectInfo, _selectedProject){
			this.projectInfo = projectInfo;
			this.projectId = _selectedProject;
			this.status = function(){
				var status = {};
				status.pathExists = px.utils.isDirectory( this.get('path') );
				status.entryScriptExists = (status.pathExists && px.utils.isFile( this.get('path')+'/'+this.get('entry_script') ) ? true : false);
				var homeDir = this.get('path')+'/'+this.get('home_dir');
				status.homeDirExists = (status.pathExists && px.utils.isDirectory( homeDir ) ? true : false);
				status.confFileExists = (status.homeDirExists && (px.utils.isFile( homeDir+'/config.php'||px.utils.isFile( homeDir+'/config.json') ) ) ? true : false);
				status.composerJsonExists = (status.pathExists && px.utils.isFile( this.get('path')+'/composer.json' ) ? true : false);
				status.vendorDirExists = (status.pathExists && px.utils.isDirectory( this.get('path')+'/vendor/' ) ? true : false);
				status.gitDirExists = (status.pathExists && px.utils.isDirectory( this.get('path')+'/.git/' ) ? true : false);
				return status;
			}
			this.get = function(key){
				return this.projectInfo[key];
			}
			this.execPx2 = function( cmd, fnc ){
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
			this.execGit = function( cmd, fnc ){
				return this;
			}
			this.serverStandby = function(cb){
				px.server.start(8080, cb);
			}
			this.serverStop = function(cb){
				px.server.stop(cb);
			}
		})( _db.projects[_selectedProject], _selectedProject );
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

			}else{
				$('.cont_project_list', $cont)
					.html('<p>プロジェクトは登録されていません。</p>')
				;
			}
		}
		layoutReset();
		$contents.scrollTop(0);
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
