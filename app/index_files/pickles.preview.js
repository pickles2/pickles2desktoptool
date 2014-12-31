(function(px, $){
	var _previewServer = require('./index_files/px_server_emurator.node.js').init(px, $);
	px.preview = new (function(){
		this.getUrl = function( path ){
			var port = this.getPort();

			if( typeof(path) !== typeof('') ){ path = ''; }
			if( !path.length ){ path = '/'; }
			path = path.replace( new RegExp('^\\/+'), '' );

			var url = 'http://127.0.0.1:'+port+'/'+path;

			return url;
		}

		this.getPort = function( argument ){
			var port = 8080;
			if( px.getDb().network.preview.port ){ port = px.getDb().network.preview.port; }
			return port;
		}

		this.serverStandby = function( cb ){
			_previewServer.start(this.getPort(), cb);
		}

	})();
})(px, jQuery);