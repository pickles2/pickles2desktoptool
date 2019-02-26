new (function($, window){
	// pickles
	var _this = this;
	window.px = this;
	this.px2style = window.px2style;

	// node.js
	this.process = process;

	this.cwd = process.cwd();

	// NW.js
	this.nw = nw;
	this.nwWindow = nw.Window.get();

	// jQuery
	this.$ = $;

	// package.json
	var _packageJson = require('../package.json');
	this.packageJson = _packageJson;

	// data
	var _path_data_dir = (process.env.HOME||process.env.LOCALAPPDATA) + '/'+_packageJson.pickles2.dataDirName+'/';


	/**
	 * Pickles 2 のバージョン情報を取得する。
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

	// utils
	var _utils79 = require('utils79');
	this.utils79 = _utils79;
	var _utils = require('./index_files/_utils.node.js');
	this.utils = _utils;

	// filesystem
	var _fs = require('fs');
	this.fs = _fs;
	var _fsEx = require('fs-extra');
	this.fsEx = _fsEx;
	var _path = require('path');
	this.path = _path;
	// var _git = require('nodegit');
	// this.git = _git;
	var _mkdirp = require('mkdirp');
	this.mkdirp = _mkdirp;
	var _glob = require('glob');
	this.glob = _glob;
	var _SearchInDir = require('node-search-in-directory');
	this.SearchInDir = _SearchInDir;

	// versioning
	var _semver = require('semver');
	this.semver = _semver;

	// template engines
	var _twig = require('twig');
	this.twig = _twig;
	var _ejs = require('ejs');
	this.ejs = _ejs;
	var _csv = require('csv');
	this.csv = _csv;

	var _appServer = require('./index_files/app_server.js');

	// Pickles 2
	var _px2agent = require('px2agent');
	this.px2agent = _px2agent;
	var _px2dtLDA = new (require('px2dt-localdata-access'))(
		_path_data_dir,
		{
			"updated": function(updatedEvents){
				console.log('Px2DTLDA Data Updated:', updatedEvents);
			}
		}
	);
	this.px2dtLDA = _px2dtLDA;

	// broccoli-html-editor
	var _BroccoliStuleGuideGen = require('broccoli-styleguide-generator');
	this.BroccoliStuleGuideGen = _BroccoliStuleGuideGen;

	// DOM Parser for NodeJS
	var _cheerio = require('cheerio');
	this.cheerio = _cheerio;

	// Keyboard Util
	var _Keypress = {};
	this.Keypress = _Keypress;


	// var _OS = require("os");
	// console.log(_OS.freemem());//<-free memory
	// console.log(_OS.totalmem());//<-total memory
	// console.log(_OS.platform());//<-darwin
	// console.log(_OS.hostname());//<-domain

	var _platform = (function(){
		var platform = 'unknown';
		console.log('platform:', process.platform);
		if(process.platform == 'win32'){return 'win';}
		if(process.platform == 'darwin'){return 'mac';}
		if(process.platform == 'linux'){return 'linux';}
		console.log('unknown platform:', process.platform);
		return platform;
	})();
	console.log('platform: '+_platform);
	var _current_app = null;
	var _selectedProject = null;
	var _pj = null;

	var _php = require('phpjs');
	this.php = _php;

	var _it79 = require('iterate79');
	this.it79 = _it79;

	var _nw_gui = require('nw.gui');
	var _appName = _packageJson.window.title;
	window.document.title = _appName;

	this.progress = new require('./index_files/pickles.progress.js').init(this, $);

	this.textEditor = window.textEditor;

	this.nodePhpBin = {};//init内で初期化される

	var $header, $footer, $main, $contents, $shoulderMenu;
	var _menu = [];

	this.cookie = $.cookie;

	// Auto Updater
	var AutoUpdater = require('./index_files/auto_updater.js'),
		autoUpdater = new AutoUpdater(window, this);
	this.getAutoUpdater = function(){ return autoUpdater; }

	/**
	 * アプリケーションの初期化
	 */
	function init(callback){
		_it79.fnc({},
			[
				function(it1){
					// AutoUpdater: Installer Mode
					if( autoUpdater.isInstallerMode() ) {
						autoUpdater.doAsInstallerMode( $('body') );
						return;
					}
					it1.next();
				},
				function(it1){
					// データディレクトリを初期化
					px.px2dtLDA.initDataDir(function(result){
						if( !result ){
							console.error('FAILED to Initialize data directory. - '+_path_data_dir);
						}
						px.px2dtLDA.db.commands.php = px.px2dtLDA.db.commands.php || '';
						px.px2dtLDA.db.commands.git = px.px2dtLDA.db.commands.git || '';
						px.px2dtLDA.db.language = px.px2dtLDA.db.language || 'ja';
						px.px2dtLDA.db.apps.texteditor = px.px2dtLDA.db.apps.texteditor || '';
						px.px2dtLDA.db.apps.texteditorForDir = px.px2dtLDA.db.apps.texteditorForDir || '';
						px.px2dtLDA.db.network.preview = px.px2dtLDA.db.network.preview || {};
						px.px2dtLDA.db.network.preview.port = px.px2dtLDA.db.network.preview.port || _packageJson.pickles2.network.preview.port;
						px.px2dtLDA.db.network.preview.accessRestriction = px.px2dtLDA.db.network.preview.accessRestriction || "loopback";
						px.px2dtLDA.db.network.appserver = px.px2dtLDA.db.network.appserver || {};
						px.px2dtLDA.db.network.appserver.port = px.px2dtLDA.db.network.appserver.port || _packageJson.pickles2.network.appserver.port;

						px.px2dtLDA.save(function(){
							it1.next();
						});
					});
				},
				function(it1){
					// Command Queue をセットアップ
					var CommandQueue = require('./index_files/cmdQueueCtrl.js');
					_this.commandQueue = new CommandQueue(_this, window);
					it1.next();
				},
				function(it1){

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
						// var tray = new _nw_gui.Tray({ icon: './common/images/appicon.png' });
						// tray.title = 'Love Tray';
						// tray.tooltip = 'Love Tooltip';

					})();

					px.log( 'Application start;' );
					it1.next();
					return;
				},
				function(it1){
					// 各国語言語切替機能のロード
					var LangBank = require('langbank');
					px.lb = new LangBank( require('path').resolve('./app/common/language/language.csv'), function(){
						px.lb.setLang(px.px2dtLDA.getLanguage());
						// console.log(px.lb.get('welcome'));
						it1.next();
					}); // new LangBank()
					return;
				},
				function(it1){
					// ヒント機能のロード
					var Px2Hint = require('./index_files/pickles.hint.js');
					px.hint = new Px2Hint( px, require('path').resolve('./app/common/language/hint.csv'), function(){
						px.hint.setLang(px.px2dtLDA.getLanguage());
						it1.next();
					}); // new LangBank()
					return;
				},
				function(it1){
					// file watcher
					var FileWatcher = require('./index_files/pickles.watcher.js');
					px.watcher = new FileWatcher( px );
					it1.next();
					return;
				},
				function(it1){
					// db.json の読み込み
					px.load(function(){
						it1.next();
						return;
					}); // px.load()
					return;
				},
				function(it1){
					// ウィンドウ位置とサイズの初期化
					var db = px.px2dtLDA.getData();
					var winPosition = {
						"x": 0,
						"y": 0,
						"width": window.screen.width,
						"height": window.screen.height
					};
					try{
						if( typeof(db.extra.px2dt.windowPosition) === typeof({}) ){
							winPosition = db.extra.px2dt.windowPosition;
						}
					}catch(e){}
					px.nwWindow.moveTo(winPosition.x, winPosition.y);
					px.nwWindow.resizeTo(winPosition.width, winPosition.height);

					it1.next();
					return;
				},
				function(it1){
					var ComposerInstallChecker = require('./index_files/pickles.composerInstallChecker.js');
					px.composerInstallChecker = new ComposerInstallChecker( px, function(){
						it1.next();
					});
					return;
				},
				function(it1){
					// CSS拡張
					$('head').append( $('<style>')
						.html(
							'.theme-header__gmenu ul li a:hover,'
							+'.theme-header__gmenu ul li a.current{color: '+_packageJson.pickles2.colors.defaultKeyColor+';}'
							+'.theme-header__shoulder-menu button {border-left: 1px solid '+_packageJson.pickles2.colors.defaultKeyColor+';}'
							+'.theme-header__shoulder-menu ul li a.current {background-color: '+_packageJson.pickles2.colors.defaultKeyColor+';}'
						)
					);
					it1.next();
					return;
				},
				function(it1){
					// setup "node-php-bin"
					px.NodePhpBin = require('node-php-bin');
					px.nodePhpBinOptions = {
						// パスが通った php コマンドで初期化
						// ※ 2018-03-26 @tomk79
						// 　macOS の ElCapitan 以降、 openssl と libxml2 が利用できない環境があり、
						// 　node-php-bin 内蔵の php の利用を一時中断することになった。
						'bin': 'php' ,
						'ini': null
					};
					if( px.px2dtLDA.db.commands && px.px2dtLDA.db.commands['php'] ){
						px.nodePhpBinOptions = {
							'bin': px.px2dtLDA.db.commands['php'] ,
							'ini': null
						};
					}
					px.nodePhpBin = px.NodePhpBin.get(px.nodePhpBinOptions);
					it1.next();
					return;
				},
				function(it1){
					// メニュー設定
					var gmenu = require('./index_files/globalmenu.js');
					_menu = new gmenu(px);
					it1.next();
				},
				function(it1){
					// 開発者のための隠しコマンド
					// Ctrl + Opt + R で トップフレームを再読込する
					$(window).on('keypress', function(e){
						// console.log(e);
						if(e.keyCode == 18 && e.ctrlKey && e.altKey ){
							window.location.href='./index.html';
						}
					});
					it1.next();
				},
				function(it1){
					// HTMLコードを配置
					$('body').html( document.getElementById('template-outer-frame').innerHTML );
					it1.next();
				},

				function(it1){
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
		// db.json の読み込み・初期化
		px.px2dtLDA.load(function(){
			callback();
		})
		return;
	}

	/**
	 * DBを保存する
	 */
	this.save = function(callback){
		callback = callback || function(){};

		if( autoUpdater.isInstallerMode() ) {
			// インストールモード時には保存しない。
			// 上書きして破壊してしまう恐れがあるため。
			callback();
			return;
		}

		var db = px.px2dtLDA.getData();
		var winPosition = {
			"x": px.nwWindow.x,
			"y": px.nwWindow.y,
			"width": px.nwWindow.window.outerWidth,
			"height": px.nwWindow.window.outerHeight
		};

		db.extra = db.extra || {};
		db.extra.px2dt = db.extra.px2dt || {};
		db.extra.px2dt.windowPosition = winPosition;
		px.px2dtLDA.setData(db);

		px.px2dtLDA.save(function(){
			// プロジェクト別のアプリケーションデータを削除する
			var pjAll = px.px2dtLDA.getProjectAll();
			var pjAllIds = {};
			for(let idx in pjAll){
				pjAllIds[pjAll[idx].id] = true;
			}
			var baseDir = px.px2dtLDA.getAppDataDir('px2dt');
			var filelist = px.fs.readdirSync(baseDir);
			for(let idx in filelist){
				var filename = filelist[idx];
				var filenamePjId = filename.replace(/\.[a-zA-Z0-9]+$/g, '');
				try {
					if( !pjAllIds[filenamePjId] ){
						px.fs.unlinkSync(baseDir+'/'+filename);
					}
				} catch (e) {
				}
			}

			callback();
		});
		return;
	}

	/**
	 * プラットフォーム名を得る。
	 * Pickles 2 が動作しているPCのOS名。
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
	this.getProjectList = function(callback){
		callback = callback || function(){};
		var projects = this.px2dtLDA.getProjectAll();
		// var rtn = px.px2dtLDA.db.projects;
		callback(projects);
		return;
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
			projectInfo.home_dir = '';
		}
		if( typeof(projectInfo.entry_script) != typeof('') || !projectInfo.entry_script.length ){
			projectInfo.entry_script = '';
		}

		var result = this.validateProjectInfo(projectInfo);
		if( result.isError ){
			opt.error(result.errorMsg);
			opt.complete();
			return false;
		}

		var result = px.px2dtLDA.addProject( projectInfo );
		if( result === false ){
			opt.error({'common': 'Unknown ERROR'});
			opt.complete();
			return false;
		}
		px.save(function(){
			opt.success();
			opt.complete();
		});

		return true;
	}

	/**
	 * プロジェクト情報の入力値を検証する
	 */
	this.validateProjectInfo = function(projectInfo){
		var result = {
			isError: false,
			errorMsg: {}
		};

		// name
		if( typeof(projectInfo.name) != typeof('') || !projectInfo.name.length ){
			result.errorMsg.name = 'name は必須項目です。 name is required.';
			result.isError = true;
		}

		// path
		if( typeof(projectInfo.path) != typeof('') || !projectInfo.path.length ){
			result.errorMsg.path = 'path は必須項目です。 path is required.';
			result.isError = true;
		}else if( !px.utils79.is_dir(projectInfo.path) ){
			result.errorMsg.path = '存在するディレクトリを選択してください。 path is required as a existed directory path.';
			result.isError = true;
		}else if( !px.utils79.is_file(projectInfo.path+'/composer.json') ){
			var path_filelist = require('fs').readdirSync(projectInfo.path);
			var filelist_length = 0;
			for(var i in path_filelist){
				switch( path_filelist[i] ){
					case '.DS_Store':
					case 'Thumbs.db':
					case 'composer.json':
						break;
					default:
						filelist_length ++;
						break;
				}
			}
			if( filelist_length ){
				result.errorMsg.path = '内容が空のディレクトリか、または composer.json が置かれているディレクトリを選択してください。';
				result.isError = true;
			}
		}
	
		return result;
	}

	/**
	 * プロジェクト情報を更新する
	 */
	this.updateProject = function(projectId, projectInfo){
		if( typeof(projectId) !== typeof(0) ){
			return false;
		}
		projectInfo = JSON.parse( JSON.stringify( projectInfo ) );

		var result = this.validateProjectInfo(projectInfo);
		if( result.isError ){
			return false;
		}

		px.px2dtLDA.db.projects[projectId] = projectInfo;
		return true;
	}

	/**
	 * プロジェクトを削除する
	 */
	this.deleteProject = function(projectId, callback){
		callback = callback || function(){};
		var result = px.px2dtLDA.removeProject( projectId );
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

		// ファイル監視の停止
		px.watcher.stop();

		// alert(num);
		_pj = new (require('./index_files/pickles.project.js'))(
			window,
			this,
			px.px2dtLDA.db.projects[_selectedProject],
			_selectedProject,
			function(){
				// ファイル監視を開始
				px.watcher.start(_pj);

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
		px.watcher.stop(); // ファイル監視の停止
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
			if(_platform=='linux'){
				return 'xdg-open';
			}
		}
		if( px.px2dtLDA.db.commands && px.px2dtLDA.db.commands[cmd] ){
			return px.px2dtLDA.db.commands[cmd];
		}
		if( cmd == 'php' ){
			return this.nodePhpBin.getPath();
		}
		return cmd;
	}

	/**
	 * composerを実行する
	 * node-php-bin の PHP などを考慮して、
	 * -c, -d オプションの解決を自動的にやっている前提で、
	 * composer コマンドを実行します。
	 * @param  {Array}  cmd  `php`, `composer` を含まないコマンドオプションの配列
	 * @param  {Object} opts [description]
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
		return px.px2dtLDA.getData();
	}


	/**
	 * ブラウザで開く
	 */
	this.openInBrowser = function(){
		var px = this;

		// 外部プレビューサーバーの設定があるか調べる
		var pj = px.getCurrentProject();
		if(pj){
			var px2dtLDA_Pj = px.px2dtLDA.project(pj.projectId);
			var external_preview_server_origin = px2dtLDA_Pj.getExtendedData('external_preview_server_origin');
			if( typeof(external_preview_server_origin)==typeof('') && external_preview_server_origin.match(/^https?\:\/\//i) ){
				// 外部プレビューサーバーが設定されていたら、
				// 内蔵サーバーの起動はせず、ブラウザを呼び出す。
				px.utils.openURL( px.preview.getUrl() );
				return;
			}
		}

		this.preview.serverStandby(function(result){
			if(result === false){
				px.message('プレビューサーバーの起動に失敗しました。');
				return;
			}
			px.utils.openURL( px.preview.getUrl() );
		});
		return;
	}

	/**
	 * ヘルプページを開く
	 */
	this.openHelp = function(){
		px.utils.openURL( 'http://pickles2.pxt.jp/manual/' );
		return;
	}

	/**
	 * 外部テキストエディタで開く
	 */
	this.openInTextEditor = function( path ){
		var pathEditor = '';
		var targetType = null;
		var externalAppName;
		if( this.utils.isDirectory(path) ){
			targetType = 'dir';
			externalAppName = 'texteditorForDir';
			pathEditor = this.getDb().apps.texteditorForDir;
		}else if( px.utils.isFile(path) ){
			targetType = 'file';
			externalAppName = 'texteditor';
			pathEditor = this.getDb().apps.texteditor;
		}else{
			alert('編集対象のパスが存在しません。'+"\n"+path);
			console.error('ERROR: '+'編集対象のパスが存在しません。'+"\n"+path);
			return false;
		}

		var msgSudgestSetting = _appName+'設定 メニューから、アプリケーション "外部テキストエディタ'+(targetType=='dir'?'(ディレクトリを開く)':'')+'" を設定してください。';
		if( !this.getDb().apps || ( !pathEditor.length && !this.utils.isDirectory(pathEditor) && !this.utils.isFile(pathEditor) ) ){
			alert('外部テキストエディタが設定されていないか、存在しません。' + "\n" + msgSudgestSetting);
			console.error('ERROR: '+'外部テキストエディタが設定されていないか、存在しません。');
			return false;
		}
		px.px2dtLDA.startApp(externalAppName, {PATH: path});
		return true;
	}

	/**
	 * 外部Gitクライアントで開く
	 */
	this.openInGitClient = function( path ){
		var pathEditor = '';
		var targetType = null;
		var externalAppName;
		if( this.utils.isDirectory(path) ){
			targetType = 'dir';
			externalAppName = 'gitClient';
			pathEditor = this.getDb().apps.gitClient;
		}else{
			alert('編集対象のパスが存在しません。'+"\n"+path);
			console.error('ERROR: '+'編集対象のパスが存在しません。'+"\n"+path);
			return false;
		}

		var msgSudgestSetting = _appName+'設定 メニューから、アプリケーション "外部Gitクライアント" を設定してください。';
		if( !this.getDb().apps || ( !pathEditor.length && !this.utils.isDirectory(pathEditor) && !this.utils.isFile(pathEditor) ) ){
			alert('外部Gitクライアントが設定されていないか、存在しません。' + "\n" + msgSudgestSetting);
			console.error('ERROR: '+'外部Gitクライアントが設定されていないか、存在しません。');
			return false;
		}
		px.px2dtLDA.startApp(externalAppName, {PATH: path});
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
			px.utils.exec( 'start cmd /K cd "'+ path + '"' );
		}else{
			var termProgram = 'Terminal';
			try {
				if( process.env.TERM_PROGRAM ){
					termProgram = process.env.TERM_PROGRAM;
				}
			} catch (e) {
			}

			px.utils.spawn(
				px.cmd('open'),
				[
					'-a',
					termProgram,
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
			px.commandQueue.server.setCurrentDir( 'default', process.cwd() ); // current dir を初期化
		}else if( !appName && typeof(_selectedProject) == typeof(0) ){
			appName = 'fncs/home/index.html';
		}

		if( appName ){
			this.loadProject(function(){ // プロジェクトオブジェクトをリロードする。
				var projectStatus = _pj.status();
				// console.log(projectStatus);
				if( !projectStatus.isPxStandby ){
					switch(appName){
						case 'fncs/home/index.html':
						case 'fncs/config/index.html':
						case 'fncs/composer/index.html':
						case 'fncs/git/index.html':
							// プロジェクトの準備が整っていなかったら、
							// これ以外の画面には行けない。
							break;
						default:
							appName = 'fncs/home/index.html';
							break;
					}
				}
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

			this.getProjectList(function(list){
				if( list.length ){
					var $ul = $('<div class="list-group">');
					for( var i = 0; i < list.length; i++ ){
						$ul.append(
							$('<a class="list-group-item">')
								.attr('href', 'javascript:;')
								.data('path', list[i].getPath())
								.data('num', i)
								.on('click', function(){
									var timer = setTimeout(function(){
										px.progress.start({"showProgressBar":true, 'blindness':true});
									}, 1000);
									px.selectProject( $(this).data('num'), function(){
										clearTimeout(timer);
										px.progress.close();
										px.subapp();
									} );
								} )
								.text( list[i].getName() )
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
			});
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
		if(!$shoulderMenu){
			return;
		}

		$('.theme-header__gmenu').html( $('<ul>')
			.append( $('<li>')
				.append( '<span>&nbsp;</span>' )
			)
		);
		$shoulderMenu.find('ul').html('');
		_menu.drawGlobalMenu($shoulderMenu, _current_app);

		if( cpj === null ){
			$('.theme-header__px2logo').css({
				"width": 70,
				"height": 70
			});
			$('.theme-header__id')
				.css({"opacity":0})
			;
		}else{
			$('.theme-header__px2logo').css({
				"width": 45,
				"height": 45
			});
			$('.theme-header__id')
				.html('')
				.append( $('<div>')
					.text( /* '-> ' + */ cpj.get('name') )
				)
				.css({"opacity":1})
			;
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
				'top': $header.outerHeight()+0 ,
				'right': 0 ,
				'height': $(window).height() - $header.outerHeight() - $footer.outerHeight() - 0
			})
		;
		$contents.find('>iframe')
			.css({
				'height': $contents.innerHeight() - 7
			})
		;

		var $ul = $shoulderMenu.find('ul');
		$shoulderMenu.find('button')
			.css({
				'height': $header.outerHeight()
			})
		;
		$ul.css({
			top: $header.height() ,
			height: $(window).height()-$header.outerHeight()
		});
		if( $ul.css('display') == 'block' ){
			$shoulderMenu.css({
				width: '100%' ,
				height: $(window).height()
			});
		}else{
			$shoulderMenu
				.css({
					'height': $header.outerHeight()
				})
			;
		}

	}

	/**
	 * ログをファイルに出力
	 */
	this.log = function( msg ){
		console.info(msg);
		return px.px2dtLDA.log(msg);
	}

	/**
	 * 診断ツール
	 */
	this.healthCheck = function(){
		var Px2DtHealthCheck = require('px2dt-health-check');
		var $body = $('<div>'
			+'<div class="px2-loading"></div>'
			+'</div>');
		var $result = $('<div>'
			+'<p>次のテキストを選択してコピーするか、<a href="javascript:;">ファイルに保存</a>してください。</p>'
			+'<p>お使いのコンピューター内部の情報を含む場合があります。取り扱いにご注意ください。</p>'
			+'<p><textarea class="form-control" readonly="readonly" style="height: 340px;"></textarea></p>'
			+'</div>');
		var $textarea = $result.find('textarea');

		px2style.modal(
			{
				title: '診断ツール',
				body: $body
			},
			function(){
				var px2DtHealthCheck = new Px2DtHealthCheck();
				px2DtHealthCheck.checkDt(
					_path_data_dir,
					_selectedProject,
					function(result){
						console.info('--- px2dt-health-check - result', result);
						var filename = 'pickles2-debug.json';
						var jsonString = JSON.stringify(result, null, "\t");
						$body.html('').append($result);
						$textarea.val(jsonString);
						$result.find('a').on('click', function(e){
	 						// ファイルとして保存する
							var blob = new Blob([ jsonString ], { "type" : "text/json" });
							if (window.navigator.msSaveBlob) {
								window.navigator.msSaveBlob(blob, filename);

								// msSaveOrOpenBlobの場合はファイルを保存せずに開ける
								window.navigator.msSaveOrOpenBlob(blob, filename);
							} else {
								$(this).attr('download', filename);
								this.href = window.URL.createObjectURL(blob);
							}
						});
					}
				);
			}
		);
	}

	/**
	 * アプリケーションを終了する
	 */
	this.exit = function(){
		console.log( 'px.exit() called.' );
		px.save(function(){
			// if(!confirm('exit?')){return;}
			try {
				nw.App.quit();
			} catch (e) {
				console.error('Unknown Error on px.exit()');
			}
		});
	}

	/**
	 * イベントセット
	 */
	this.nwWindow.on( 'close', function(e){
		px.exit();
	});
	process.on( 'exit', function(e){
		px.log( 'Application exit;' );
	});
	process.on( 'uncaughtException', function(e){
		// alert('ERROR: Uncaught Exception');
		console.error('ERROR: Uncaught Exception');
		console.error(e);
		px.log( 'ERROR: Uncaught Exception' );
		px.log( e );
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
	$(window).on('load', function(){
		_it79.fnc({}, [
			function(it, arg){
				// init
				init(function(){
					it.next(arg);
				});
			} ,
			function(it, arg){

				// DOMスキャン
				$header   = $('.theme-header');
				$contents = $('.contents');
				$footer   = $('.theme-footer');
				// $dialog   = $('<div>');
				$shoulderMenu = $('.theme-header__shoulder-menu');

				$header.css({
					'border-bottom-color': _packageJson.pickles2.colors.defaultKeyColor,
					'color': _packageJson.pickles2.colors.defaultKeyColor
				});
				$header.find('.theme-header__px2logo a')
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
					.on('click', function(){
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
		]);

		window.focus();
	});

	return this;
})(jQuery, window);
