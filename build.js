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


console.log('Build...');
var nw = new NwBuilder({
	files: (function(dep){
		var rtn = [
			'./package.json',
			'./app/**'
		];
		for(var i in dep){
			rtn.push( './node_modules/'+i+'/**' );
		}
		return rtn;
	})(packageJson.dependencies) , // use the glob format
	version: 'v0.12.3',// <- version number of node-webkit
	macIcns: './app/common/images/px2-osx.icns',
	winIco: './app/common/images/px2-win.ico',
	platforms: [
		'linux64',
		'osx64',
		'win32'
	]
});

//Log stuff you want
nw.on('log',  console.log);

// Build returns a promise
nw.build().then(function () {

	console.log('all build done!');

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
				console.log('ZIP osx64...');
				zipFolder(
					__dirname + '/build/'+appName+'/osx64/',
					__dirname + '/build/'+appName+'-'+versionSign+'-osx64.zip',
					function(err) {
						if(err) {
							console.log('ERROR!', err);
						} else {
							console.log('success.');
						}
						itPj.next();
					}
				);
			},
			function(itPj, param){
				console.log('ZIP win32...');
				zipFolder(
					__dirname + '/build/'+appName+'/win32/',
					__dirname + '/build/'+appName+'-'+versionSign+'-win32.zip',
					function(err) {
						if(err) {
							console.log('ERROR!', err);
						} else {
							console.log('success.');
						}
						itPj.next();
					}
				);
			},
			function(itPj, param){
				console.log('ZIP linux64...');
				zipFolder(
					__dirname + '/build/'+appName+'/linux64/',
					__dirname + '/build/'+appName+'-'+versionSign+'-linux64.zip',
					function(err) {
						if(err) {
							console.log('ERROR!', err);
						} else {
							console.log('success.');
						}
						itPj.next();
					}
				);
			},
			function(itPj, param){
				console.log('cleanup...');
				_utils.rmdir_r(__dirname+'/build/'+appName+'/');
				itPj.next();
			},
			function(itPj, param){
				console.log('all zip done!');
				itPj.next();
			}
		]).start({});

	})();

}).catch(function (error) {
	console.error(error);
});
