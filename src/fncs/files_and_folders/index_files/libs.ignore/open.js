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
					contApp.parsePx2FilePath(fileinfo.path, function(pxExternalPath, pathType){
						if(pxExternalPath && pathType == 'contents'){
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

}
