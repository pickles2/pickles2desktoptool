var fs = require('fs');
var _utils = require('./app/index_files/_utils.node.js');
var NwBuilder = require('nw-builder');
var zipFolder = require('zip-folder');
var packageJson = require('./package.json');
var phpjs = require('phpjs');
var date = new Date();
var appName = packageJson.name;

console.log('== build "'+appName+'" ==');

console.log('Cleanup...');
(function(base){
	var ls = _utils.ls(base);
	for(var idx in ls){
		if( ls[idx] == '.gitkeep' ){continue;}
		if( _utils.isDirectory(base+'/'+ls[idx]) ){
			_utils.rmdir_r(base+'/'+ls[idx]);
		}else if( _utils.isFile(base+'/'+ls[idx]) ){
			_utils.rm(base+'/'+ls[idx]);
		}
	}
})( __dirname+'/build/' );
console.log('');

function getTimeString(){
	var date = new Date();
	return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
}
function writeLog(row){
	fs.appendFile( __dirname+'/build/buildlog.txt', row+"\n" ,'utf8', function(err){
		if(err){
			console.error(err);
		}
	} );
	console.log(row);
}
writeLog( getTimeString() );

writeLog('Build...');
var nw = new NwBuilder({
	files: (function(packageJson){
		var rtn = [
			'./package.json',
			'./app/**',
			'./composer.json',
			'./vendor/autoload.php'
		];
		var nodeModules = fs.readdirSync('./node_modules/');
		for(var i in nodeModules){
			var modName = nodeModules[i];
			switch(modName){
				case '.bin':
				case 'node-sass':
				case 'gulp':
				case 'gulp-plumber':
				case 'gulp-rename':
				case 'gulp-sass':
				case 'nw':
				case 'nw-builder':
				case 'mocha':
				case 'spawn-sync':
				case 'px2style':
					// ↑これらは除外するパッケージ
					break;
				case 'broccoli-html-editor':
					// 必要なファイルだけ丁寧に抜き出す
					rtn.push( './node_modules/'+modName+'/package.json' );
					rtn.push( './node_modules/'+modName+'/composer.json' );
					rtn.push( './node_modules/'+modName+'/client/dist/**' );
					rtn.push( './node_modules/'+modName+'/libs/**' );
					rtn.push( './node_modules/'+modName+'/fields/**' );
					rtn.push( './node_modules/'+modName+'/data/**' );
					break;
				case 'broccoli-field-table':
					// 必要なファイルだけ丁寧に抜き出す
					rtn.push( './node_modules/'+modName+'/package.json' );
					rtn.push( './node_modules/'+modName+'/composer.json' );
					rtn.push( './node_modules/'+modName+'/dist/**' );
					rtn.push( './node_modules/'+modName+'/libs/**' );
					rtn.push( './node_modules/'+modName+'/vendor/**' );
					break;
				case 'broccoli-processor':
					// 必要なファイルだけ丁寧に抜き出す
					rtn.push( './node_modules/'+modName+'/package.json' );
					rtn.push( './node_modules/'+modName+'/config/**' );
					rtn.push( './node_modules/'+modName+'/libs/**' );
					break;
				case 'pickles2-contents-editor':
					// 必要なファイルだけ丁寧に抜き出す
					rtn.push( './node_modules/'+modName+'/package.json' );
					rtn.push( './node_modules/'+modName+'/composer.json' );
					rtn.push( './node_modules/'+modName+'/dist/**' );
					rtn.push( './node_modules/'+modName+'/libs/**' );
					rtn.push( './node_modules/'+modName+'/vendor/**' );
					break;
				case 'pickles2-module-editor':
					// 必要なファイルだけ丁寧に抜き出す
					rtn.push( './node_modules/'+modName+'/package.json' );
					rtn.push( './node_modules/'+modName+'/composer.json' );
					rtn.push( './node_modules/'+modName+'/dist/**' );
					rtn.push( './node_modules/'+modName+'/libs/**' );
					rtn.push( './node_modules/'+modName+'/config/**' );
					rtn.push( './node_modules/'+modName+'/node_modules/**' );
					break;
				default:
					// まるっと登録するパッケージ
					rtn.push( './node_modules/'+modName+'/**' );
					break;
			}
		}
		var composerVendor = fs.readdirSync('./vendor/');
		for(var i in composerVendor){
			var modName = composerVendor[i];
			switch(modName){
				case 'bin':
				case 'phpunit':
					// ↑これらは除外するパッケージ
					break;
				default:
					// まるっと登録するパッケージ
					rtn.push( './vendor/'+modName+'/**' );
					break;
			}
		}
		return rtn;
	})(packageJson) , // use the glob format
	version: 'v0.12.3',// <- version number of node-webkit
	flavor: 'sdk',
	macIcns: './app/common/images/px2-osx.icns',
	winIco: './app/common/images/px2-win.ico',
	zip: false,
	platforms: [
		'linux64',
		'osx64',
		'win32'
	]
});

//Log stuff you want
nw.on('log',  writeLog);

// Build returns a promise
nw.build().then(function () {

	writeLog('all build done!');
	writeLog( getTimeString() );

	(function(){
		var versionSign = packageJson.version;
		function pad(str, len){
			str += '';
			str = phpjs.str_pad(str, len, '0', 'STR_PAD_LEFT');
			return str;
		}
		if( packageJson.version.match(new RegExp('\\+(?:[a-zA-Z0-9\\_\\-\\.]+\\.)?nb$')) ){
			versionSign += '-'+pad(date.getFullYear(),4)+pad(date.getMonth()+1, 2)+pad(date.getDate(), 2);
			versionSign += '-'+pad(date.getHours(),2)+pad(date.getMinutes(), 2);
		}

		_utils.iterateFnc([
			function(itPj, param){
				writeLog('ZIP osx64...');
				zipFolder(
					__dirname + '/build/'+appName+'/osx64/',
					__dirname + '/build/'+appName+'-'+versionSign+'-osx64.zip',
					function(err) {
						if(err) {
							writeLog('ERROR!', err);
						} else {
							writeLog('success. - '+'./build/'+appName+'-'+versionSign+'-osx64.zip');
						}
						itPj.next();
					}
				);
			},
			function(itPj, param){
				writeLog('ZIP win32...');
				zipFolder(
					__dirname + '/build/'+appName+'/win32/',
					__dirname + '/build/'+appName+'-'+versionSign+'-win32.zip',
					function(err) {
						if(err) {
							writeLog('ERROR!', err);
						} else {
							writeLog('success. - '+'./build/'+appName+'-'+versionSign+'-win32.zip');
						}
						itPj.next();
					}
				);
			},
			function(itPj, param){
				writeLog('ZIP linux64...');
				zipFolder(
					__dirname + '/build/'+appName+'/linux64/',
					__dirname + '/build/'+appName+'-'+versionSign+'-linux64.zip',
					function(err) {
						if(err) {
							writeLog('ERROR!', err);
						} else {
							writeLog('success. - '+'./build/'+appName+'-'+versionSign+'-linux64.zip');
						}
						itPj.next();
					}
				);
			},
			function(itPj, param){
				writeLog('cleanup...');
				_utils.rmdir_r(__dirname+'/build/'+appName+'/');
				itPj.next();
			},
			function(itPj, param){
				writeLog( getTimeString() );
				writeLog('all zip done!');
				itPj.next();
			}
		]).start({});

	})();

}).catch(function (error) {
	writeLog("ERROR:");
	writeLog(error);
	console.error(error);
});
