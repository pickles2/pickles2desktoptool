(function(px){
	var _appServer = require('./index_files/app_server_emulator.node.js').init(px);

	px.appPreview = new (function(){
		this.getUrl = function( path ){

			var port = this.getPort();

			if( typeof(path) !== typeof('') ){ path = ''; }
			if( !path.length ){ path = '/'; }
			path = path.replace( new RegExp('^\\/+'), '' );
			path = path.replace( new RegExp('\\{(?:\\*|\\$)[\s\S]*\\}'), '' );

			var pj = px.getCurrentProject();
			var croot = '/';
			if( pj && pj.getConfig() ){
				croot = pj.getConfig().path_controot;
				croot = croot.replace( new RegExp('^\\/+'), '' );
				croot = croot.replace( new RegExp('\\/+$'), '/' );
			}
			var croot_path = croot+path;
			croot_path = croot_path.replace( /^\/+/, '' );

			// 外部プレビューサーバーの設定があれば、それを優先
			if( pj ){
				var px2dtLDA_Pj = px.px2dtLDA.project(pj.projectId);
				var external_app_server_origin = px2dtLDA_Pj.getExtendedData('external_app_server_origin');
				if( typeof(external_app_server_origin)==typeof('') && external_app_server_origin.match(/^https?\:\/\//i) ){
					external_app_server_origin = external_app_server_origin.replace( /\/+$/, '' );
					var url = external_app_server_origin+'/'+croot_path;
					return url;
				}
			}

			// デフォルト：内蔵プレビューサーバーの設定を返却
			var url = 'http://127.0.0.1:'+port+'/'+croot_path;

			return url;
		}

		/**
		 * ポート番号を取得
		 */
		this.getPort = function(){
			var port = px.packageJson.pickles2.network.appserver.port;
			var db = px.getDb();
			if( db.network && db.network.preview && db.network.appserver.port ){
				port = db.network.appserver.port;
			}
			return port;
		}

		/**
		 * サーバーを起動
		 */
		this.serverStandby = function( callback ){
			callback = callback || function(){};
			var pj = px.getCurrentProject();
			if( pj ){
				// 外部のサーバーを利用するプロジェクトの場合
				var px2dtLDA_Pj = px.px2dtLDA.project(pj.projectId);
				var external_app_server_origin = px2dtLDA_Pj.getExtendedData('external_app_server_origin');
				if( typeof(external_app_server_origin)==typeof('') && external_app_server_origin.match(/^https?\:\/\//i) ){
					callback(true);
					return this;
				}
			}
			_appServer.start(this.getPort(), function(result){
				if(result === false){
					console.error('プロダクションサーバーの起動に失敗しました。');
				}
				callback(result);
			});
			return this;
		}

	})();

})(window.px);
