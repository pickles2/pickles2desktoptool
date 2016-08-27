module.exports.classProject = function( window, px, projectInfo, projectId, cbStandby ) {
	var _this = this;
	// global.__defineGetter__('__LINE__', function () { return (new Error()).stack.split('\n')[2].split(':').reverse()[1]; }); var var_dump = function(val){ console.log(val); };

	this.projectInfo = projectInfo;
	this.projectId = projectId;
	cbStandby = cbStandby||function(){}

	var _config = null;
	var _px2DTConfig = null;
	var _px2proj = null;
	var _path = require('path');

	this.validate = function(){
		var isError = false;
		var errorMsg = {};

		if( typeof(this.projectInfo.name) != typeof('') || !this.projectInfo.name.length ){
			errorMsg.name = 'name is required.';
			isError = true;
		}
		if( typeof(this.projectInfo.path) != typeof('') || !this.projectInfo.path.length ){
			errorMsg.path = 'path is required.';
			isError = true;
		}else if( !px.fs.existsSync(this.projectInfo.path) ){
			errorMsg.path = 'path is required as a existed directory path.';
			isError = true;
		}
		if( typeof(this.projectInfo.home_dir) != typeof('') || !this.projectInfo.home_dir.length ){
			errorMsg.home_dir = 'home directory is required.';
			isError = true;
		}
		if( typeof(this.projectInfo.entry_script) != typeof('') || !this.projectInfo.entry_script.length ){
			errorMsg.entry_script = 'entry_script is required.';
			isError = true;
		}

		return {isError: isError, errorMsg: errorMsg};
	}

	/**
	 * プロジェクトのステータスを調べる
	 */
	this.status = function(){
		var status = {};
		status.pathExists = px.utils.isDirectory( this.get('path') );
		status.entryScriptExists = (status.pathExists && px.utils.isFile( this.get('path')+'/'+this.get('entry_script') ) ? true : false);
		var homeDir = this.get('path')+'/'+this.get('home_dir');
		status.homeDirExists = (status.pathExists && px.utils.isDirectory( homeDir ) ? true : false);
		// status.confFileExists = (status.homeDirExists && (px.utils.isFile( homeDir+'/config.php' )||px.utils.isFile( homeDir+'/config.json' ) ) ? true : false);
		status.confFileExists = false;
		if(typeof(_config) === typeof({})){ status.confFileExists = true; }
		// status.px2DTConfFileExists = (status.homeDirExists && px.utils.isFile( homeDir+'/px2dtconfig.json' ) ? true : false);
		status.px2DTConfFileExists = false;
		if(typeof(_px2DTConfig) === typeof({})){ status.px2DTConfFileExists = true; }
		status.composerJsonExists = (status.pathExists && px.utils.isFile( this.get_realpath_composer_root()+'/composer.json' ) ? true : false);
		status.vendorDirExists = (status.pathExists && px.utils.isDirectory( this.get_realpath_composer_root()+'/vendor/' ) ? true : false);
		status.isPxStandby = ( status.pathExists && status.entryScriptExists && status.homeDirExists && status.confFileExists && status.composerJsonExists && status.vendorDirExists ? true : false );
		status.gitDirExists = (function(path){
			function checkParentDir(path){
				if( status.pathExists && px.utils.isDirectory( path+'/.git/' ) ){
					return true;
				}
				var nextPath = px.utils.dirname( path );
				if( nextPath == path ){
					return false;
				}
				return checkParentDir( nextPath );
			}
			return checkParentDir(path);
		})( this.get('path') );
		return status;
	}
	this.get = function(key){
		return this.projectInfo[key];
	}
	this.set = function(key, val){
		this.projectInfo[key] = val;
		return this;
	}
	this.getSitemapFilelist = function(){
		var pathDir = this.get('path')+'/'+this.get('home_dir')+'/sitemaps/';
		var filelist = px.fs.readdirSync( pathDir );
		return filelist;
	}
	this.getConfig = function(){
		return _config;
	}
	this.updateConfig = function( cb ){
		cb = cb||function(){};
		this.execPx2(
			'/?PX=api.get.config',
			{
				complete: function(data_memo){
					_config = false;
					_px2DTConfig = false;
					try{
						_config = JSON.parse(data_memo);
						if( _config.plugins && _config.plugins.px2dt ){
							_px2DTConfig = _config.plugins.px2dt;
						}
					}catch(e){
						console.error('FAILED to load "Pickles 2" config.');
						console.error(data_memo);
						_config = false;
						_px2DTConfig = false;
					}
					cb( _config );
				}
			}
		);
		return this;
	}
	this.getPx2DTConfig = function(){
		return _px2DTConfig;
	}
	this.updatePx2DTConfig = function( cb ){
		cb = cb||function(){};

		var conf = this.getConfig();
		if( conf.plugins && conf.plugins.px2dt ){
			_px2DTConfig = conf.plugins.px2dt;
			cb( _px2DTConfig );
			return this;
		}

		_px2DTConfig = {};
		var path = this.get('path')+'/'+this.get('home_dir')+'/px2dtconfig.json';

		if( !px.utils.isFile( path ) ){
			cb( null );
			return this;
		}
		px.fs.readFile( path, {}, function(err, data){
			try{
				data = JSON.parse( data.toString() );
			}catch(e){
				data = false;
				console.log('ERROR: FAILED to parse px2dtconfig.json');
			}
			_px2DTConfig = data;
			cb( _px2DTConfig );
		} );
		return this;
	}
	this.getSitemap = function(){
		return this.site.getSitemap();
	}
	this.updateSitemap = function( cb ){
		return this.site.updateSitemap( cb );
	}
	this.execPx2 = function( cmd, opts ){
		opts = opts||{};
		opts.complete = opts.complete||function(){};
		_px2proj.query(
			cmd,
			{
				"output": "json",
				"userAgent": "Mozilla/5.0",
				"complete": function(data, code){
					opts.complete(data);
				}
			}
		);
		return this;
	}
	/**
	 * composerを実行する
	 *
	 * node-php-bin の PHP などを考慮して、
	 * -c, -d オプションの解決を自動的にやっている前提で、
	 * composer コマンドを実行します。
	 * 基本的には px.execComposer() をラップするメソッドですが、
	 * cwd オプションを自動的に付与する点が異なります。
	 *
	 * @param  {[type]} cmd  [description]
	 * @param  {[type]} opts [description]
	 * @return {[type]}      [description]
	 */
	this.execComposer = function( cmd, opts ){
		opts = opts||{};
		opts.success = opts.success||function(){};
		opts.error = opts.error||function(){};
		opts.complete = opts.complete||function(){};
		opts.cwd = this.get_realpath_composer_root();
		px.execComposer(
			cmd ,
			opts
		);
		return this;
	}
	/**
	 * プロジェクトのフォルダを開く
	 */
	this.open = function(){
		return window.px.utils.openURL(this.get('path'));
	}

	/**
	 * ページパスからコンテンツを探す
	 */
	this.findPageContent = function( pagePath ){
		var pageInfo = this.site.getPageInfo( pagePath );
		var contLocalpath = pageInfo.content;

		for( var tmpExt in _config.funcs.processor ){
			if( px.fs.existsSync( this.get_realpath_controot()+'/'+contLocalpath+'.'+ tmpExt) ){
				contLocalpath = contLocalpath+'.'+ tmpExt;
				break;
			}
		}
		return contLocalpath;
	}

	/**
	 * コンテンツパスが、2重拡張子か調べる
	 */
	this.isContentDoubleExtension = function( contentPath ){
		var rtn = false;
		for( var tmpExt in _config.funcs.processor ){
			if( contentPath.match( new RegExp( '\\.[a-zA-Z0-9\\_\\-]+?\\.'+px.utils.escapeRegExp(tmpExt)+'$' ) ) ){
				rtn = true;
				break;
			}
		}
		return rtn;
	}

	/**
	 * ページパスからコンテンツの種類(編集モード)を取得する
	 */
	this.getPageContentProcType = function( pagePath ){
		var rtn = '.unknown';
		var pathContRoot = this.get_realpath_controot();
		var pageContent = this.findPageContent( pagePath );
		if( !px.utils.isFile( pathContRoot+pageContent ) ){
			return '.not_exists';
		}
		var filesDir = this.getContentFilesByPageContent( pageContent );
		if( this.isContentDoubleExtension( pageContent ) ){
			rtn = px.utils.getExtension( pageContent );
		}else if( px.utils.isDirectory( pathContRoot+filesDir ) && px.utils.isFile( pathContRoot+filesDir+'/guieditor.ignore/data.json' ) ){
			rtn = 'html.gui';
		}else{
			rtn = px.utils.getExtension( pageContent );
			// if(rtn == 'htm'){rtn = 'html';}
		}
		return rtn;
	}// getPageContentProcType()

	/**
	 * コンテンツパスから専有リソースディレクトリパスを探す
	 */
	this.getContentFilesByPageContent = function( contentPath ){
		var conf = this.getConfig();
		var rtn = conf.path_files;
		if( typeof(rtn) !== typeof('') ){
			rtn = '{$dirname}/{$filename}_files/'; // <- default
		}
		var $data = {
			'dirname': px.utils.dirname(contentPath),
			'filename': px.utils.basename(px.utils.trim_extension(px.utils.trim_extension(contentPath))),
			'ext': px.utils.getExtension(contentPath).toLowerCase(),
		};
		rtn = rtn.replace( '{$dirname}', $data['dirname'], rtn );
		rtn = rtn.replace( '{$filename}', $data['filename'], rtn );
		rtn = rtn.replace( '{$ext}', $data['ext'], rtn );
		rtn = rtn.replace( /^\/*/, '/', rtn );
		rtn = rtn.replace( /\/*$/, '', rtn )+'/';
		return rtn;

		// var rtn = contentPath;
		// rtn = px.utils.trim_extension( rtn );
		// if( this.isContentDoubleExtension(contentPath) ){
		// 	rtn = px.utils.trim_extension( rtn );
		// }
		// rtn += '_files/';
		// return rtn;
	}

	/**
	 * コンテンツの種類(編集モード)を変更する
	 */
	this.changeContentProcType = function( pagePath, procTypeTo, cb ){
		cb = cb || function(){};

		var pageInfo = this.site.getPageInfo( pagePath );
		var pageInfoLocalpath = pageInfo.content;
		var pathContent = this.findPageContent( pagePath );
		var procTypeBefore = this.getPageContentProcType( pagePath );
		var resourcPath = this.getContentFilesByPageContent( pathContent );
		var contRoot = this.get_realpath_controot();
		var codeBefore = px.fs.readFileSync( contRoot+pathContent ).toString();

		if( procTypeBefore == procTypeTo ){ cb(); return; }

		function mkGuiData( contRoot, resourcPath, codeBefore, procTypeBefore ){
			if( !px.utils.isDirectory( contRoot + resourcPath ) ){
				px.fs.mkdirSync( contRoot + resourcPath );
			}
			if( !px.utils.isDirectory( contRoot + resourcPath+'guieditor.ignore/' ) ){
				px.fs.mkdirSync( contRoot + resourcPath+'guieditor.ignore/' );
			}
			px.fs.writeFileSync( contRoot + resourcPath+'guieditor.ignore/data.json', JSON.stringify( {
				"bowl": {
					"main": {
						"modId": "_sys/root" ,
						"fields": {
							"main": [
								{
									"modId": "_sys/html" ,
									"fields": {
										"main": codeBefore
									}
								}
							]
						}
					}
				}
			}, null, 1 ) );
		}

		if( procTypeBefore == 'html.gui' ){
			if( (procTypeTo == 'html'||procTypeTo == 'htm') && pageInfo.content.match( new RegExp('\\.'+procTypeTo+'$', 'i') ) ){
				px.fs.renameSync( contRoot + pathContent, contRoot + pageInfo.content );
			}else{
				px.fs.renameSync( contRoot + pathContent, contRoot + pageInfo.content + '.' + procTypeTo );
			}
			try {
				px.utils.rmdir_r( contRoot + resourcPath+'guieditor.ignore/' );
			}catch(e){
			}

		}else if( procTypeBefore == 'html'||procTypeBefore == 'htm' ){
			if( procTypeTo == 'html.gui' ){
				px.fs.renameSync( contRoot + pathContent, contRoot + pageInfo.content );
				mkGuiData( contRoot, resourcPath, codeBefore, procTypeBefore );
			}else{
				px.fs.renameSync( contRoot + pathContent, contRoot + pageInfo.content + '.' + procTypeTo );
			}

		}else{
			if( procTypeTo == 'html.gui' || procTypeTo == 'html' || procTypeTo == 'htm' ){
				if( pageInfo.content.match( new RegExp('\\.html?$', 'i') ) ){
					px.fs.renameSync( contRoot + pathContent, contRoot + pageInfo.content );
				}else{
					px.fs.renameSync( contRoot + pathContent, contRoot + pageInfo.content + '.'+(procTypeTo=='html.gui' ? 'html.gui' : procTypeTo) );
				}
				if( procTypeTo == 'html.gui' ){
					mkGuiData( contRoot, resourcPath, codeBefore, procTypeBefore );
				}else{
					try {
						px.utils.rmdir_r( contRoot + resourcPath+'guieditor.ignore/' );
					}catch(e){
					}
				}
			}else{
				px.fs.renameSync( contRoot + pathContent, contRoot + pageInfo.content + '.' + procTypeTo );
				try {
					px.utils.rmdir_r( contRoot + resourcPath+'guieditor.ignore/' );
				}catch(e){
				}
			}

		}

		cb();
		return true;
	}

	/**
	 * GUI編集エンジンの種類を取得する
	 *
	 * 旧GUI編集(legacy)から、新GUI編集エンジン(broccoli-html-editor)に移行する
	 * 過渡期に使用する一時的な機能として実装します。
	 * Pickles2 の config.php に、plugins.px2dt.guiEngine を設定すると、
	 * GUI編集エンジンを切り替えることができます。
	 *
	 * 設定できる値は、以下。
	 * - legacy = 旧GUI編集
	 * - broccoli-html-editor = 新エンジン broccoli (default)
	 */
	this.getGuiEngineName = function(){
		var conf = this.getConfig();
		// console.log(conf);
		// console.log(conf.plugins.px2dt);
		// console.log(conf.plugins.px2dt.guiEngine);
		if( conf && conf.plugins && conf.plugins.px2dt && conf.plugins.px2dt.guiEngine ){
			switch(conf.plugins.px2dt.guiEngine){
				case 'legacy':
					return conf.plugins.px2dt.guiEngine;
					break;
				default:
					break;
			}
		}
		return 'broccoli-html-editor';
	}

	/**
	 * GUI編集のコンテンツをビルドする
	 */
	this.buildGuiEditContent = function( pagePath, callback ){
		callback = callback||function(){};
		if( this.getPageContentProcType(pagePath) != 'html.gui' ){
			callback(false);
			return this;
		}

		if(this.getGuiEngineName() == 'broccoli-html-editor'){
			// broccoli-html-editor
			this.createBroccoliServer(pagePath, function(broccoli){
				broccoli.buildHtml(
					{'mode':'finalize'},
					function(htmls){
						broccoli.options.bindTemplate(htmls, function(fin){
							px.fs.writeFile(
								broccoli.realpathHtml ,
								fin ,
								function(){
									callback(true);
								}
							);
						});
					}
				);
			});
		}else{
			// 旧GUI編集
			window.px2dtGuiEditor.build(pagePath, function(result){
				callback(result);
			});
		}

		return this;
	}// buildGuiEditContent()

	/**
	 * broccoli(サーバーサイド)を生成する
	 */
	this.createBroccoliServer = function(page_path, callback){
		callback = callback || function(){};
		var Broccoli = require('broccoli-html-editor');
		var path = require('path');
		var _pj = this;

		var documentRoot = path.resolve(this.get('path'), this.get('entry_script'), '..')+'/'
		var realpathDataDir,
			pathResourceDir;

		_pj.px2proj.realpath_files(page_path, '', function(realpath){
			realpathDataDir = path.resolve(realpath, 'guieditor.ignore')+'/';

			_pj.px2proj.path_files(page_path, '', function(localpath){
				pathResourceDir = path.resolve(localpath, 'resources')+'/';
				pathResourceDir = pathResourceDir.replace(new RegExp('\\\\','g'), '/').replace(new RegExp('^[a-zA-Z]\\:\\/'), '/');
					// Windows でボリュームラベル "C:" などが含まれるようなパスを渡すと、
					// broccoli-html-editor内 resourceMgr で
					// 「Uncaught RangeError: Maximum call stack size exceeded」が起きて落ちる。
					// ここで渡すのはウェブ側からみえる外部のパスでありサーバー内部パスではないので、
					// ボリュームラベルが付加された値を渡すのは間違い。


				// broccoli setup.
				var broccoli = new Broccoli();

				// console.log(broccoli);
				broccoli.init(
					{
						'appMode': 'desktop', // 'web' or 'desktop'. default to 'web'
						'paths_module_template': _pj.getConfig().plugins.px2dt.paths_module_template ,
						'documentRoot': documentRoot,
						'pathHtml': page_path,
						'pathResourceDir': pathResourceDir,
						'realpathDataDir': realpathDataDir,
						'customFields': {
							'href': require('./../common/broccoli/broccoli-field-href/server.js'),
							// 'psd': require('broccoli-field-psd'),
							'table': require('broccoli-field-table').get({
								'php': px.nodePhpBinOptions
							})
						} ,
						'bindTemplate': function(htmls, callback){
							var fin = '';
							for( var bowlId in htmls ){
								if( bowlId == 'main' ){
									fin += htmls['main'];
								}else{
									fin += "\n";
									fin += "\n";
									fin += '<?php ob_start(); ?>'+"\n";
									fin += htmls[bowlId]+"\n";
									fin += '<?php $px->bowl()->send( ob_get_clean(), '+JSON.stringify(bowlId)+' ); ?>'+"\n";
									fin += "\n";
								}
							}
							callback(fin);
							return;
						} ,
						'log': function(msg){
							px.log(msg);
						}

					},
					function(){
						callback(broccoli);
					}
				);

			});

		});

		return this;
	}

	/**
	 * pickles2-contents-editor(サーバーサイド)を生成する
	 */
	this.createPickles2ContentsEditorServer = function(page_path, callback){
		callback = callback || function(){};
		var Px2CE = require('pickles2-contents-editor');
		var _pj = this;

		// pickles2-contents-editor setup.
		var px2ce = new Px2CE();

		// console.log(broccoli);
		// console.log(require('path').resolve('/', './'+page_path));
		px2ce.init(
			{
				'page_path': page_path,
				'appMode': 'desktop', // 'web' or 'desktop'. default to 'web'
				'entryScript': require('path').resolve( _pj.get('path'), _pj.get('entry_script') ),
				'customFields': {
					'href': require('./../common/broccoli/broccoli-field-href/server.js'),
					// 'psd': require('broccoli-field-psd'),
					'table': require('broccoli-field-table').get({
						'php': px.nodePhpBinOptions
					})
				} ,
				'log': function(msg){
					px.log(msg);
				}
			},
			function(){
				callback(px2ce);
			}
		);

		return this;
	}

	/**
	 * コンテンツをコピーする
	 */
	this.copyContentsData = function( pathFrom, pathTo, cb ){
		cb = cb || function(){};
		var _this = this;

		var contRoot = this.get_realpath_controot();

		var from = [];
		from.pathContent = this.findPageContent( pathFrom );
		from.pathFiles = this.getContentFilesByPageContent(from.pathContent);
		from.procType = this.getPageContentProcType( pathFrom );

		var to = [];
		to.pathContent = this.findPageContent( pathTo );
		to.pathFiles = this.getContentFilesByPageContent(to.pathContent);
		to.procType = this.getPageContentProcType( pathTo );


		px.utils.iterateFnc([
			function(it, prop){
				// 一旦削除する
				if( px.utils.isFile( contRoot+'/'+to.pathContent ) ){
					px.utils.rm( contRoot+'/'+to.pathContent );
				}
				if( px.utils.isDirectory( contRoot+'/'+to.pathFiles ) ){
					px.utils.rmdir_r( contRoot+'/'+to.pathFiles );
				}
				it.next(prop);
			} ,
			function(it, prop){
				// 格納ディレクトリを作る
				if( px.utils.isDirectory( contRoot+'/'+to.pathFiles ) ){
					it.next(prop);
					return;
				}
				// 再帰的に作る mkdirAll()
				if( !px.utils.mkdirAll( contRoot+'/'+to.pathFiles ) ){
					it.next(prop);
					return;
				}
				it.next(prop);
			} ,
			function(it, prop){
				// 複製する
				if( px.utils.isFile( contRoot+'/'+from.pathContent ) ){
					px.utils.copy( contRoot+'/'+from.pathContent, contRoot+'/'+to.pathContent );
				}
				if( px.utils.isDirectory( contRoot+'/'+from.pathFiles ) ){
					px.utils.copy_r( contRoot+'/'+from.pathFiles, contRoot+'/'+to.pathFiles );
				}
				it.next(prop);
			} ,
			function(it, prop){

				// コンテンツのprocTypeが異なる場合
				if( from.procType !== to.procType ){
					// 拡張子を合わせる作業
					var toPageInfo = _this.site.getPageInfo( pathTo );

					switch( from.procType ){
						case 'html':
						case 'html.gui':
							var toPathContent = toPageInfo.content;
							if( !toPageInfo.content.match( new RegExp('\\.html$', 'i') ) ){
								toPathContent = toPageInfo.content + '.html';
							}
							px.fs.renameSync(
								contRoot+'/'+to.pathContent,
								contRoot+'/'+toPathContent
							);
							break;
						default:
							px.fs.renameSync(
								contRoot+'/'+to.pathContent,
								contRoot+'/'+toPageInfo.content + '.' + from.procType
							);
							break;
					}

				}

				it.next(prop);
			} ,
			function(it, prop){
				cb();
				return;
				it.next(prop);
			}
		]).start({});

		return true;
	}

	/**
	 * gitディレクトリの絶対パスを得る
	 *
	 * @return string gitディレクトリのパス(.git の親ディレクトリ)
	 */
	this.get_realpath_git_root = function(){
		return (function(path){
			function checkParentDir(path){
				if( px.utils.isDirectory( path ) && px.utils.isDirectory( path+'/.git/' ) ){
					return px.fs.realpathSync(path)+'/';
				}
				var nextPath = px.utils.dirname( path );
				if( nextPath == path ){
					return false;
				}
				return checkParentDir( nextPath );
			}
			return checkParentDir(path);
		})( this.get_realpath_controot() );
	}// get_realpath_git_root()

	/**
	 * composerのルートの絶対パスを得る
	 *
	 * @return string composer のルートディレクトリのパス(composer.json の親ディレクトリ)
	 */
	this.get_realpath_composer_root = function(){
		return (function(path){
			function checkParentDir(path){
				if( px.utils.isDirectory( path ) && px.utils.isFile( path+'/composer.json' ) ){
					return px.fs.realpathSync(path)+'/';
				}
				var nextPath = px.utils.dirname( path );
				if( nextPath == path ){
					return false;
				}
				return checkParentDir( nextPath );
			}
			return checkParentDir(path);
		})( this.get_realpath_controot() );
	}// get_realpath_composer_root()


	/**
	 * npmのルートの絶対パスを得る
	 *
	 * @return string npm のルートディレクトリのパス(package.json の親ディレクトリ)
	 */
	this.get_realpath_npm_root = function(){
		return (function(path){
			function checkParentDir(path){
				if( px.utils.isDirectory( path ) && px.utils.isFile( path+'/package.json' ) ){
					return px.fs.realpathSync(path)+'/';
				}
				var nextPath = px.utils.dirname( path );
				if( nextPath == path ){
					return false;
				}
				return checkParentDir( nextPath );
			}
			return checkParentDir(path);
		})( this.get_realpath_controot() );
	}// get_realpath_npm_root()


	/**
	 * コンテンツルートの絶対パスを得る
	 *
	 * @return string コンテンツルートディレクトリの絶対パス(.px_execute.php の親ディレクトリ)
	 */
	this.get_realpath_controot = function(){
		var pathBase = this.get('path');
		if( px.utils.isFile( this.get('path')+'/'+this.get('entry_script') ) ){
			pathBase = px.utils.dirname( px.fs.realpathSync( this.get('path')+'/'+this.get('entry_script') ) )+'/';
		}
		return pathBase;
	}// get_realpath_controot()



	/**
	 * directory_index(省略できるファイル名) の一覧を得る。
	 *
	 * @return array ディレクトリインデックスの一覧
	 */
	this.get_directory_index = function(){
		var $tmp_di = _config.directory_index;
		var directory_index = [];
		for( var idx in $tmp_di ){
			var $file_name = $tmp_di[idx];
			$file_name = px.php.trim( $file_name );
			if( !$file_name.length ){ continue; }
			directory_index.push( $file_name );
		}
		if( !directory_index.length ){
			directory_index.push( 'index.html' );
		}
		return directory_index;
	}// get_directory_index()

	/**
	 * directory_index のいずれかにマッチするためのpregパターン式を得る。
	 *
	 * @return string pregパターン
	 */
	this.get_directory_index_preg_pattern = function(){
		var $directory_index = this.get_directory_index();
		for( var $key in $directory_index ){
			var $row = $directory_index[$key];
			$directory_index[$key] = px.utils.escapeRegExp($row);
		}
		var $rtn = '(?:'+$directory_index.join( '|' )+')';
		return $rtn;
	}//get_directory_index_preg_pattern()


	/**
	 * 最も優先されるインデックスファイル名を得る。
	 *
	 * @return string 最も優先されるインデックスファイル名
	 */
	this.get_directory_index_primary = function(){
		var $directory_index = this.get_directory_index();
		return $directory_index[0];
	}//get_directory_index_primary()


	/**
	 * ファイルの処理方法を調べる。
	 *
	 * @param string $path パス
	 * @return string 処理方法
	 * - ignore = 対象外パス
	 * - direct = 加工せずそのまま出力する(デフォルト)
	 * - その他 = process名を格納して返す
	 */
	this.get_path_proc_type = function( $path ){
		var $rtn = [];
		if( $path === null || $path === undefined ){
			$path = '/';
		}
		$path = px.utils.get_realpath( '/'+$path );
		if( px.utils.isDirectory('./'+$path) ){
			$path += '/';
		}
		$path = px.utils.normalize_path( $path );

		if( typeof($rtn[$path]) === typeof(true) ){
			return $rtn[$path];
		}

		for( var $row in _config.paths_proc_type ){
			var $type = _config.paths_proc_type[$row];
			if(typeof($row) !== typeof('')){continue;}
			var $preg_pattern = px.utils.escapeRegExp( px.utils.normalize_path( px.utils.get_realpath($row) ) );
			if( $preg_pattern.match( new RegExp('\\*') ) ){
				// ワイルドカードが使用されている場合
				$preg_pattern = px.utils.escapeRegExp($row);
				$preg_pattern = $preg_pattern.replace( new RegExp( px.utils.escapeRegExp('\\*'),'g'), '(?:.*?)');//ワイルドカードをパターンに反映
				$preg_pattern = $preg_pattern+'$';//前方・後方一致
			}else if(px.utils.isDirectory($row)){
				$preg_pattern = px.utils.escapeRegExp( px.utils.normalize_path( px.utils.get_realpath($row) )+'/');
			}else if(px.utils.isFile($row)){
				$preg_pattern = px.utils.escapeRegExp( px.utils.normalize_path( px.utils.get_realpath($row) ));
			}
			if( $path.match( new RegExp('^'+$preg_pattern) ) ){
				$rtn[$path] = $type;
				return $rtn[$path];
			}
		}
		$rtn[$path] = 'direct';// <- default
		return $rtn[$path];
	}//get_path_proc_type();


	/**
	 * コンテンツルートディレクトリのパス(=install path) を取得する
	 * @return string コンテンツディレクトリのパス
	 */
	this.get_path_controot = function(){
		var $rtn = '/';

		if( px.utils.strlen( _config.path_controot ) ){
			$rtn = _config.path_controot;
			$rtn = $rtn.replace(new RegExp('^(.*?)\\/*$'), '$1/');
			$rtn = px.utils.normalize_path($rtn);
			return $rtn;
		}

		$rtn = px.utils.normalize_path($rtn);
		return $rtn;
	}


	/**
	 * コンテンツファイルの初期化(=なかったものを新規作成)
	 */
	this.initContentFiles = function( pagePath, opt ){
		opt = opt||{};
		opt.success = opt.success||function(){};
		opt.error = opt.error||function(){};
		opt.complete = opt.complete||function(){};
		opt.proc_type = opt.proc_type||'html';

		var pageInfo = this.site.getPageInfo(pagePath);
		if( pageInfo == null ){
			opt.error("Page not Exists.");
			opt.complete();
			return false;
		}
		var contPath = this.findPageContent(pagePath);
		if( px.fs.existsSync( this.get_realpath_controot() + contPath ) ){
			opt.error("Content Already Exists.");
			opt.complete();
			return false;
		}
		switch( opt.proc_type ){
			case 'html.gui':
			case 'html':
			case 'md':
				// OK
				break;
			default:
				opt.error('Unknown proc_type "'+opt.proc_type+'".');
				opt.complete();
				return false;
				break;
		}

		var pathInfo = px.utils.parsePath( this.get_realpath_controot() + contPath );
		var prop = {}
		prop.realpath_cont = pathInfo.path;
		prop.realpath_resource_dir = this.get_realpath_controot() + this.getContentFilesByPageContent(contPath);
		prop.proc_type = opt.proc_type;
		if( prop.proc_type == 'md' ){
			prop.realpath_cont += '.'+prop.proc_type;
		}

		px.utils.iterateFnc([
			function(it, prop){
				// 格納ディレクトリを作る
				if( px.utils.isDirectory( px.utils.dirname( prop.realpath_cont ) ) ){
					it.next(prop);
					return;
				}
				// 再帰的に作る mkdirAll()
				if( !px.utils.mkdirAll( px.utils.dirname( prop.realpath_cont ) ) ){
					opt.error(err);
					opt.complete();
					return;
				}
				it.next(prop);
			} ,
			function(it, prop){
				// コンテンツ自体を作る
				px.fs.writeFile( prop.realpath_cont, '', function(err){
					if( err ){
						opt.error(err);
						opt.complete();
						return;
					}
					it.next(prop);
				} );
			} ,
			function(it, prop){
				// リソースディレクトリを作る
				if( !px.utils.isDirectory( prop.realpath_resource_dir ) ){
					px.utils.mkdirAll( prop.realpath_resource_dir );
				}
				if( prop.proc_type == 'html.gui' ){
					try {
						px.fs.mkdirSync( prop.realpath_resource_dir + '/guieditor.ignore/' );
					} catch (e) {
						it.next(prop);
					} finally {
						px.fs.writeFile( prop.realpath_resource_dir + '/guieditor.ignore/data.json', '{}', function(err){
							if( err ){
								opt.error(err);
								opt.complete();
								return;
							}
							it.next(prop);
						} );
					}

				}else{
					it.next(prop);
				}
			} ,
			function(it, prop){
				opt.success();
				opt.complete();
				return;
				it.next(prop);
			}
		]).start(prop);

		return true;
	}

	/**
	 * 検索オブジェクトを生成・取得する
	 */
	this.createSearcher = function(){
		return new (require('./pickles.project.searcher.js'))(px, this);
	}

	/**
	 * 検索オブジェクトを生成・取得する
	 */
	this.git = function(){
		return new (require('./pickles.project.git.js'))(px, this);
	}

	/**
	 * projectオブジェクトを初期化
	 */
	px.utils.iterateFnc([
		function(itPj, pj){
			var px2agentOption = {
				'bin': px.nodePhpBin.getPath(),
				'ini': px.nodePhpBin.getIniPath(),
				'extension_dir': px.nodePhpBin.getExtensionDir()
			};
			console.log(px2agentOption);
			_px2proj = px.px2agent.createProject(
				_path.resolve( pj.get('path') + '/' + pj.get('entry_script') ) ,
				px2agentOption
			);
			pj.px2proj = _px2proj;

			itPj.next(pj);
		},
		function(itPj, pj){
			// コンフィグをロード
			// var status = pj.status();
			// if( !status.entryScriptExists ){
			// 	itPj.next(pj);return;
			// }
			pj.updateConfig(function(){
				itPj.next(pj);
			});
		} ,
		function(itPj, pj){
			// Px2DTコンフィグをロード
			// var status = pj.status();
			// if( !status.px2DTConfFileExists ){
			// 	itPj.next(pj);return;
			// }
			pj.updatePx2DTConfig(function(){
				itPj.next(pj);
			});
		} ,
		function(itPj, pj){
			var status = pj.status();
			if( !status.entryScriptExists ){
				itPj.next(pj);return;
			}
			if( _config === false ){
				itPj.next(pj);return;
			}

			/**
			 * px.site
			 */
			pj.site = new (require('./pickles.project.site.js'))(px, pj, function(){
				itPj.next(pj);
			});

		} ,
		function(itPj, pj){
			cbStandby();
			itPj.next();
		}
	]).start(this);

};
