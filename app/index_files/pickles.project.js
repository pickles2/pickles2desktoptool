module.exports.classProject = function( window, px, projectInfo, projectId, cbStandby ) {

	this.projectInfo = projectInfo;
	this.projectId = projectId;
	cbStandby = cbStandby||function(){}

	var _config = null;
	var _px2DTConfig = null;

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

	this.status = function(){
		var status = {};
		status.pathExists = px.utils.isDirectory( this.get('path') );
		status.entryScriptExists = (status.pathExists && px.utils.isFile( this.get('path')+'/'+this.get('entry_script') ) ? true : false);
		var homeDir = this.get('path')+'/'+this.get('home_dir');
		status.homeDirExists = (status.pathExists && px.utils.isDirectory( homeDir ) ? true : false);
		status.confFileExists = (status.homeDirExists && (px.utils.isFile( homeDir+'/config.php' )||px.utils.isFile( homeDir+'/config.json' ) ) ? true : false);
		status.px2DTConfFileExists = (status.homeDirExists && px.utils.isFile( homeDir+'/px2dtconfig.json' ) ? true : false);
		status.composerJsonExists = (status.pathExists && px.utils.isFile( this.get('path')+'/composer.json' ) ? true : false);
		status.vendorDirExists = (status.pathExists && px.utils.isDirectory( this.get('path')+'/vendor/' ) ? true : false);
		status.isPxStandby = ( status.pathExists && status.entryScriptExists && status.homeDirExists && status.confFileExists && status.composerJsonExists && status.vendorDirExists ? true : false );
		status.gitDirExists = (function(path){
			function checkGitDir(path){
				if( status.pathExists && px.utils.isDirectory( path+'/.git/' ) ){
					return true;
				}
				var nextPath = px.utils.dirname( path );
				if( nextPath == path ){
					return false;
				}
				return checkGitDir( nextPath );
			}
			return checkGitDir(path);
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
		var data_memo = '';
		this.execPx2( '/?PX=api.get.config', {
			cd: this.get('path') ,
			success: function( data ){
				data_memo += data;
			} ,
			complete: function(code){
				_config = JSON.parse(data_memo);
				cb( _config );
			}
		} );
		return this;
	}
	this.getPx2DTConfig = function(){
		return _px2DTConfig;
	}
	this.updatePx2DTConfig = function( cb ){
		cb = cb||function(){};

		_px2DTConfig = {};
		var path = this.get('path')+'/'+this.get('home_dir')+'/px2dtconfig.json';

		if( !px.utils.isFile( path ) ){
			cb();
			return this;
		}
		px.fs.readFile( path, {}, function(err, data){
			try{
				data = JSON.parse( data );
			}catch(e){}
			_px2DTConfig = data;
			cb();
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
		window.px.utils.spawn('php',
			[
				this.get('path') + '/' + this.get('entry_script'),
				cmd
			] ,
			opts
		);
		return this;
	}
	this.execGit = function( cmd, fnc ){
		return this;
	}
	// this.serverStandby = function(cb){
	// 	px.preview.serverStandby( cb );
	// }
	this.serverStop = function(cb){
		px.server.stop(cb);
	}
	this.open = function(){
		// Finderで開く(Mac)
		window.px.utils.spawn('open',
			[
				this.get('path')
			] ,
			{
				complete: function(){}
			}
		);
	}
	this.findPageContent = function( pagePath ){
		var contLocalpath = pagePath;
		var pageInfo = this.site.getPageInfo(pagePath);

		for( var tmpExt in _config.funcs.processor ){
			if( px.fs.existsSync( this.get('path')+'/'+contLocalpath+'.'+ tmpExt) ){
				contLocalpath = contLocalpath+'.'+ tmpExt;
				break;
			}
		}
		return contLocalpath;
	}

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
	}//get_directory_index()

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
		if( px.utils.isDirectory('./'.$path) ){
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
				$preg_pattern = $preg_pattern.replace( new RegExp( px.utils.escapeRegExp('\\*')), '(?:.*?)');//ワイルドカードをパターンに反映
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
		if( px.fs.existsSync( this.get('path') + contPath ) ){
			opt.error("Content Already Exists.");
			opt.complete();
			return false;
		}
		switch( opt.proc_type ){
			case 'html':
			case 'html_gui':
			case 'md':
				// OK
				break;
			default:
				opt.error('Unknown proc_type "'+opt.proc_type+'".');
				opt.complete();
				return false;
				break;
		}

		var pathInfo = px.utils.parsePath( this.get('path') + contPath );
		var prop = {}
		prop.realpath_cont = pathInfo.path;
		prop.realpath_resource_dir = pathInfo.dirname + '/' + pathInfo.basenameExtless + '_files/';
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
				px.fs.mkdir( px.utils.dirname( prop.realpath_cont ), function(err){
					if( err ){
						opt.error(err);
						opt.complete();
						return;
					}
					it.next(prop);
				} );
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
					px.fs.mkdirSync( prop.realpath_resource_dir );
				}
				if( prop.proc_type == 'html_gui' ){
					px.fs.mkdirSync( prop.realpath_resource_dir + '/guieditor.ignore/' );
					px.fs.writeFile( prop.realpath_resource_dir + '/guieditor.ignore/data.json', '{}', function(err){
						if( err ){
							opt.error(err);
							opt.complete();
							return;
						}
						it.next(prop);
					} );

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

	px.utils.iterateFnc([
		function(itPj, pj){
			// コンフィグをロード
			var status = pj.status();
			if( !status.entryScriptExists ){
				itPj.next(pj);return;
			}
			pj.updateConfig(function(){
				itPj.next(pj);
			});
		} ,
		function(itPj, pj){
			// Px2DTコンフィグをロード
			var status = pj.status();
			if( !status.px2DTConfFileExists ){
				itPj.next(pj);return;
			}
			pj.updatePx2DTConfig(function(){
				itPj.next(pj);
			});
		} ,
		function(itPj, pj){
			var status = pj.status();
			if( !status.entryScriptExists ){
				itPj.next(pj);return;
			}

			/**
			 * px.site
			 */
			pj.site = new (require('./pickles.project.site.js')).site(px, pj, function(){
				itPj.next(pj);
			});

		} ,
		function(itPj, pj){
			cbStandby();
			itPj.next();
		}
	]).start(this);

};