// --------------------------------------
// setup webserver
(function(exports){
	var http = require('http');
	var url = require('url');
	var fs = require('fs');
	var _server;
	var _port, _pathDocumentRoot;

	_server = http.createServer(function(request, response) {
		// アクセスされたURLを解析してパスを抽出
		var parsedUrl = url.parse(request.url, true);
		var params = parsedUrl.query;
		var path = parsedUrl.pathname;


		// ディレクトリトラバーサル防止
		if (path.indexOf("..") != -1) {
			path = '/';
		}
		if(path.length-1 == path.lastIndexOf('/')) {
			// リクエストが「/」で終わっている場合、index.htmlをつける。
			path += 'index.html';
		}
		fs.readFile(_pathDocumentRoot + path, function(error, bin){
			if(error) {
				response.writeHead(404, 'NotFound', {'Content-Type': 'text/html'});
				response.write('<!DOCTYPE html>');
				response.write('<html>');
				response.write('<head>');
				response.write('<title>Not found.</title>');
				response.write('</head>');
				response.write('<body>');
				response.write('<h1>404 Not found.</h1>');
				response.write('<p>File NOT found.</p>');
				response.write('</body>');
				response.write('</html>');
				response.end();
			} else {
				var pathExt = (function (path) {
					var i = path.lastIndexOf('.');
					return (i < 0) ? '' : path.substr(i + 1);
				})(path);
				var mime = 'text/html';
				switch( pathExt ){
					case 'html': case 'htm':             mime = 'text/html';break;
					case 'js':                           mime = 'text/javascript';break;
					case 'css':                          mime = 'text/css';break;
					case 'gif':                          mime = 'image/gif';break;
					case 'jpg': case 'jpeg': case 'jpe': mime = 'image/jpeg';break;
					case 'png':                          mime = 'image/png';break;
					case 'svg':                          mime = 'image/svg+xml';break;
				}

				response.writeHead(200, 'OK', { 'Content-Type': mime });
				response.write(bin);
				response.end();
			}
		});

	});


	exports.start = function(port, pathDocumentRoot, cb){
		cb = cb||function(){};
		_port = port;
		_pathDocumentRoot = pathDocumentRoot;

		// 指定ポートでLISTEN状態にする
		_server.listen(_port, function(){
			console.log('Pickles2 server emurator started;');
			console.log('port: '+_port);
			console.log('documentRoot: '+_pathDocumentRoot);
			console.log('standby;');
			cb();
		});

		return true;
	}// start();

	exports.stop = function(cb){
		cb = cb||function(){};
		var _this = this;

		// if( !_server ){
		// 	console.log('Pickles2 server emurator NOT standby;');
		// 	return false;
		// }

		// console.log(_server);
		// console.log(_port);
		// console.log(_pathDocumentRoot);
		_server.close(function(){
			// delete __server;
			console.log('Pickles2 server emurator stopped;');
			console.log('bye!');
			cb();
		});
		return true;
	}//stop();

})(exports);
