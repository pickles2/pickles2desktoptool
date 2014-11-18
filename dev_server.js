var port = 8080;
var svr = require('./libs/_server.node.js');
svr.start(port, './src/', {});
console.log('see: http://localhost:'+port+'/');
console.log('Type Ctrl+C for Quit;');
