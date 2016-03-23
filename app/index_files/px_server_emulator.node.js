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
	var _server = express();

	var _port;
	var _running = false;
	var px;

	/**
	 * 初期化
	 */
	exports.init = function(_px){
		if(px){ return this; }

		px = _px;

		return this;
	}


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
			fin += 'if(!event.data.scriptUrl){return;}'+"\n";
			// fin += 'var s=document.createElement(\'script\');'+"\n";
			// fin += 'document.querySelector(\'body\').appendChild(s);s.src=event.data.scriptUrl;'+"\n";
			fin += scriptSrc+';'+"\n";
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

		_server.use('/*', expressPickles2(
			null,
			{
				'liveConfig': function(callback){
					var pj = px.getCurrentProject();
					var realpathEntryScript = path.resolve(pj.get('path'), pj.get('entry_script'));
					callback(
						realpathEntryScript,
						{}
					);
				},
				'processor': function(bin, ext, callback){
					if( ext == 'html' ){
						bin += getBroccoliScript();
					}
					callback(bin);
					return;
				}
			}
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
