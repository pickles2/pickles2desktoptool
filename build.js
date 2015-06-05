var _utils = require('./app/index_files/_utils.node.js');
var NwBuilder = require('node-webkit-builder');
var zipFolder = require('zip-folder');
var packageJson = require('./package.json');
var phpjs = require('phpjs');
var date = new Date();

console.log('== build "Pickles 2 Desktop Tool" ==');

console.log('Cleanup...');
(function(base){
  var ls = _utils.ls(base);
  for(var idx in ls){
    if( base+'/'+ls[idx] == '.gitkeep' ){continue;}
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
    files: [
      './package.json',
      './app/**',
      './node_modules/**'
    ], // use the glob format
    version: 'v0.11.6',// <- version number of node-webkit
    macIcns: './app/common/build/px2-osx.icns',
    platforms: [
      'osx32',
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
    if( packageJson.version.match(new RegExp('\-nb$')) ){
      versionSign += '-'+pad(date.getFullYear(),4)+pad(date.getMonth()+1, 2)+pad(date.getDate(), 2);
      versionSign += '-'+pad(date.getHours(),2)+pad(date.getMinutes(), 2);
    }

    _utils.iterateFnc([
      function(itPj, param){
        console.log('ZIP mac32...');
        zipFolder(
          __dirname + '/build/pickles2desktoptool/osx32/',
          __dirname + '/build/Pickles2DesktopTool-'+versionSign+'-osx32.zip',
          function(err) {
            if(err) {
                console.log('ERROR!', err);
            } else {
                console.log('success.');
            }
            itPj.next();
        });
      },
      function(itPj, param){
        console.log('ZIP win32...');
        zipFolder(
          __dirname + '/build/pickles2desktoptool/win32/',
          __dirname + '/build/Pickles2DesktopTool-'+versionSign+'-win32.zip',
          function(err) {
            if(err) {
                console.log('ERROR!', err);
            } else {
                console.log('success.');
            }
            itPj.next();
        });
      },
      function(itPj, param){
        console.log('cleanup...');
        _utils.rmdir_r(__dirname+'/build/pickles2desktoptool/');
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
