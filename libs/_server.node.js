// --------------------------------------
// setup webserver
(function(exports){
	var http = require('http');
	var url = require('url');
	var fs = require('fs');

	exports.start = function(port, pathDocumentRoot, options){
		options = options||{};

		var server = http.createServer(function(request, response) {
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
			fs.readFile(pathDocumentRoot + path, function(error, bin){
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

		// 指定ポートでLISTEN状態にする
		server.listen(port);
		console.log('server started: port '+port);
		console.log('standby;');
	}// start();

})(exports);
