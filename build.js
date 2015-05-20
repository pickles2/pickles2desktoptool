console.log('Build...');
var NwBuilder = require('node-webkit-builder');
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

/*
cp ./app/common/build/Info.plist node_modules/nodewebkit/nodewebkit/node-webkit.app/Contents/Info.plist
cp ./app/common/build/px2-osx.icns node_modules/nodewebkit/nodewebkit/node-webkit.app/Contents/Resources/nw.icns
cp -r node_modules/nodewebkit/nodewebkit/node-webkit.app/Contents ${appname}.app
zip -r ${appname}.app/Contents/Resources/app.nw ./app ./package.json ./node_modules
*/

//Log stuff you want
nw.on('log',  console.log);

// Build returns a promise
nw.build().then(function () {
  console.log('all done!');
}).catch(function (error) {
  console.error(error);
});
