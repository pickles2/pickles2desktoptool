new (function($, window){
	window.px = $.px = this;
	this.$ = $;

	/**
	 * Pickles 2 Desktop Tool のバージョン情報を取得する。
	 * 
	 * <pre> [バージョン番号のルール]
	 *    基本
	 *      メジャーバージョン番号.マイナーバージョン番号.リリース番号
	 *        例：1.0.0
	 *        例：1.8.9
	 *        例：12.19.129
	 *      - 大規模な仕様の変更や追加を伴う場合にはメジャーバージョンを上げる。
	 *      - 小規模な仕様の変更や追加の場合は、マイナーバージョンを上げる。
	 *      - バグ修正、ドキュメント、コメント修正等の小さな変更は、リリース番号を上げる。
	 *    開発中プレビュー版
	 *      基本バージョンの後ろに、a(=α版)またはb(=β版)を付加し、その連番を記載する。
	 *        例：1.0.0a1 ←最初のα版
	 *        例：1.0.0b12 ←12回目のβ版
	 *      開発中およびリリースバージョンの順序は次の通り
	 *        1.0.0a1 -> 1.0.0a2 -> 1.0.0b1 ->1.0.0b2 -> 1.0.0 ->1.0.1a1 ...
	 *    ナイトリービルド
	 *      ビルドの手順はないので正確には "ビルド" ではないが、
	 *      バージョン番号が振られていない、開発途中のリビジョンを
	 *      ナイトリービルドと呼ぶ。
	 *      ナイトリービルドの場合、バージョン情報は、
	 *      ひとつ前のバージョン文字列の末尾に、'-nb' を付加する。
	 *        例：1.0.0b12-nb (=1.0.0b12リリース後のナイトリービルド)
	 *      普段の開発においてコミットする場合、
	 *      必ずこの get_version() がこの仕様になっていることを確認すること。
	 * </pre>
	 * 
	 * @return string バージョン番号を示す文字列
	 */
	this.getVersion = function(){
		return '2.0.0b2-nb';
	}

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
	// this.server = require('./index_files/px_server_emurator.node.js').init(this,$);
	var _appName = 'Pickles 2 Desktop Tool';

	if( !_utils.isDirectory( _path_data_dir ) ){
		_fs.mkdirSync( _path_data_dir );
		if( !_utils.isDirectory( _path_data_dir ) ){
			alert( 'FAILED to make directory '+_path_data_dir );
			process.exit();
		}
	}

	if( !_fs.existsSync( _path_db ) ){
		_fs.writeFileSync( _path_db,
			JSON.stringify(
				{
					"commands":{} ,
					"projects":[] ,
					"network":{
						"preview":{
							"port": 8080
						}
					}
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
		{"label":"テーマ",       "cond":"pxStandby",       "area":"mainmenu", "app":"fncs/theme/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"コンテンツ",   "cond":"pxStandby",       "area":"mainmenu", "app":"fncs/pages/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"パブリッシュ", "cond":"pxStandby",       "area":"mainmenu", "app":"fncs/publish/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"clearcache",   "cond":"pxStandby",       "area":"footer", "app":"fncs/clearcache/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Config",       "cond":"pxStandby",       "area":"footer", "app":"fncs/config/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Preview",      "cond":"pxStandby",       "area":"footer", "app":"fncs/preview/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"composer",     "cond":"pxStandby",       "area":"footer", "app":"fncs/composer/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"git",          "cond":"pxStandby",       "area":"footer", "app":"fncs/git/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":"Finderで開く", "cond":"homeDirExists",   "area":"footer", "app":null, "cb": function(){px.getCurrentProject().open();}},
		// {"label":"Reload(dev)", "cond":"always", "cb": function(){window.location.href='index.html?';}} ,
		{"label":"System Info",  "cond":"always",          "area":"footer", "app":null, "cb": function(){px.dialog({
			title: 'System Info',
			body: $('<iframe>').attr('src', 'mods/systeminfo/index.html').css({'width':'100%','height':300})
		});}} ,
		{"label":"Px2DT 設定",   "cond":"always",          "area":"footer", "app":null, "cb": function(){px.editPx2DTConfig();}} ,
		{"label":"終了",         "cond":"always",          "area":"footer", "app":null, "cb": function(){px.exit();}}
	];


	/**
	 * アプリケーションの初期化
	 */
	function init(cb){
		(function(){
			// node-webkit の標準的なメニューを出す
			var win = _nw_gui.Window.get();
			var nativeMenuBar = new _nw_gui.Menu({ type: "menubar" });
			try {
				nativeMenuBar.createMacBuiltin( _appName );
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

		if(!_db){_db = {};}
		if(!_db.commands){_db.commands = {};}
		if(!_db.projects){_db.projects = [];}
		if(!_db.network){_db.network = {};}
		if(!_db.network.preview){_db.network.preview = {};}

		if( !_utils.isDirectory( _path_data_dir+'commands/' ) ){
			_fs.mkdirSync( _path_data_dir+'commands/' );
		}
		if( !_utils.isDirectory( _path_data_dir+'commands/composer/' ) ){
			_fs.mkdirSync( _path_data_dir+'commands/composer/' );
		}
		if( !_utils.isFile( _path_data_dir+'commands/composer/composer.phar' ) ){
			(function(){
				var opt = {
					'title': '初期設定中...',
					'body': $('<p>Pickles 2 Desktop Tool を初期設定しています。インターネットに接続したまま、しばらくお待ちください。</p>') ,
					'buttons': []
				};
				px.utils.exec(
					'php -r "readfile(\'https://getcomposer.org/installer\');" | php' ,
					function(){
						_db.commands.composer = _path_data_dir+'commands/composer/composer.phar';
						px.save();
						px.closeDialog();
						cb();
					},
					{cd: _path_data_dir+'commands/composer/'}
				);

				px.dialog(opt);
			})();
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
		var data = JSON.stringify( _db, null, 1 );
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
		_db.projects.splice( projectId, 1 );
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
			}else if( _menu[i].cond == 'homeDirExists' ){
				if( cpj === null || !cpj_s.homeDirExists ){
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

		if( cpj === null ){
			$('.theme_id')
				.html('')
				.append( $('<strong>')
					.text( _appName )
				)
			;
		}else{
			$('.theme_id')
				.html('')
				.append( $('<a>')
					.attr('href', 'javascript:;')
					.text( _appName )
					.click(function(){
						px.deselectProject(); px.subapp();
						return false;
					})
				)
			;
			if( cpj.get('name') ){
				$('.theme_id').append( $('<div>')
					.text( cpj.get('name') )
				);

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
		// console.log('ERROR: Uncaught Exception');
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
