/**
 * Files and Folders: open.js
 */
module.exports = function(contApp, px, _pj, $){

	/**
	 * ファイルを開く
	 */
	this.open = function(fileinfo, callback){
		// console.log(fileinfo);
		var realpath = _pj.get('path')+'/'+fileinfo.path;

		switch( fileinfo.ext ){
			case 'html':
			case 'htm':
				px.preview.serverStandby( function(result){
					parsePx2FilePath(fileinfo.path, function(pxExternalPath, path_type){
						if(path_type == 'contents'){
							contApp.openEditor( pxExternalPath );
						}else{
							px.openInTextEditor( realpath );
						}
					});
				} );
				break;
			case 'xlsx':
			case 'csv':
				px.utils.openURL( realpath );
				break;
			case 'php':
			case 'inc':
			case 'txt':
			case 'md':
			case 'css':
			case 'scss':
			case 'js':
			case 'json':
			case 'lock':
			case 'gitignore':
			case 'gitkeep':
			case 'htaccess':
			case 'htpasswd':
				px.openInTextEditor( realpath );
				break;
			default:
				px.utils.openURL( realpath );
				break;
		}
		callback(true);
	}


	/**
	 * ファイルのパスを、Pickles 2 の外部パス(path)に変換する。
	 *
	 * Pickles 2 のパスは、 document_root と cont_root を含まないが、
	 * ファイルのパスはこれを一部含んでいる可能性がある。
	 * これを確認し、必要に応じて除いたパスを返却する。
	 */
	function parsePx2FilePath( filepath, callback ){
		var pxExternalPath = filepath;
		var is_file;
		var pageInfoAll;
		var path_type;
		var realpath_file = _pj.get('path')+'/'+filepath;
		px.it79.fnc({}, [
			function(it1){
				is_file = px.utils79.is_file( realpath_file );
				it1.next();
			},
			function(it1){
				if(!is_file){
					it1.next();
					return;
				}
				_pj.execPx2(
					'/?PX=px2dthelper.get.all',
					{
						complete: function(resources){
							try{
								resources = JSON.parse(resources);
							}catch(e){
								console.error('Failed to parse JSON "client_resources".', e);
							}
							// console.log(resources);
							pageInfoAll = resources;
							it1.next();
						}
					}
				);

			},
			function(it1){
				// 外部パスを求める
				if( realpath_file.indexOf(pageInfoAll.realpath_docroot) === 0 ){
					pxExternalPath = realpath_file.replace(pageInfoAll.realpath_docroot, '/');
				}
				if( pxExternalPath.indexOf(pageInfoAll.path_controot) === 0 ){
					pxExternalPath = pxExternalPath.replace(pageInfoAll.path_controot, '/');
				}
				pxExternalPath = require('path').resolve('/', pxExternalPath);
				it1.next();
			},
			function(it1){
				// パスの種類を求める
				// theme_collection, home_dir, or contents
				function normalizePath(path){
					path = path.replace(/^[a-zA-Z]\:/, '');
					path = require('path').resolve(path);
					path = path.split(/[\/\\\\]+/).join('/');
					return path;
				}
				path_type = 'contents';
				var realpath_target = normalizePath(realpath_file);
				var realpath_homedir = normalizePath(pageInfoAll.realpath_homedir);
				var realpath_theme_collection_dir = normalizePath(pageInfoAll.realpath_theme_collection_dir);
				if( realpath_target.indexOf(realpath_theme_collection_dir) === 0 ){
					path_type = 'theme_collection';
				}else if( realpath_target.indexOf(realpath_homedir) === 0 ){
					path_type = 'home_dir';
				}
				it1.next();
			},
			function(it1){
				callback(pxExternalPath, path_type);
				it1.next();
			}
		]);
		return;
	}

}
