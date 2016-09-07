/**
 * Pickles2 webserver emulator
 */
(function(exports){
	var http = require('http');
	var url = require('url');
	var fs = require('fs');
	var path = require('path');
	var express = require('express');
	var expressPickles2 = require('express-pickles2');
	var morgan = require('morgan');
	var FileStreamRotator = require('file-stream-rotator');
	var _server = express();
	var _path_access_log;
	var _last_realpathEntryScript;

	var _port;
	var _running = false;
	var px;

	/**
	 * 初期化
	 */
	exports.init = function(_px){
		if(px){ return this; }

		px = _px;
		_path_access_log = path.resolve(px.getDataDir()+'/logs/')+'/';
		// console.log(_path_access_log);

		return this;
	}


	/**
	 * broccoli-html-editor が要求するコードを取得
	 */
	function getBroccoliScript(){
		var fin = '';
			fin += '<script data-broccoli-receive-message="yes">'+"\n";
			// fin += 'console.log(window.location);'+"\n";
			fin += 'window.addEventListener(\'message\',(function() {'+"\n";
			fin += 'return function f(event) {'+"\n";
			// fin += 'console.log(event.origin);'+"\n";
			// fin += 'console.log(event.data);'+"\n";
			fin += 'if(window.location.hostname!=\'127.0.0.1\'){alert(\'Unauthorized access.\');return;}'+"\n";
			fin += 'if(!event.data.scriptUrl){return;}'+"\n";
			fin += 'var s=document.createElement(\'script\');'+"\n";
			fin += 'document.querySelector(\'body\').appendChild(s);s.src=event.data.scriptUrl;'+"\n";
			fin += 'window.removeEventListener(\'message\', f, false);'+"\n";
			fin += '}'+"\n";
			fin += '})(),false);'+"\n";
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

		var accessLogStream;
		(function(){
			// ensure log directory exists
			fs.existsSync(_path_access_log) || fs.mkdirSync(_path_access_log);

			// create a rotating write stream
			accessLogStream = FileStreamRotator.getStream({
				'date_format': 'YYYYMMDD',
				'filename': path.join(_path_access_log, 'access-%DATE%.log'),
				'frequency': 'daily',
				'verbose': false
			});

			// setup the logger
			_server.use(
				morgan(
					'combined',
					{
						'stream': accessLogStream
					}
				)
			);
		})();


		(function(){
			var accessRestriction = 'loopback';
			try {
				accessRestriction = px.getDb().network.preview.accessRestriction;
			} catch (e) {
			}

			if( accessRestriction == 'off' ){
				// 制限をかけない
				return;
			}

			// IPアクセス制限
			// loopback = 127.0.0.1/8, ::1/128
			_server.set('trust proxy', ['loopback']);
			_server.use('/*', function(req, res, next){
				// console.log(req.ip);
				// console.log(req.connection.remoteAddress);

				if( !px.isLoopbackIp( req.ip ) ){
					res
						.set('Content-Type', 'text/html')
						.status(403)
						.type('html')
						.send('Not allowed IP address. (' + req.ip + ')')
						.end()
					;
					return;
				}

				next();
				return;
			} );
		})();


		// setup Pickles 2
		_server.use('/*', expressPickles2(
			null,
			{
				'liveConfig': function(callback){
					var pj = px.getCurrentProject();
					var realpathEntryScript = path.resolve(pj.get('path'), pj.get('entry_script'));
					if( _last_realpathEntryScript !== realpathEntryScript ){
						// console.log(realpathEntryScript);
						_last_realpathEntryScript = realpathEntryScript;
						accessLogStream.write(
							'Switch Project to: ' + realpathEntryScript+"\n",
							'utf-8'
						);
						callback(
							realpathEntryScript,
							{}
						);
						return;
					}else{
						callback(
							realpathEntryScript,
							{}
						);
						return;
					}
				},
				'processor': function(bin, ext, callback){
					if( ext == 'html' ){
						bin += getBroccoliScript();
					}
					callback(bin);
					return;
				},
				'bin': px.nodePhpBinOptions.bin,
				'ini': px.nodePhpBinOptions.ini,
				'extension_dir': px.nodePhpBinOptions.extension_dir
			},
			_server
		) );


		// 指定ポートでLISTEN状態にする
		_server.listen(_port, function(){
			_running = true;
			console.log( 'Pickles2 server emulator started;' );
			console.log( 'port: '+_port );
			console.log( 'standby;' );
			cb(true);
		});

		return this;
	}// start();


})(exports);
