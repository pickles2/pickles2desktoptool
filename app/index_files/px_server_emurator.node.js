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
		// console.log( pj.getConfig().path_controot );

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
			case 'pdf':                          mime = 'application/pdf';break;
		}

		if( applyPx && !path.match( new RegExp( '^'+px.utils.escapeRegExp( pj.getConfig().path_controot ) ) ) ){
			response.writeHead(500, 'Internal Server Error', {
				'Connection': 'close' ,
				'Content-Type': 'text/html'
			});
			response.write('<!DOCTYPE html>');
			response.write('<html>');
			response.write('<head>');
			response.write('<meta charset="UTF-8" />');
			response.write('<title>500 Internal Server Error.</title>');
			response.write('</head>');
			response.write('<body>');
			response.write('<h1>500 Internal Server Error.</h1>');
			response.write('<p>Pickles2 の管理外のパスにアクセスしました。</p>');
			response.write('</body>');
			response.write('</html>');
			response.end();
			return;
		}
		path = path.replace( new RegExp( '^'+px.utils.escapeRegExp( pj.getConfig().path_controot ) ), '/' );

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
						var dataDecoded, document_body, statusCode = 500;
						try{
							dataDecoded = JSON.parse(_cmdData);
							document_body = dataDecoded.body_base64;
							statusCode = dataDecoded.status;
							document_body = (new Buffer(document_body, 'base64')).toString();
						}catch(e){
							document_body = _cmdData;
							statusCode = 500;
							console.log('disabled to decode Base64 data.');
							console.log(document_body);
						}

						response.writeHead( statusCode, 'OK', {
							'Connection': 'close' ,
							'Content-Type': mime
						});
						response.write( document_body );
						if(mime=='text/html'){
							response.write(getBroccoliScript());
						}
						response.end();
					}
				}
			);
			return ;
		}else{
			fs.readFile( px.utils.dirname( pj.get('path')+'/'+pj.get('entry_script') ) + path, function(error, bin){
				if(error) {
					response.writeHead(404, 'Not Found', {
						'Connection': 'close' ,
						'Content-Type': 'text/html'
					});
					response.write('<!DOCTYPE html>');
					response.write('<html>');
					response.write('<head>');
					response.write('<meta charset="UTF-8" />');
					response.write('<title>404 Not found.</title>');
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
					if(mime=='text/html'){
						response.write(getBroccoliScript());
					}
					response.end();
				}
			});
			return ;
		}
		return ;
	});

	/**
	 * broccoli-html-editor が要求するコードを取得
	 */
	function getBroccoliScript(){
		var scriptSrc = fs.readFileSync(__dirname+'/../common/broccoli-html-editor/client/dist/broccoli-preview-contents.js').toString('utf-8');
		var fin = '';
			fin += '<script data-broccoli-receive-message="yes">'+"\n";
			// fin += 'console.log(window.location);'+"\n";
			fin += 'window.addEventListener(\'message\',(function() {'+"\n";
			fin += 'return function f(event) {'+"\n";
			// fin += 'console.log(event.origin);'+"\n";
			// fin += 'console.log(event.data);'+"\n";
			fin += 'if(window.location.hostname!=\'127.0.0.1\'){alert(\'Unauthorized access.\');return;}'+"\n";
			fin += 'var s=document.createElement(\'script\');'+"\n";
			fin += 'document.querySelector(\'body\').appendChild(s);s.src=event.data.scriptUrl;'+"\n";
			fin += 'window.removeEventListener(\'message\', f, false);'+"\n";
			fin += '}'+"\n";
			fin += '})(),false);'+"\n";
			fin += '</script>'+"\n";
			fin += '<script>';
			fin += scriptSrc;
			fin += '</script>'+"\n";
		return fin;
	}

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


})(exports);
