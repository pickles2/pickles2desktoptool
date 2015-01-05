/**
 * Pickles2 webserver emurator
 */
(function(exports){
	var http = require('http');
	var url = require('url');
	var fs = require('fs');
	var _server;
	var _port;
	var _running = false;
	var px;
	var $, jQuery;

	/**
	 * 初期化
	 */
	exports.init = function(_px, _jQuery){
		if(px){ return this; }

		px = _px;
		jQuery = $ = _jQuery;
		return this;
	}

	_server = http.createServer(function(request, response) {
		// アクセスされたURLを解析してパスを抽出
		var parsedUrl = url.parse(request.url, true);
		var params = parsedUrl.query;
		var path = parsedUrl.pathname;

		var pj = px.getCurrentProject();

		// ディレクトリトラバーサル防止
		if (path.indexOf("..") != -1) {
			path = '/';
		}
		if(path.length-1 == path.lastIndexOf('/')) {
			// リクエストが「/」で終わっている場合、index.htmlをつける。
			path += 'index.html';
		}
		var _cmdData = '';

		var pathExt = (function (path) {
			var i = path.lastIndexOf('.');
			return (i < 0) ? '' : path.substr(i + 1);
		})(path);
		var mime = 'application/octet-stream';
		var applyPx = false;
		switch( pathExt ){
			case 'html': case 'htm':             mime = 'text/html'; applyPx = true; break;
			case 'js':                           mime = 'text/javascript'; applyPx = true; break;
			case 'css':                          mime = 'text/css'; applyPx = true; break;
			case 'gif':                          mime = 'image/gif';break;
			case 'jpg': case 'jpeg': case 'jpe': mime = 'image/jpeg';break;
			case 'png':                          mime = 'image/png';break;
			case 'svg':                          mime = 'image/svg+xml';break;
		}

		if( applyPx ){
			px.utils.spawn(
				'php',
				[
					pj.get('path')+'/'+pj.get('entry_script') ,
					'-o', 'json' ,
					'-u', 'Mozilla/5.0' ,
					path
				] ,
				{
					success: function(data){
						_cmdData += data;
					},
					complete: function(code){
						var dataDecoded = JSON.parse(_cmdData);
						// console.log(dataDecoded);
						var document_body = dataDecoded.body_base64;
						try{
							// console.log('Trying to decoding Base64 on node.js...');
							// console.log(path);
							document_body = (new Buffer(document_body, 'base64')).toString();
						}catch(e){
							// console.log('disabled to decode Base64 data.');
						}
						// console.log(document_body);

						response.writeHead(dataDecoded.status, 'OK', {
							'Connection': 'close' ,
							'Content-Type': mime
						});
						response.write(document_body);
						// response.write(''+dataDecoded.relatedlinks.length);
						response.end();
						// console.log('done.');

					}
				}
			);

		}else{
			fs.readFile(pj.get('path') + path, function(error, bin){
				if(error) {
					response.writeHead(404, 'NotFound', {
						'Connection': 'close' ,
						'Content-Type': 'text/html'
					});
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
					response.writeHead(200, 'OK', { 'Content-Type': mime });
					response.write(bin);
					response.end();
				}
			});
		}
	});

	/**
	 * サーバーを起動
	 */
	exports.start = function(port, cb){
		cb = cb||function(){};
		_port = port;

		if( _running ){
			cb(true);
			return this;
		}

		// 指定ポートでLISTEN状態にする
		_server.listen(_port, function(){
			_running = true;
			console.log( 'Pickles2 server emurator started;' );
			console.log( 'port: '+_port );
			console.log( 'standby;' );
			cb(true);
		});

		return this;
	}// start();


	/**
	 * サーバーを停止
	 */
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
		if( !_running ){
			cb(true);
			return this;
		}
		console.log('closing Pickles2 server emurator...');
		// _server.destroy();
		// cb(true);

		_server.close(function(){
			// delete __server;
			_running = false;
			console.log('Pickles2 server emurator stopped;');
			console.log('bye!');
			cb(true);
		});
		return this;
	}//stop();

	/**
	 * サーバーが起動中か確認
	 */
	exports.isRunning = function(cb){
		cb = cb||function(){};
		cb(_running);
		return this;
	}//isRunning();

})(exports);
