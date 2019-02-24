var fs = require('fs');
var fsX = require('fs-extra');
var utils79 = require('utils79');
var it79 = require('iterate79');
var NwBuilder = require('nw-builder');
var zipFolder = require('zip-folder');
var packageJson = require('../package.json');
var phpjs = require('phpjs');
var date = new Date();
var appName = packageJson.name;
var versionSign = packageJson.version;
var platforms = [
	'osx64',
	// 'win64',
	'win32',
	'linux64'
];
var APPLE_IDENTITY = null;
if( utils79.is_file( './apple_identity.txt' ) ){
	APPLE_IDENTITY = fs.readFileSync('./apple_identity.txt').toString();
	APPLE_IDENTITY = utils79.trim(APPLE_IDENTITY);
}

function pad(str, len){
	str += '';
	str = phpjs.str_pad(str, len, '0', 'STR_PAD_LEFT');
	return str;
}
function getTimeString(){
	var date = new Date();
	return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
}
function writeLog(row){
	fs.appendFile( __dirname+'/dist/buildlog.txt', row+"\n" ,'utf8', function(err){
		if(err){
			console.error(err);
		}
	} );
	console.log(row);
}

if( packageJson.version.match(new RegExp('\\+(?:[a-zA-Z0-9\\_\\-\\.]+\\.)?nb$')) ){
	versionSign += '-'+pad(date.getFullYear(),4)+pad(date.getMonth()+1, 2)+pad(date.getDate(), 2);
	versionSign += '-'+pad(date.getHours(),2)+pad(date.getMinutes(), 2);
	packageJson.version = versionSign;
	// 一時的なバージョン番号を付与した package.json を作成し、
	// もとのファイルを リネームしてとっておく。
	// ビルドが終わった後に元に戻す。
	require('fs').renameSync('./package.json', './package.json.orig');
	require('fs').writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
}

console.log('== build "'+appName+'" v'+versionSign+' ==');

console.log('Cleanup...');
(function(base){
	var ls = fs.readdirSync(base);
	for(var idx in ls){
		if( ls[idx] == '.gitkeep' ){continue;}
		if( utils79.is_dir(base+'/'+ls[idx]) ){
			fsX.removeSync(base+'/'+ls[idx]);
		}else if( utils79.is_file(base+'/'+ls[idx]) ){
			fsX.unlinkSync(base+'/'+ls[idx]);
		}
	}
})( __dirname+'/dist/' );
console.log('');

writeLog( getTimeString() );

writeLog('Build...');
var nw = new NwBuilder({
	files: (function(packageJson){
		var rtn = [
			'./package.json',
			'./app/**/*',
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
					rtn.push( './node_modules/'+modName+'/node_modules/**' );
					rtn.push( './node_modules/'+modName+'/composer.json' );
					rtn.push( './node_modules/'+modName+'/vendor/**' );
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
					rtn.push( './node_modules/'+modName+'/node_modules/**' );
					break;
				case 'broccoli-processor':
					// 必要なファイルだけ丁寧に抜き出す
					rtn.push( './node_modules/'+modName+'/package.json' );
					rtn.push( './node_modules/'+modName+'/node_modules/**' );
					rtn.push( './node_modules/'+modName+'/config/**' );
					rtn.push( './node_modules/'+modName+'/libs/**' );
					break;
				case 'pickles2-contents-editor':
					// 必要なファイルだけ丁寧に抜き出す
					rtn.push( './node_modules/'+modName+'/package.json' );
					rtn.push( './node_modules/'+modName+'/node_modules/**' );
					rtn.push( './node_modules/'+modName+'/composer.json' );
					rtn.push( './node_modules/'+modName+'/vendor/**' );
					rtn.push( './node_modules/'+modName+'/dist/**' );
					rtn.push( './node_modules/'+modName+'/libs/**' );
					rtn.push( './node_modules/'+modName+'/data/**' );
					rtn.push( './node_modules/'+modName+'/config/**' );
					rtn.push( './node_modules/'+modName+'/broccoli_assets/**' );
					break;
				case 'pickles2-module-editor':
					// 必要なファイルだけ丁寧に抜き出す
					rtn.push( './node_modules/'+modName+'/package.json' );
					rtn.push( './node_modules/'+modName+'/node_modules/**' );
					rtn.push( './node_modules/'+modName+'/composer.json' );
					rtn.push( './node_modules/'+modName+'/vendor/**' );
					rtn.push( './node_modules/'+modName+'/dist/**' );
					rtn.push( './node_modules/'+modName+'/libs/**' );
					rtn.push( './node_modules/'+modName+'/config/**' );
					break;
				default:
					// まるっと登録するパッケージ
					rtn.push( './node_modules/'+modName+'/**/*' );
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
					rtn.push( './vendor/'+modName+'/**/*' );
					break;
			}
		}
		return rtn;
	})(packageJson) , // use the glob format
	version: '0.21.1',// <- version number of node-webkit
	flavor: 'sdk',
	macIcns: './app/common/images/appicon-osx.icns',
	winIco: './app/common/images/appicon-win.ico',
	zip: false,
	platforms: platforms
});

//Log stuff you want
nw.on('log',  writeLog);

// Build returns a promise
nw.build().then(function () {

	if( require('fs').existsSync('./package.json.orig') ){
		// 一時的なバージョン番号を付与した package.json を削除し、
		// もとのファイルに戻す。
		require('fs').renameSync('./package.json.orig', './package.json');
	}

	writeLog('all build done!');
	writeLog( getTimeString() );

	(function(){
		it79.fnc({}, [
			function(itPj, param){
				// macOS 版に 署名を追加する
				if( !APPLE_IDENTITY ){
					itPj.next(param);
					return;
				}
				writeLog('-- Apple Developer Certification:');
				writeLog(APPLE_IDENTITY);
				var proc = require('child_process').spawn(
					'codesign',
					[
						'--deep',
						'-s', APPLE_IDENTITY,
						'./build/'+appName+'/osx64/'+appName+'.app'
					],
					{}
				);
				proc.on('close', function(){
					writeLog('done!');
					itPj.next(param);
				});
			},
			function(itPj, param){
				// ZIP Apps.
				it79.ary(
					platforms,
					function(it2, platformName, idx){
						writeLog('[platform: '+platformName+'] Zipping...');
						zipFolder(
							__dirname + '/'+appName+'/'+platformName+'/',
							__dirname + '/dist/'+appName+'-'+versionSign+'-'+platformName+'.zip',
							function(err) {
								if(err) {
									writeLog('ERROR!', err);
								} else {
									writeLog('success. - '+'./build/dist/'+appName+'-'+versionSign+'-'+platformName+'.zip');
								}
								it2.next();
							}
						);
					},
					function(){
						itPj.next(param);
					}
				);
			},
			function(itPj, param){
				writeLog('cleanup...');
				fsX.removeSync(__dirname+'/'+appName+'/');
				itPj.next(param);
			},
			function(itPj, param){
				writeLog( getTimeString() );
				writeLog('all zip done!');
				itPj.next(param);
			}
		]);

	})();

}).catch(function (error) {
	writeLog("ERROR:");
	writeLog(error);
	console.error(error);
});
