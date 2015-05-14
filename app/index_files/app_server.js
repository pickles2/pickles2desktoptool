// --------------------------------------
// setup webserver
(function(exports){
	var http = require('http');
	var url = require('url');
	var fs = require('fs');
	var path = require('path');
	var express = require('express'),
		app = express();

	var _port;
	var _pathDocumentRoot;


	function start(port, pathDocumentRoot){
		var server = require('http').Server(app);

		// middleware
		app.use( express.static( pathDocumentRoot ) );

		// {$port}番ポートでLISTEN状態にする
		server.listen( port );

	}// start();

	/**
	 * URLを取得
	 */
	exports.getUrl = function(){
		return 'http://127.0.0.1:'+_port+'/';
	}

	/**
	 * ポート番号を取得
	 */
	exports.getPort = function(){
		if( !_port ){
			_port = 8081;
		}
		return _port;
	}

	/**
	 * サーバーを起動
	 */
	exports.serverStandby = function( port, pathDocumentRoot, cb ){
		cb = cb||function(){};
		if( _port ){
			cb();
			return this;
		}

		_port = port;
		_pathDocumentRoot = pathDocumentRoot;
		if( !_port ){
			_port = 8081;// default port number
		}
		start( this.getPort(), _pathDocumentRoot );
		cb();
		return this;
	}


})(exports);
