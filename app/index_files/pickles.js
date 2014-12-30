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
	var _nw_gui = require('nw.gui');

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
	var $header, $footer, $main, $contents;
	var _menu = [
		{"label":"SELECT PROJ",  "cond":"projectSelected", "area":"footer", "app":"index.html", "cb": function(){px.deselectProject();px.subapp();}} ,
		{"label":"HOME",         "cond":"pxStandby",       "area":"mainmenu", "app":"fncs/home/index.html", "cb": function(){px.subapp();}} ,
		{"label":"サイトマップ", "cond":"pxStandby",       "area":"mainmenu", "app":"fncs/sitemap/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"コンテンツ",   "cond":"pxStandby",       "area":"mainmenu", "app":"fncs/pages/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"テーマ",       "cond":"pxStandby",       "area":"mainmenu", "app":"fncs/theme/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"パブリッシュ", "cond":"pxStandby",       "area":"mainmenu", "app":"fncs/publish/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"clearcache",   "cond":"pxStandby",       "area":"footer", "app":"fncs/clearcache/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Config",       "cond":"pxStandby",       "area":"footer", "app":"fncs/config/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Preview",      "cond":"pxStandby",       "area":"footer", "app":"fncs/preview/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"composer",     "cond":"pxStandby",       "area":"footer", "app":"fncs/composer/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"git",          "cond":"pxStandby",       "area":"footer", "app":"fncs/git/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Finderで開く", "cond":"pxStandby",       "area":"footer", "app":null, "cb": function(){px.getCurrentProject().open();}},
		// {"label":"Reload(dev)", "cond":"always", "cb": function(){window.location.href='index.html?';}} ,
		{"label":"Px2DT 設定",   "cond":"always",          "area":"footer", "app":null, "cb": function(){px.editPx2DTConfig();}} ,
		{"label":"終了",         "cond":"always",          "area":"footer", "app":null, "cb": function(){px.exit();}}
	];

	this.server = require('./index_files/px_server_emurator.node.js').init(this,$);


	/**
	 * アプリケーションの初期化
	 */
	function init(cb){
		(function(){
			// node-webkit の標準的なメニューを出す
			var win = _nw_gui.Window.get();
			var nativeMenuBar = new _nw_gui.Menu({ type: "menubar" });
			try {
				nativeMenuBar.createMacBuiltin("Pickles 2 Desktop Tool");
				win.menu = nativeMenuBar;
				// win.menu.append(new _nw_gui.MenuItem({
				// 	type: "normal", 
				// 	label: 'Item 1',
				// 	click: function() {
				// 		console.log('Click on Item 1');
				// 	}
				// }));
			} catch (ex) {
				console.log(ex.message);
			}

			// ↓Macのメニューバーの右側に並ぶメニューのこと
			// var tray = new _nw_gui.Tray({ icon: './common/images/icon.png' });
			// tray.title = 'Love Tray';
			// tray.tooltip = 'Love Tooltip';

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
	 * DBデータまるごと取得
	 */
	this.getDb = function(){
		return _db;
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
		$('.theme_footer-menu').html('');
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

			var $tmpMenu = $('<a>')
				.attr({"href":"javascript:;"})
				.click(_menu[i].cb)
				.text(_menu[i].label)
				.data('app', _menu[i].app)
				.addClass( ( _current_app==_menu[i].app ? 'current' : '' ) )
			;

			switch( _menu[i].area ){
				case 'footer':
					$('.theme_footer-menu').append( $('<li>')
						.append( $tmpMenu )
					);
					break;
				default:
					$('.theme_gmenu').append( $('<li>')
						.append( $tmpMenu )
					);
					break;
			}
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
		console.log('exit');
		px.save();
	});
	process.on( 'uncaughtException', function(e){
		// alert('ERROR: Uncaught Exception');
		// console.log(e);
		console.log('ERROR: Uncaught Exception');
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
				// $dialog   = $('<div>');

				layoutReset();
				px.subapp();

				it.next(arg);
			}
		]).start({});

		window.focus();
	});

	return this;
})(jQuery, window);
