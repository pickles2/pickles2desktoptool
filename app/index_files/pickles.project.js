(function(px, $, window){

	px.classProject = function(projectInfo, projectId, cbStandby){
		this.projectInfo = projectInfo;
		this.projectId = projectId;
		cbStandby = cbStandby||function(){}

		var _config = null;

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
			if( typeof(this.projectInfo.vcs) != typeof('') || !this.projectInfo.vcs.length ){
				errorMsg.vcs = 'vcs is required.';
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
			status.confFileExists = (status.homeDirExists && (px.utils.isFile( homeDir+'/config.php'||px.utils.isFile( homeDir+'/config.json') ) ) ? true : false);
			status.composerJsonExists = (status.pathExists && px.utils.isFile( this.get('path')+'/composer.json' ) ? true : false);
			status.vendorDirExists = (status.pathExists && px.utils.isDirectory( this.get('path')+'/vendor/' ) ? true : false);
			status.isPxStandby = ( status.pathExists && status.entryScriptExists && status.homeDirExists && status.confFileExists && status.composerJsonExists && status.vendorDirExists ? true : false );
			status.gitDirExists = (status.pathExists && px.utils.isDirectory( this.get('path')+'/.git/' ) ? true : false);
			return status;
		}
		this.get = function(key){
			return this.projectInfo[key];
		}
		this.getSitemapFilelist = function(){
			var pathDir = this.get('path')+'/'+this.get('home_dir')+'/sitemaps/';
			var filelist = px.fs.readdirSync( pathDir );
			return filelist;
		}
		this.getConfig = function( cb ){
			return _config;
		}
		this.getSitemap = function(cb){
			return this.site.getSitemap();
			// var data_memo = '';
			// return this.execPx2( '/?PX=api.get.sitemap', {
			// 	cd: this.get('path') ,
			// 	success: function( data ){
			// 		data_memo += data;
			// 	} ,
			// 	complete: function(code){
			// 		cb( data_memo );
			// 	}
			// } );
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
		this.serverStandby = function(cb){
			px.server.start(8080, cb);
		}
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


		px.utils.iterateFnc([
			function(itPj, pj){
				var status = pj.status();
				if( !status.entryScriptExists ){
					itPj.next(pj);return;
				}

				var data_memo = '';
				pj.execPx2( '/?PX=api.get.config', {
					cd: pj.get('path') ,
					success: function( data ){
						data_memo += data;
					} ,
					complete: function(code){
						_config = JSON.parse(data_memo);
						itPj.next(pj);
					}
				} );

			} ,
			function(itPj, pj){
				var status = pj.status();
				if( !status.entryScriptExists ){
					itPj.next(pj);return;
				}

				/**
				 * px.site
				 */
				pj.site = new (function(pj){
					var _this = this;
					var _sitemap = null;
					var _sitemap_id_map = null;
					this.getPageInfo = function( pagePath ){
						if( _sitemap && _sitemap[pagePath] ){
							return _sitemap[pagePath];
						}
						if( _sitemap_id_map && _sitemap_id_map[pagePath] ){
							return _sitemap_id_map[pagePath];
						}
						return null;
					}
					this.getSitemap = function(){
						return _sitemap;
					}

					px.utils.iterateFnc([
						function(it, arg){
							var sitemap_data_memo = '';
							pj.execPx2( '/?PX=api.get.sitemap', {
								cd: pj.get('path') ,
								success: function( data ){
									sitemap_data_memo += data;
								} ,
								complete: function(code){
									_sitemap = JSON.parse(sitemap_data_memo);
									it.next(arg);
								}
							} );
						} ,
						function(it, arg){
							_sitemap_id_map = {};
							for( var i in _sitemap ){
								_sitemap_id_map[_sitemap[i].id] = _sitemap[i];
							}
							itPj.next(pj);
						}
					]).start({});

					return this;
				})(pj);
			} ,
			function(itPj, pj){
				cbStandby();
				itPj.next();
			}
		]).start(this);


	}

})(px, jQuery, window);