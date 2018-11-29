/**
 * Files and Folders: open.js
 */
module.exports = function(contApp, px, _pj, $){

	/**
	 * ファイルを開く
	 */
	this.open = function(fileinfo, callback){
		// console.log(fileinfo);
		var realpath = require('path').resolve(_pj.get('path'), './'+fileinfo.path);

		switch( fileinfo.ext ){
			case 'html':
			case 'htm':
				px.preview.serverStandby( function(result){
					filePath2pxExternalPath(fileinfo.path, function(path){
						contApp.openEditor( path );
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
	function filePath2pxExternalPath( filepath, callback ){
		var pxExternalPath = filepath;
		var is_file;
		var pageInfoAll;
		var realpath_file = require('path').resolve(_pj.get('path'), './'+filepath);
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
				callback(pxExternalPath);
				it1.next();
			}
		]);
		return;
	}

}
