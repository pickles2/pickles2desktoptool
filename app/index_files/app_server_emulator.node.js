// --------------------------------------
// setup webserver
(function(exports){
	var http = require('http');
	var url = require('url');
	var fs = require('fs');
	var path = require('path');
	var express = require('express');
	var expressQueue = require('express-queue');
	var expressPickles2 = require('express-pickles2');
	var morgan = require('morgan');
	var FileStreamRotator = require('file-stream-rotator');
	var _server = express();
	var _path_access_log;
	var _last_realpathEntryScript;
	var _realpathPublishDir;

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
	 * サーバーを起動
	 */
	exports.start = function(port, callback ){
		callback = callback||function(){};
		_port = port;

		if( _running ){
			callback(true);
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

		// Content-type が認識されなくなることがある問題の対応として、
		// etagを出力しないように変更。
		_server.set('etag', false);

		// Express Queue
		_server.use(expressQueue({ activeLimit: 1, queuedLimit: -1 }));

		// Update Pickles 2 config
		_server.use('/*', function(req, res, next){
			var pj = px.getCurrentProject();
			var entryScript = path.resolve( pj.get('path') + '/' + pj.get('entry_script') );
			var realpathContRoot = px.utils79.dirname(entryScript);
			_realpathPublishDir = path.resolve( realpathContRoot, pj.getConfig().path_publish_dir )+'/';
			// console.log(pj);
			// console.log(pj.getConfig());
			// console.log(pj.getConfig().path_publish_dir);
			// console.log(realpathContRoot);
			// console.log(_realpathPublishDir);
			// // path_publish_dir
			next();
			return;
		} );

		_server.use('/*', function(req, res, next){
			console.log(req);
			res.status(200).send("Hello World "+_realpathPublishDir);
			return;
		} );


		// 指定ポートでLISTEN状態にする
		var listenResult;
		var timerListeningCallbackFalse = setTimeout(function(){
			console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
			if( !listenResult.listening ){
				console.error( 'Failed to start Pickles 2 server emulator; port: '+_port+', NOT standby;' );
				callback(false);
				return;
			}
			callback(true);
		}, 2000);
		listenResult = _server.listen(_port, function(a){
			clearTimeout(timerListeningCallbackFalse); // 成功したらエラー応答のタイマーをキャンセル
			_running = true;
			console.log( 'Pickles 2 server emulator started;' );
			console.log( 'port: '+_port );
			console.log( 'standby;' );
			callback(true);
		});

		return this;
	}


})(exports);
