(function(px, $){
	var _previewServer = require('./index_files/px_server_emurator.node.js').init(px, $);
	px.preview = new (function(){
		this.getUrl = function( path ){
			var port = this.getPort();

			if( typeof(path) !== typeof('') ){ path = ''; }
			if( !path.length ){ path = '/'; }
			path = path.replace( new RegExp('^\\/+'), '' );

			var pj = px.getCurrentProject();
			var croot = pj.getConfig().path_controot;
			croot = croot.replace( new RegExp('^\\/+'), '' );
			croot = croot.replace( new RegExp('\\/+$'), '/' );

			var url = 'http://127.0.0.1:'+port+'/'+croot+path;

			return url;
		}

		this.getPort = function(){
			var port = 8080;
			if( px.getDb().network.preview.port ){
				port = px.getDb().network.preview.port;
			}
			return port;
		}

		/**
		 * サーバーを起動
		 */
		this.serverStandby = function( cb ){
			_previewServer.start(this.getPort(), cb);
			return this;
		}

		/**
		 * サーバーを停止
		 */
		this.serverStop = function( cb ){
			cb();

			// ↓なぜかサーバーが閉じない。(server.close() が返ってこない)
			// 　UTODO: ので、↑とりあえず cb() 返しておく。あとで調べる。
			_previewServer.stop(function(){
				console.log('---- server closed!! ----');
			});
			return this;
		}

	})();
})(px, jQuery);