(function(){
	var px = window.px = window.parent.px;
	var systemInfoCollector = new (require('../../../mods/systeminfo/index_files/libs.ignore/system.js'))(window.px);
	var applicationInfoCollector = new (require('../../../mods/systeminfo/index_files/libs.ignore/application.js'))(window.px);
	var tableTemplate;

	$(window).load( function(){
		px.it79.fnc({}, [
			function(it1, arg){
				console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= System Info =-=-=-=-=-=');
				console.log('------------------- px', px);
				console.log('------------------- process', px.process);
				console.log('------------------- window', window.parent);
				tableTemplate = $('#template-table').html();
				it1.next();
			},
			function(it1, arg){
				// --------------------------------------
				// ボタンアクション設定： フィードバック送信
				$('.cont_support-page-link button')
					.on('click', function(){
						px.utils.openURL( px.packageJson.pickles2.forum.url );
						return false;
					})
					.text(px.packageJson.pickles2.forum.title + ' ページへ、フィードバックを投稿してください。')
				;

				// --------------------------------------
				// ボタンアクション設定： 設定データフォルダを開く
				$('.cont_open-data-dir button')
					.on('click', function(){
						px.openDataDir();
						return false;
					})
				;

				// --------------------------------------
				// ボタンアクション設定： Command Queue のメイン端末を開く
				$('.cont_open-command-queue-main-terminal button')
					.on('click', function(){
						px.commandQueue.show();
						return false;
					})
				;

				// --------------------------------------
				// ボタンアクション設定： 自動更新のチェック
				$('.cont_update-check button')
					.on('click', function(){
						var upd = px.getAutoUpdater().getUpdater();
						// console.log(upd);

						// 新しいバージョンがあるかどうか確認する
						upd.checkNewVersion(function(error, newVersionExists, manifest) {
							if( error ){
								console.error(error);
								return;
							}
							if ( !newVersionExists ) {
								alert('お使いのアプリケーションは最新版です。');

							} else {
								if( !confirm('新しいバージョンが見つかりました。'+"\n"+'最新バージョン: '+manifest.version+"\n"+'お使いのバージョン: '+px.packageJson.version+"\n"+'更新しますか？') ){
									return;
								}
								if( !confirm('アプリケーションの更新には、数分かかることがあります。 更新中には作業は行なえません。 いますぐ更新しますか？') ){
									return;
								}
								console.info('インストーラーをダウンロードしています...。');

								// 最新版のZIPアーカイブをダウンロード
								upd.download(function(error, filename) {
									if( error ){
										console.error(error);
										return;
									}

									console.info('インストーラーアーカイブを展開しています...。');

									// ZIPを解凍
									upd.unpack(filename, function(error, newAppPath) {
										if( error ){
											console.error(error);
											return;
										}

										console.info('インストールの準備が整いました。インストーラーを起動します。');
										setTimeout(function(){
											upd.runInstaller(newAppPath, [upd.getAppPath(), upd.getAppExec()],{});
											px.exit();
											return;
										}, 3000);

									}, manifest);

								}, manifest);

							}
						});

						return false;
					})
				;

				it1.next();
			},
			function(it1, arg){
				// --------------------------------------
				// アプリケーション情報テーブル描画
				applicationInfoCollector.getInfo(function(result){
					var html = px.utils.bindEjs(
						tableTemplate,
						{
							"info": result
						}
					);
					$('.cont_application-information-table').html( html );
					it1.next();
				});

			},
			function(it1, arg){
				// --------------------------------------
				// システム情報テーブル描画
				systemInfoCollector.getInfo(function(result){
					var html = px.utils.bindEjs(
						tableTemplate,
						{
							"info": result
						}
					);
					$('.cont_system-information-table').html( html );
					it1.next();
				});

			},
			function(it1, arg){
				console.log('system info done.');
				it1.next();
			}
		]);

	} );

})();
