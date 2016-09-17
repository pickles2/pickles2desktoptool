new (function($, window){
	window.px = _this = this;
	this.$ = $;
	this._ = _;
	this.process = process;

	/**
	 * Pickles 2 Desktop Tool のバージョン情報を取得する。
	 *
	 * バージョン番号発行の規則は、 Semantic Versioning 2.0.0 仕様に従います。
	 * - [Semantic Versioning(英語原文)](http://semver.org/)
	 * - [セマンティック バージョニング(日本語)](http://semver.org/lang/ja/)
	 *
	 * *[ナイトリービルド]*<br />
	 * バージョン番号が振られていない、開発途中のリビジョンを、ナイトリービルドと呼びます。<br />
	 * ナイトリービルドの場合、バージョン番号は、次のリリースが予定されているバージョン番号に、
	 * ビルドメタデータ `+nb` を付加します。
	 * 通常は、プレリリース記号 `alpha` または `beta` を伴うようにします。
	 * - 例：1.0.0-beta.12+nb (=1.0.0-beta.12リリース前のナイトリービルド)
	 *
	 * @return string バージョン番号を示す文字列
	 */
	this.getVersion = function(){
		return _packageJson.version;
	}

	var _packageJson = require('../package.json');
	this.packageJson = _packageJson;

	var _utils = require('./index_files/_utils.node.js');
	this.utils = _utils;
	var _fs = require('fs');
	this.fs = _fs;
	var _fsEx = require('fs-extra');
	this.fsEx = _fsEx;
	var _path = require('path');
	this.path = _path;
	// var _git = require('nodegit');
	// this.git = _git;
	var _twig = require('twig');
	this.twig = _twig;
	var _utils79 = require('utils79');
	this.utils79 = _utils79;

	var _mkdirp = require('mkdirp');
	this.mkdirp = _mkdirp;

	var _glob = require('glob');
	this.glob = _glob;

	var _SearchInDir = require('node-search-in-directory');
	this.SearchInDir = _SearchInDir;

	var _appServer = require('./index_files/app_server.js');

	var _px2agent = require('px2agent');
	this.px2agent = _px2agent;

	var _Keypress = {};
	this.Keypress = _Keypress;

	var _db = {};
	var _path_data_dir = (process.env.HOME||process.env.LOCALAPPDATA) + '/'+_packageJson.pickles2.dataDirName+'/';
	var _path_db = (process.env.HOME||process.env.LOCALAPPDATA) + '/'+_packageJson.pickles2.dataDirName+'/db.json';

	var _px2dtLDA = require('px2dt-localdata-access').create(_path_data_dir);
	this.px2dtLDA = _px2dtLDA;

	// var _OS = require("os");
	// console.log(_OS.freemem());//<-free memory
	// console.log(_OS.totalmem());//<-total memory
	// console.log(_OS.platform());//<-darwin
	// console.log(_OS.hostname());//<-domain

	var _platform = (function(){
		var platform = 'unknown';
		if(process.env.LOCALAPPDATA)return 'win';
		if(process.env.HOME)return 'mac';
		return platform;
	})();
	var _current_app = null;
	var _selectedProject = null;
	var _pj = null;

	var _php = require('phpjs');
	this.php = _php;

	var _it79 = require('iterate79');
	this.it79 = _it79;

	// var _execSync = require('exec-sync');
	var _execSync = require('execsyncs')
	this.execSync = _execSync;

	var _nw_gui = require('nw.gui');
	var _appName = _packageJson.window.title;
	window.document.title = _appName;

	this.progress = new require('./index_files/pickles.progress.js').init(this, $);

	this.textEditor = window.textEditor;

	this.nodePhpBin = {};//init内で初期化される

	if( !_utils.isDirectory( _path_data_dir ) ){
		_fs.mkdirSync( _path_data_dir );
		if( !_utils.isDirectory( _path_data_dir ) ){
			alert( 'FAILED to make directory '+_path_data_dir );
			process.exit();
		}
	}

	if( !_fs.existsSync( _path_db ) ){
		_fs.writeFileSync(
			_path_db,
			JSON.stringify(
				{
					"commands":{} ,
					"apps":{
						"texteditor": null,
						"texteditorForDir": null
					} ,
					"projects":[] ,
					"network":{
						"preview":{
							"port": _packageJson.pickles2.network.preview.port,
							"accessRestriction": "loopback"
						},
						"appserver":{
							"port": _packageJson.pickles2.network.appserver.port
						}
					}
				}
			) ,
			{
				"encoding":"utf8",
				"mode":436,
				"flag":"w"
			}
		);
	}
	_path_db = _fs.realpathSync( _path_db );
	var $header, $footer, $main, $contents, $shoulderMenu;
	var _menu = [];

	/**
	 * アプリケーションの初期化
	 */
	function init(callback){
		_it79.fnc(
			{},
			[
				function(it1, data){
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

					px.log( 'Application start;' );
					it1.next();
					return;
				},
				function(it1, data){
					// 各国語言語切替機能のロード
					var LangBank = require('langbank');
					px.lb = new LangBank( require('path').resolve('./app/common/language/language.csv'), function(){
						px.lb.setLang('ja'); // default language
						// console.log(px.lb.get('welcome'));
						it1.next();
					}); // new LangBank()
					return;
				},
				function(it1, data){
					// ヒント機能のロード
					var Px2Hint = require('./index_files/pickles.hint.js');
					px.hint = new Px2Hint( px, require('path').resolve('./app/common/language/hint.csv'), function(){
						it1.next();
					}); // new LangBank()
					return;
				},
				function(it1, data){

					px.load(function(){
						it1.next();
						return;
					}); // px.load()

					return;
				},
				function(it1, data){
					var ComposerUpdateChecker = require('./index_files/pickles.composerUpdateChecker.js');
					px.composerUpdateChecker = new ComposerUpdateChecker( px, function(){
						it1.next();
					});
					return;
				},
				function(it1, data){
					if(!_db){_db = {};}
					if(!_db.commands){_db.commands = {};}
					if(!_db.projects){_db.projects = [];}
					if(!_db.network){_db.network = {};}
					if(!_db.network.preview){_db.network.preview = {};}
					if(!_db.network.appserver){_db.network.appserver = {};}
					if(!_db.apps){_db.apps = {};}
					if(!_db.apps.texteditor){_db.apps.texteditor = null;}
					if(!_db.apps.texteditorForDir){_db.apps.texteditorForDir = null;}
					if(!_db.language){_db.language = 'ja';}

					px.lb.setLang(_db.language);
					px.hint.setLang(_db.language);

					if( !_utils.isDirectory( _path_data_dir+'commands/' ) ){
						_fs.mkdirSync( _path_data_dir+'commands/' );
					}
					if( !_utils.isDirectory( _path_data_dir+'commands/composer/' ) ){
						_fs.mkdirSync( _path_data_dir+'commands/composer/' );
					}

					px.NodePhpBin = require('node-php-bin');
					px.nodePhpBinOptions = {};
					if( _db.commands && _db.commands['php'] ){
						px.nodePhpBinOptions = {
							'bin': _db.commands['php'] ,
							'ini': null
						};
					}
					px.nodePhpBin = px.NodePhpBin.get(px.nodePhpBinOptions);

					_menu = [
						{"label":px.lb.get('menu.home'),                 "cond":"projectSelected",    "area":"mainmenu", "app":"fncs/home/index.html", "cb": function(){px.subapp();}} ,
						{"label":px.lb.get('menu.sitemap'),         "cond":"pxStandby",          "area":"mainmenu", "app":"fncs/sitemap/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
						{"label":px.lb.get('menu.theme'),               "cond":"pxStandby",          "area":"mainmenu", "app":"fncs/theme/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
						{"label":px.lb.get('menu.pages'),           "cond":"pxStandby",          "area":"mainmenu", "app":"fncs/pages/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
						{"label":px.lb.get('menu.publish'),         "cond":"pxStandby",          "area":"mainmenu", "app":"fncs/publish/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
						{"label":px.lb.get('menu.dashboard'),      "cond":"projectSelected",    "area":"shoulder", "app":"index.html", "cb": function(){px.deselectProject();px.subapp();}} ,
						{"label":px.lb.get('menu.openFolder'),       "cond":"homeDirExists",      "area":"shoulder", "app":null, "cb": function(){px.getCurrentProject().open();}},
						{"label":px.lb.get('menu.openInBrowser'),       "cond":"pxStandby",          "area":"shoulder", "app":null, "cb": function(){px.openInBrowser();}},
						{"label":px.lb.get('menu.openInTexteditor'), "cond":"homeDirExists",      "area":"shoulder", "app":null, "cb": function(){px.openInTextEditor( px.getCurrentProject().get('path') );}},
						{"label":px.lb.get('menu.openInTerminal'), "cond":"homeDirExists",      "area":"shoulder", "app":null, "cb": function(){px.openInTerminal( px.getCurrentProject().get('path') );}},
						{"label":px.lb.get('menu.projectConfig'),     "cond":"pxStandby",          "area":"shoulder", "app":"fncs/config/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
						{"label":px.lb.get('menu.composer'),             "cond":"composerJsonExists", "area":"shoulder", "app":"fncs/composer/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
						{"label":px.lb.get('menu.git'),                  "cond":"homeDirExists",      "area":"shoulder", "app":"fncs/git/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
						{"label":px.lb.get('menu.preview'),           "cond":"pxStandby",          "area":"shoulder", "app":"fncs/preview/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
						{"label":px.lb.get('menu.moveContents'), "cond":"pxStandby",          "area":"shoulder", "app":"fncs/movecontents/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
						{"label":px.lb.get('menu.search'),               "cond":"pxStandby",          "area":"shoulder", "app":"fncs/search/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
						{"label":px.lb.get('menu.updateGuiContents'),"cond":"pxStandby",          "area":"shoulder", "app":"fncs/rebuild_guiedit_contents/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
						{"label":px.lb.get('menu.clearcache'),     "cond":"pxStandby",          "area":"shoulder", "app":"fncs/clearcache/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
						// {"label":"Reload(dev)",          "cond":"always", "cb": function(){window.location.href='index.html?';}} ,
						{"label":px.lb.get('menu.systemInfo'),         "cond":"always",             "area":"shoulder", "app":null, "cb": function(){px.dialog({
							title: px.lb.get('menu.systemInfo'),
							body: $('<iframe>').attr('src', 'mods/systeminfo/index.html').css({'width':'100%','height':300})
						});}} ,
						{"label":_appName+" "+px.lb.get('menu.desktoptoolConfig'), "cond":"always",        "area":"shoulder", "app":null, "cb": function(){px.editPx2DTConfig();}} ,
						{"label":px.lb.get('menu.help'),               "cond":"always",             "area":"shoulder", "app":null, "cb": function(){px.openHelp();} },
						{"label":px.lb.get('menu.developerTool'),     "cond":"always",             "area":"shoulder", "app":null, "cb": function(){require('nw.gui').Window.get().showDevTools();} },
						{"label":px.lb.get('menu.exit'),                 "cond":"always",             "area":"shoulder", "app":null, "cb": function(){px.exit();}}
					];

					if( !_utils.isFile( _path_data_dir+'commands/composer/composer.phar' ) ){
						(function(){
							var pathComposerPhar = {
								'from': require('path').resolve('./app/common/composer/composer.phar') ,
								'to': require('path').resolve(_path_data_dir, './commands/composer/composer.phar')
							};
							_fsEx.copy(pathComposerPhar.from, pathComposerPhar.to, function(err){
								if( err ){
									console.error(err);
									console.error('composer.phar のコピーに失敗しました。');
									alert('composer.phar のコピーに失敗しました。');
									px.closeDialog();
									it1.next(data);
									return;
								}
								_db.commands.composer = pathComposerPhar.to;
								px.save();
								px.closeDialog();
								it1.next(data);
								return;
							});

							var opt = {
								'title': '初期設定中...',
								'body': $('<p>'+_appName+' を初期設定しています。しばらくお待ちください。</p>') ,
								'buttons': []
							};

							px.dialog(opt);
						})();
					}else{
						it1.next(data);
						return;
					}
				},
				function(it1, data){
					callback();
				}

			]
		);
		return;
	}

	/**
	 * DBをロードする
	 */
	this.load = function(callback){
		callback = callback || function(){};
		if( !this.utils.isFile( _path_db ) ){
			callback();
			return false;
		}

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
		callback();
		return true;
	}

	/**
	 * DBを保存する
	 */
	this.save = function( callback ){
		callback = callback || function(){};
		var data = JSON.stringify( _db, null, 1 );
		_fs.writeFileSync( _path_db, data, {"encoding":"utf8","mode":436,"flag":"w"} );
		callback();
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
	 * プラットフォーム名を得る。
	 * Pickles2 Desktop Tool が動作しているPCのOS名。
	 */
	this.getPlatform = function(){
		return _platform;
	}

	/**
	 * ローカルのデータディレクトリのパスを得る。
	 */
	this.getDataDir = function(){
		return _path_data_dir;
	}

	/**
	 * ローカルのデータディレクトリを開く
	 */
	this.openDataDir = function(){
		return px.utils.openURL( _path_data_dir );
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

		var pj = new (require('./index_files/pickles.project.js')).classProject( window, this, projectInfo, _db.projects.length );
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
	this.deleteProject = function(projectId, callback){
		callback = callback || function(){};
		_db.projects.splice( projectId, 1 );
		this.deselectProject();
		this.save(function(){
			callback();
		});
		return true;
	}

	/**
	 * プロジェクトを選択する
	 */
	this.selectProject = function( num, callback ){
		callback = callback||function(){}
		if( typeof(num) != typeof(0) ){
			px.log( '[ERROR] FAILED to selectProject(' + typeof(num) + ')' );
			return false;
		}
		_selectedProject = num;

		px.log( 'selectProject(' + num + ')' );
		this.loadProject(function(){
			px.log( 'project "' + _pj.get('name') + '" is loaded.' );
			callback();
		});
		return true;
	}

	/**
	 * 選択されたプロジェクトをロードする
	 */
	this.loadProject = function( callback ){
		callback = callback||function(){}
		if( typeof(_selectedProject) != typeof(0) ){
			px.log( '[ERROR] FAILED to selectProject(' + typeof(num) + ')' );
			return false;
		}

		// alert(num);
		_pj = new (require('./index_files/pickles.project.js')).classProject(
			window,
			this,
			_db.projects[_selectedProject],
			_selectedProject,
			function(){
				console.log( 'project "' + _pj.get('name') + '" is reloaded.' );
				callback();
			}
		);
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
		if( cmd == 'composer' ){
			return _path_data_dir+'commands/composer/composer.phar';
		}
		if( cmd == 'open' ){
			if(_platform=='win'){
				return 'explorer';
			}
		}
		if( _db.commands && _db.commands[cmd] ){
			return _db.commands[cmd];
		}
		if( cmd == 'php' ){
			return require('node-php-bin').get().getPath();
		}
		return cmd;
	}

	/**
	 * composerを実行する
	 * node-php-bin の PHP などを考慮して、
	 * -c, -d オプションの解決を自動的にやっている前提で、
	 * composer コマンドを実行します。
	 * @param  {[type]} cmd  [description]
	 * @param  {[type]} opts [description]
	 * @return {[type]}      [description]
	 */
	this.execComposer = function( cmd, opts ){
		opts = opts||{};
		opts.success = opts.success||function(){};
		opts.error = opts.error||function(){};
		opts.complete = opts.complete||function(){};
		if( typeof(cmd) == typeof('') ){
			cmd = [cmd];
		}
		cmd.unshift(px.cmd('composer'));
		px.nodePhpBin.script(
			cmd ,
			{
				'cwd': opts.cwd
			} ,
			{
				'success': opts.success,
				'error': opts.error,
				'complete': opts.complete
			}
		);
		return this;
	}

	/**
	 * DBデータまるごと取得
	 */
	this.getDb = function(){
		return _db;
	}


	/**
	 * ブラウザで開く
	 */
	this.openInBrowser = function(){
		var px = this;
		this.preview.serverStandby(function(){
			px.utils.openURL( px.preview.getUrl() );
		});
	}

	/**
	 * ヘルプページを開く
	 */
	this.openHelp = function(){
		px.utils.openURL( 'http://pickles2.pxt.jp/manual/' );
		return;

		// var port = 8081;
		// if( _packageJson && _packageJson.pickles2 && _packageJson.pickles2.network && _packageJson.pickles2.network.appserver && _packageJson.pickles2.network.appserver.port ){
		// 	port = _packageJson.pickles2.network.appserver.port;
		// }
		// if( _db.network && _db.network.appserver && _db.network.appserver.port ){
		// 	port = _db.network.appserver.port;
		// }
		//
		// _appServer.serverStandby( this, port, './app/server_root/', function(){
		// 	px.utils.openURL( _appServer.getUrl() );
		// } );
		// return;
	}

	/**
	 * 外部テキストエディタで開く
	 */
	this.openInTextEditor = function( path ){
		var pathEditor = '';
		var targetType = null;
		if( this.utils.isDirectory(path) ){
			targetType = 'dir';
			pathEditor = this.getDb().apps.texteditorForDir;
		}else if( px.utils.isFile(path) ){
			targetType = 'file';
			pathEditor = this.getDb().apps.texteditor;
		}else{
			alert('編集対象のパスが存在しません。'+"\n"+path);
			console.error('ERROR: '+'編集対象のパスが存在しません。'+"\n"+path);
			return false;
		}

		var msgSudgestSetting = _appName+'設定 メニューから、アプリケーション "外部テキストエディタ'+(targetType=='dir'?'(ディレクトリを開く)':'')+'" を設定してください。';
		if( !this.getDb().apps || ( !pathEditor.length && !this.utils.isDirectory(pathEditor) ) ){
			alert('外部テキストエディタが設定されていないか、存在しません。' + "\n" + msgSudgestSetting);
			console.error('ERROR: '+'外部テキストエディタが設定されていないか、存在しません。');
			return false;
		}
		if(_platform=='win'){
			px.utils.spawn(
				pathEditor,
				[
					path
				],
				{}
			);
		}else{
			px.utils.spawn(
				px.cmd('open'),
				[
					path,
					'-a',
					pathEditor
				],
				{}
			);
		}
		return true;
	}

	/**
	 * ターミナルで開く
	 */
	this.openInTerminal = function( path ){
		if( !this.utils.isDirectory(path) && !px.utils.isFile(path) ){
			alert('編集対象のパスが存在しません。'+"\n"+path);
			console.error('ERROR: '+'編集対象のパスが存在しません。'+"\n"+path);
			return false;
		}

		if(_platform=='win'){
			px.utils.spawn(
				'cmd',
				[
					path
				],
				{}
			);
		}else{
			px.utils.spawn(
				px.cmd('open'),
				[
					'-a',
					'Terminal',
					path
				],
				{}
			);
		}
		return true;
	}


	/**
	 * ループバックIPアドレスかどうか調べる
	 */
	this.isLoopbackIp = function( ip ){
		switch( ip ){
			case '127.0.0.1':
			case '::127.0.0.1':
			case '::ffff:127.0.0.1':
			case '::1':
			case '0::1':
			case '0000::0001':
			case '0:0:0:0:0:0:0:1':
			case '0000:0000:0000:0000:0000:0000:0000:0001':
				// ホワイトリスト: ローカルIPは通す
				// ↑もっといい書き方ないか？
				return true;
				break;
			default:
				return false;
				break;
		}
		return false;
	}

	/**
	 * サブアプリケーション
	 */
	this.subapp = function(appName){
		var $cont = $('.contents').eq(0);
		$cont.html('<p style="text-align:center; margin: 4em auto;">Loading...</p>');

		if( typeof(_selectedProject) != typeof(0) ){
			appName = '';
		}else if( !appName && typeof(_selectedProject) == typeof(0) ){
			appName = 'fncs/home/index.html';
		}

		if( appName ){
			this.loadProject(function(){ // プロジェクトオブジェクトをリロードする。
				$cont
					.html('')
					.append(
						$('<iframe>')
							.attr('src', './'+appName)
					)
				;

				_current_app = appName;
				layoutReset();
				$contents.scrollTop(0);
			});
			return;

		}else{
			// プロジェクト選択画面を描画
			$cont.html( $('script#template-selectProject-page').html() );
			$cont.find('.cont_top_footer p').text( _packageJson.pickles2.credit );

			var list = this.getProjectList();
			if( list.length ){
				var $ul = $('<div class="list-group">');
				for( var i = 0; i < list.length; i++ ){
					$ul.append(
						$('<a class="list-group-item">')
							.attr('href', 'javascript:;')
							.data('path', list[i].path)
							.data('num', i)
							.click( function(){
								var timer = setTimeout(function(){
									px.progress.start({"showProgressBar":true, 'blindness':true});
								}, 1000);
								px.selectProject( $(this).data('num'), function(){
									clearTimeout(timer);
									px.progress.close();
									px.subapp();
								} );
							} )
							.text( list[i].name )
					);
				}

				$('.cont_project_list', $cont)
					.html('')
					.append($ul)
				;

			}else{
				$('.cont_project_list', $cont)
					.html('<p>プロジェクトは登録されていません。</p>')
				;
			}
			_current_app = appName;
			layoutReset();
			$contents.scrollTop(0);
			return;
		}
	}


	/**
	 * ドロップ操作を無効化する
	 * @param  {element} $elm element object.
	 * @return {[type]}     [description]
	 */
	this.cancelDrop = function($elm){
		$($elm)
			.bind( 'drop', function(e){
				// ドロップ操作を無効化
				// console.log(456);
				e.preventDefault();
				e.stopPropagation();
				return false;
			} )
			.bind( 'dragenter', function(e){
				// ドロップ操作を無効化
				// console.log(45645);
				e.preventDefault();
				e.stopPropagation();
				return false;
			} )
			.bind( 'dragover', function(e){
				// ドロップ操作を無効化
				// console.log(23456);
				e.preventDefault();
				e.stopPropagation();
				return false;
			} )
		;
		return $elm;
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

		$('.theme_gmenu').html('<ul>');
		$shoulderMenu.find('ul').html('');
		for( var i in _menu ){
			if( _menu[i].cond == 'projectSelected' ){
				if( cpj === null ){
					continue;
				}
			}else if( _menu[i].cond == 'composerJsonExists' ){
				if( cpj === null || !cpj_s.composerJsonExists ){
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
				case 'shoulder':
					$shoulderMenu.find('ul').append( $('<li>')
						.append( $tmpMenu )
					);
					break;
				default:
					$('.theme_gmenu ul').append( $('<li>')
						.append( $tmpMenu )
					);
					break;
			}
		}

		if( cpj === null ){
			$('.theme_id')
				.html('')
				// .append( $('<strong>')
				// 	.text( _appName )
				// )
			;
		}else{
			$('.theme_id')
				.html('')
				// .append( $('<a>')
				// 	.attr('href', 'javascript:;')
				// 	.text( _appName )
				// 	.click(function(){
				// 		px.deselectProject(); px.subapp();
				// 		return false;
				// 	})
				// )
			;
			if( cpj.get('name') ){
				$('.theme_id').append( $('<div>')
					.text( /* '-> ' + */ cpj.get('name') )
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
				'top': $header.height()+0 ,
				'right': 0 ,
				'height': $(document).height() - $header.height() - $footer.height() - 0
			})
		;
		$contents.find('>iframe')
			.css({
				'height': $contents.height() - 10
			})
		;

		var $ul = $shoulderMenu.find('ul');
		$shoulderMenu.find('button')
			.css({
				'height': $header.height()
			})
		;
		$ul.css({
			top: $header.height() ,
			height: $(window).height()-$header.height()
		});
		if( $ul.css('display') == 'block' ){
			$shoulderMenu.css({
				width: '100%' ,
				height: $(window).height()
			});
		}else{
			$shoulderMenu
				.css({
					'height': $header.height()
				})
			;
		}

	}

	/**
	 * ログをファイルに出力
	 */
	this.log = function( msg ){
		var path = _path_data_dir + 'common_log.log';
		var row = ( (function(){
			var d = new Date();
			function pad(n){return n<10 ? '0'+n : n}
			var rtn = '';
			rtn +=
				d.getUTCFullYear()+'-'
				+ pad(d.getUTCMonth()+1)+'-'
				+ pad(d.getUTCDate())+'T'
				+ pad(d.getUTCHours())+':'
				+ pad(d.getUTCMinutes())+':'
				+ pad(d.getUTCSeconds())+'Z'
			;
			return rtn;
		})() ) + '	' + process.pid + '	' + msg + "\n";
		console.log(row);
		this.fs.appendFileSync( path, row, {} );
		return true;
	}

	/**
	 * イベントセット
	 */
	process.on( 'exit', function(e){
		px.log( 'Application exit;' );
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


	/**
	 * アプリケーションを初期化
	 */
	$(function(){
		px.utils.iterateFnc([
			function(it, arg){
				// init
				init(function(){
					it.next(arg);
				});
			} ,
			function(it, arg){

				// DOMスキャン
				$header   = $('.theme_header');
				$contents = $('.contents');
				$footer   = $('.theme_footer');
				// $dialog   = $('<div>');
				$shoulderMenu = $('.theme_shoulder_menu');

				$header.css({
					'border-bottom-color': _packageJson.pickles2.colors.defaultKeyColor,
					'color': _packageJson.pickles2.colors.defaultKeyColor
				});
				$header.find('.theme_px2logo a')
					.html(function(){
						var src = _fs.readFileSync('./app/common/images/logo.svg').toString();
						return src;
					})
					.find('path')
					.attr({'fill':_packageJson.pickles2.colors.defaultKeyColor})
				;

				it.next(arg);

			} ,
			function(it, arg){
				var $ul = $shoulderMenu.find('ul').hide();
				$shoulderMenu
					.css({
						'width': 50,
						'height': $header.height()
					})
					.click(function(){
						if( $ul.css('display') == 'block' ){
							$ul.hide();
							$shoulderMenu
								.css({
									'width':50 ,
									'height':$header.height()
								})
							;

						}else{
							$ul.show().height( $(window).height()-$header.height() );
							$shoulderMenu
								.css({
									'width':'100%' ,
									'height':$(window).height()
								})
							;

						}
					}
				);
				it.next(arg);
			} ,
			function(it, arg){
				_Keypress = new window.keypress.Listener();
				this.Keypress = _Keypress;

				_Keypress.simple_combo("backspace", function(e) {
					// バックスペースキーで編集画面などが閉じてしまう問題の対策。
					// px.message("You pressed backspace");
					switch(e.target.tagName.toLowerCase()){
						case 'input': case 'textarea':
							if(!$(e.target).attr('readonly')){
								return true;
							}
							break;
					}
					e.preventDefault();
					e.stopPropagation();
					return false;
				});
				_Keypress.simple_combo("delete", function(e) {
					// バックスペースキーで編集画面などが閉じてしまう問題の対策。
					// px.message("You pressed delete");
					switch(e.target.tagName.toLowerCase()){
						case 'input': case 'textarea':
							if(!$(e.target).attr('readonly')){
								return true;
							}
							break;
					}
					e.preventDefault();
					e.stopPropagation();
					return false;
				});
				// _Keypress.simple_combo("escape", function(e) {
				// 	// px.message("You pressed escape");
				// 	e.preventDefault();
				// });

				_this.cancelDrop('html, body');

				it.next(arg);
			} ,
			function(it, arg){
				layoutReset();
				px.subapp();

				it.next(arg);
			}
		]).start({});

		window.focus();
	});

	return this;
})(jQuery, window);
