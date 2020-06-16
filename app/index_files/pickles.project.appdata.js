/**
 * main.project.appdata
 */
module.exports = function( main, pj, callbackOnStandby ) {
	// global.__defineGetter__('__LINE__', function () { return (new Error()).stack.split('\n')[2].split(':').reverse()[1]; }); var var_dump = function(val){ console.log(val); };

	var _this = this;
	var pathAppDataDir;
	var appData = {};
	callbackOnStandby = callbackOnStandby || function(){};

	function init(){
		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				pathAppDataDir = require('path').resolve(main.px2dtLDA.getAppDataDir('px2dt'))+'/';
				if( !main.utils79.is_dir(pathAppDataDir) ){
					console.error('AppData Directory is NOT exists.', pathAppDataDir);
					callbackOnStandby();
					return;
				}

				if( main.utils79.is_file(pathAppDataDir+'/'+pj.projectInfo.id+'.json') ){
					let json = main.fs.readFileSync(pathAppDataDir+'/'+pj.projectInfo.id+'.json').toString();
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
	this.load = function(){
		return appData;
	}

	/**
	 * 変更を保存する
	 */
	this.save = function(callback){
		callback = callback || function(){};
		var jsonSrc = JSON.stringify( appData, null, "\t" );
		main.fs.writeFileSync(pathAppDataDir+'/'+pj.projectInfo.id+'.json', jsonSrc);
		callback();
	}


	/**
	 * カスタムデータファイルを読み取る
	 */
	this.readCustomDataFile = function( key, callback ){
		callback = callback || function(){};
		if( !main.utils79.is_dir(pathAppDataDir) ){
			callback(false);
		}
		var rtn = false;
		try{
			if( main.utils79.is_file(pathAppDataDir + 'pj/'+pj.projectInfo.id+'/'+key+'.txt') ){
				rtn = main.fs.readFileSync( pathAppDataDir + 'pj/'+pj.projectInfo.id+'/'+key+'.txt' ).toString();
			}
		}catch(e){
			console.error(e);
		}
		callback(rtn);
		return;
	}

	/**
	 * カスタムデータファイルを保存する
	 */
	this.writeCustomDataFile = function( key, val, callback ){
		callback = callback || function(){};
		if( !main.utils79.is_dir(pathAppDataDir) ){
			callback(false);
		}
		try{
			if( !main.utils79.is_dir(pathAppDataDir + 'pj/') ){
				main.fs.mkdirSync(pathAppDataDir + 'pj/');
			}
			if( !main.utils79.is_dir(pathAppDataDir + 'pj/'+pj.projectInfo.id+'/') ){
				main.fs.mkdirSync(pathAppDataDir + 'pj/'+pj.projectInfo.id+'/');
			}
			main.fs.writeFileSync(
				pathAppDataDir + 'pj/'+pj.projectInfo.id+'/'+key+'.txt',
				val
			);
		}catch(e){
			console.error(e);
		}
		callback(true);
		return;
	}


	init();
};
