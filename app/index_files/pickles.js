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
	var _pj = null;
	if( !_utils.isDirectory( _path_data_dir ) ){
		_fs.mkdirSync( _path_data_dir );
	}
	if( !_fs.existsSync( _path_db ) ){
		_fs.writeFileSync( _path_db,
			JSON.stringify(
				{
					"commands":{} ,
					"projects":[]
				}
			),
			{"encoding":"utf8","mode":436,"flag":"w"}
		);
	}
	_path_db = _fs.realpathSync( _path_db );
	var $header, $footer, $main, $contents, $dialog;
	var _menu = [
		// {"label":"Reload(dev)", "cond":"always", "cb": function(){window.location.href='index.html?';}} ,
		{"label":"SELECT PROJ", "cond":"projectSelected", "app":"index.html", "cb": function(){px.deselectProject();px.subapp();}} ,
		{"label":"HOME", "cond":"pxStandby", "app":"fncs/home/index.html", "cb": function(){px.subapp();}} ,
		{"label":"Preview", "cond":"pxStandby", "app":"fncs/preview/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Sitemap", "cond":"pxStandby", "app":"fncs/sitemap/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Contents", "cond":"pxStandby", "app":"fncs/pages/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Theme", "cond":"pxStandby", "app":"fncs/theme/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"publish", "cond":"pxStandby", "app":"fncs/publish/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"clearcache", "cond":"pxStandby", "app":"fncs/clearcache/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Config", "cond":"pxStandby", "app":"fncs/config/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"composer", "cond":"pxStandby", "app":"fncs/composer/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"git", "cond":"pxStandby", "app":"fncs/git/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Finderで開く", "cond":"pxStandby", "app":null, "cb": function(){px.getCurrentProject().open();}}
		// {"label":"閉じる", "cond":"always", "app":null, "cb": function(){px.exit();}}
	];

	this.server = require('./index_files/px_server_emurator.node.js').init(this,$);


	/**
	 * アプリケーションの初期化
	 */
	function init(cb){
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

		_db = _db||{};
		_db.commands = _db.commands||{};
		_db.projects = _db.projects||[];

		if( !_utils.isDirectory( _path_data_dir+'commands/' ) ){
			_fs.mkdirSync( _path_data_dir+'commands/' );
		}
		if( !_utils.isDirectory( _path_data_dir+'commands/composer/' ) ){
			_fs.mkdirSync( _path_data_dir+'commands/composer/' );
		}
		if( !_utils.isFile( _path_data_dir+'commands/composer/composer.phar' ) ){
			px.utils.exec(
				'php -r "readfile(\'https://getcomposer.org/installer\');" | php' ,
				function(){
					_db.commands.composer = _path_data_dir+'commands/composer/composer.phar';
					px.save();
					cb();
				},
				{cd: _path_data_dir+'commands/composer/'}
			);
		}else{
			cb();
		}
		return;
	}

	/**
	 * DBをロードする
	 */
	this.load = function(cb){
		cb = cb||function(){};
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
		cb();
		return true;
	}

	/**
	 * DBを保存する
	 */
	this.save = function(cb){
		cb = cb || function(){};
		var data = JSON.stringify( _db );
		_fs.writeFileSync( _path_db, data, {"encoding":"utf8","mode":436,"flag":"w"} );
		cb();
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

		var pj = new this.classProject( projectInfo, _db.projects.length );
		var pjValidated = pj.validate();

		if( pjValidated.isError ){
			opt.error(pjValidated.errorMsg);
			opt.complete();
			return false;
		}

		_db.projects.push( projectInfo );
		this.save();
		opt.success();
		opt.complete();

		return true;
	}

	/**
	 * プロジェクト情報を更新する
	 */
	this.updateProject = function(projectId, projectInfo){
		if( typeof(projectId) !== typeof(0) ){
			return false;
		}
		projectInfo = JSON.parse( JSON.stringify( projectInfo ) );
		_db.projects[projectId] = projectInfo;
		return true;
	}

	/**
	 * プロジェクトを削除する
	 */
	this.deleteProject = function(projectId, cb){
		cb = cb || function(){};
		_db.projects.splice(projectId, 1)
		this.deselectProject();
		this.save(function(){
			cb();
		});
		return true;
	}

	/**
	 * プロジェクトを選択する
	 */
	this.selectProject = function(num, cb){
		cb = cb||function(){}
		if( typeof(num) != typeof(0) ){
			return false;
		}
		_selectedProject = num;
		// alert(num);
		_pj = new this.classProject( _db.projects[_selectedProject], _selectedProject, cb );
		return true;
	}

	/**
	 * プロジェクトの選択を解除する
	 */
	this.deselectProject = function(){
		_selectedProject = null;
		_pj = null;
		return true;
	}

	/**
	 * 選択中のプロジェクトの情報を得る
	 */
	this.getCurrentProject = function(){
		if( _selectedProject === null ){
			return null;
		}
		return _pj;
	}

	/**
	 * コマンドのパスを取得する
	 */
	this.cmd = function(cmd){
		if( !_db.commands ){
			return cmd;
		}
		if( !_db.commands[cmd] ){
			return cmd;
		}
		return _db.commands[cmd];
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
			appName = 'fncs/home/index.html';
		}

		if( appName ){
			$cont
				.html('')
				.append(
					$('<iframe>')
						.attr('src', './'+appName)
				)
			;
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
									.click( function(){
										px.selectProject( $(this).data('num'), function(){
											px.subapp();
										} );
									} )
									.text( list[i].name )
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
		$dialog
			.css({
				'width': $(window).width(),
				'height': $(window).height()
			})
		;
	}

	/**
	 * ダイアログを表示する
	 */
	this.dialog = function(opt){
		opt = opt||{};
		opt.title = opt.title||'command:';
		opt.description = opt.description||'';
		opt.buttons = opt.buttons||[
			$('<button>').text('OK').click(function(){
				$dialog.remove();
			})
		];

		var $dialogButtons = $('<div class="dialog-buttons center">').append(opt.buttons);

		$dialog = $('<div>')
			.addClass('contents')
			.css({
				'position':'fixed',
				'left':0, 'top':0,
				'width': $(window).width(),
				'height': $(window).height(),
				'overflow':'hidden',
				'z-index':10000
			})
			.append( $('<div>')
				.css({
					'position':'fixed',
					'left':0, 'top':0,
					'width':'100%', 'height':'100%',
					'overflow':'hidden',
					'background':'#333',
					'opacity':0.3
				})
			)
			.append( $('<div>')
				.css({
					'position':'absolute',
					'left':0, 'top':0,
					'padding-top':'4em',
					'overflow':'auto',
					'width':"100%",
					'height':"100%"
				})
				.append( $('<div>')
					.addClass('dialog_box')
					.css({
						'width':'80%',
						'margin':'3em auto'
					})
					.append( $('<h1>')
						.text(opt.title)
					)
					.append( $('<div>')
						.append(opt.body)
					)
					.append( $dialogButtons )
				)
			)
		;

		$('body').append($dialog);
		return $dialog;
	}//dialog()

	/**
	 * ダイアログ上でコマンドを流す
	 */
	this.execDialog = function(cmd, opt){
		var $dialog;
		var output = '';
		var dlgOpt = {};

		opt = opt||{};
		opt.title = opt.title||'command:';
		opt.description = opt.description||'';
		opt.complete = opt.complete||function(){};

		var $pre = $('<pre>')
			.css({
				'height':'12em',
				'overflow':'auto'
			})
			.text('実行中...')
		;

		dlgOpt = {};
		dlgOpt.title = opt.title;
		dlgOpt.body = $('<div>')
			.append(opt.description)
			.append( $pre )
		;
		dlgOpt.buttons = [
			$('<button>')
				.text('OK')
				.click(function(){
					opt.complete( output );
					$dialog.remove();
				})
		];

		$dialog = this.dialog( dlgOpt );

		output = '';
		this.utils.exec(
			cmd,
			function(error, stdout, stderr){
				output = stdout;
				$pre.text(stdout);
				dlgOpt.buttons[0].removeAttr('disabled');
			} ,
			{
				cd: opt.cd
			}
		);
		return this;
	}//execDialog()

	/**
	 * ダイアログ上でコマンドを流す(spawn)
	 */
	this.spawnDialog = function(cmd, cliOpts, opt){
		var $dialog;
		var stdout = '';

		opt = opt||{};
		opt.title = opt.title||'command:';
		opt.description = opt.description||$('<div>');
		opt.success = opt.success||function(){};
		opt.error = opt.error||function(){};
		opt.cmdComplete = opt.cmdComplete||function(){};
		opt.complete = opt.complete||function(){};

		var $pre = $('<pre>')
			.css({
				'height':'12em',
				'overflow':'auto'
			})
			.text('実行中...')
		;

		var dlgOpt = {};
		dlgOpt.title = opt.title;
		dlgOpt.body = $('<div>')
			.append( opt.description )
			.append( $pre )
		;
		dlgOpt.buttons = [
			$('<button>')
				.text('OK')
				.click(function(){
					opt.complete(stdout);
					$dialog.remove();
				})
				.attr({'disabled':'disabled'})
		];

		$dialog = this.dialog( dlgOpt );

		stdout = '';
		this.utils.spawn(
			cmd,
			cliOpts,
			{
				cd: opt.cd,
				success: function(data){
					stdout += data;
					$pre.text(stdout);
					opt.success(data);
				} ,
				error: function(data){
					opt.error(data);
				} ,
				complete: function(code){
					opt.cmdComplete(code);
					dlgOpt.buttons[0].removeAttr('disabled');
				}
			}
		);
		return this;
	}//spawnDialog()

	/**
	 * イベントセット
	 */
	process.on( 'exit', function(e){
		px.save();
	});
	process.on( 'uncaughtException', function(e){
		// alert('ERROR: Uncaught Exception');
		// console.log(e);
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
		px.utils.iterateFnc([
			function(it, arg){
				// init
				init(function(){
					it.next(arg);
				});
			} ,
			function(it, arg){
				// アプリケーション開始
				px.load();

				// DOMスキャン
				$header   = $('.theme_header');
				$contents = $('.contents');
				$footer   = $('.theme_footer');
				$dialog   = $('<div>');

				layoutReset();
				px.subapp();

				it.next(arg);
			}
		]).start({});

	});

	return this;
})(jQuery, window);
