/**
 * px.project.appdata
 */
module.exports = function( px, pj, callbackOnStandby ) {
	global.__defineGetter__('__LINE__', function () { return (new Error()).stack.split('\n')[2].split(':').reverse()[1]; }); var var_dump = function(val){ console.log(val); };

	var _this = this;
	var pathAppDataDir;
	var appData = {};

	function init(){
		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				pathAppDataDir = require('path').resolve(px.px2dtLDA.getAppDataDir('px2dt'))+'/';
				if( !px.utils79.is_dir(pathAppDataDir) ){
					console.error('AppData Directory is NOT exists.', pathAppDataDir);
					callbackOnStandby();
					return;
				}

				if( px.utils79.is_file(pathAppDataDir+'/'+pj.projectInfo.id+'.json') ){
					let json = px.fs.readFileSync(pathAppDataDir+'/'+pj.projectInfo.id+'.json').toString();
					appData = JSON.parse(json);
				}
				rlv();
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				callbackOnStandby();
				rlv();
				return;
			}); })
		;
		return;
	}


	/**
	 * データ全体を取得する
	 */
	this.get = function(){
		return appData;
	}

	/**
	 * 変更を保存する
	 */
	this.save = function(callback){
		var jsonSrc = JSON.stringify( appData, null, "\t" );
		px.fs.writeFileSync(pathAppDataDir+'/'+pj.projectInfo.id+'.json', jsonSrc);
		callback();
	}

	init();
};
