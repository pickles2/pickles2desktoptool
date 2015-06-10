(function(px, $){
	var _previewServer = require('./index_files/px_server_emurator.node.js').init(px, $);
	px.preview = new (function(){
		this.getUrl = function( path ){
			var port = this.getPort();

			if( typeof(path) !== typeof('') ){ path = ''; }
			if( !path.length ){ path = '/'; }
			path = path.replace( new RegExp('^\\/+'), '' );

			var pj = px.getCurrentProject();
			var croot = '/';
			if( pj && pj.getConfig() ){
				croot = pj.getConfig().path_controot;
				croot = croot.replace( new RegExp('^\\/+'), '' );
				croot = croot.replace( new RegExp('\\/+$'), '/' );
			}

			var url = 'http://127.0.0.1:'+port+'/'+croot+path;

			return url;
		}

		/**
		 * ポート番号を取得
		 */
		this.getPort = function(){
			var port = 8080;
			var db = px.getDb();
			if( db.network && db.network.preview && db.network.preview.port ){
				port = db.network.preview.port;
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

	})();

})(px, jQuery);