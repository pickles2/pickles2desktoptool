var _utils = require('./app/index_files/_utils.node.js');
var NwBuilder = require('node-webkit-builder');
var zipFolder = require('zip-folder');
var packageJson = require('./package.json');


console.log('== build "Pickles 2 Desktop Tool" ==');

console.log('Cleanup...');
if( _utils.isDirectory(__dirname+'/build/pickles2desktoptool/') ){
  _utils.rmdir_r(__dirname+'/build/pickles2desktoptool/');
}
if( _utils.isFile(__dirname+'/build/Pickles2DesktopTool-osx32.zip') ){
  _utils.rm(__dirname+'/build/Pickles2DesktopTool-osx32.zip');
}
if( _utils.isFile(__dirname+'/build/Pickles2DesktopTool-win32.zip') ){
  _utils.rm(__dirname+'/build/Pickles2DesktopTool-win32.zip');
}
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

    _utils.iterateFnc([
      function(itPj, param){
        console.log('ZIP mac32...');
        zipFolder(
          __dirname + '/build/pickles2desktoptool/osx32/',
          __dirname + '/build/Pickles2DesktopTool-'+packageJson.version+'-osx32.zip',
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
          __dirname + '/build/Pickles2DesktopTool-'+packageJson.version+'-win32.zip',
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
        if( _utils.isDirectory(__dirname+'/build/pickles2desktoptool/') ){
          _utils.rmdir_r(__dirname+'/build/pickles2desktoptool/');
        }
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
