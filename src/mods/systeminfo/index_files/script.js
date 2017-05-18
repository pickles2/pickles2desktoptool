(function(){
	window.px = window.parent.px;
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
				// ボタンアクション設定： 自動更新のチェック
				$('.cont_update-check button')
					.on('click', function(){
						var upd = px.getAutoUpdater().getUpdater();
						// console.log(upd);

						// ------------- Step 1 -------------
						upd.checkNewVersion(function(error, newVersionExists, manifest) {
							if( error ){
								console.error(error);
								return;
							}
							if ( !newVersionExists ) {
								alert('お使いのアプリケーションは最新版です。');

							} else {
								if( !confirm('新しいバージョンが見つかりました。更新しますか？') ){
									return;
								}

								// ------------- Step 2 -------------
								upd.download(function(error, filename) {
									if( error ){
										console.error(error);
										return;
									}

									// ------------- Step 3 -------------
									upd.unpack(filename, function(error, newAppPath) {
										if( error ){
											console.error(error);
											return;
										}

										// ------------- Step 4 -------------
										upd.runInstaller(newAppPath, [upd.getAppPath(), upd.getAppExec()],{});
										px.nw.App.quit();

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
