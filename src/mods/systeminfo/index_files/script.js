(function(){
	var main = window.main = window.parent.main;
	var systemInfoCollector = new (require('../../../mods/systeminfo/index_files/libs.ignore/system.js'))(window.main);
	var applicationInfoCollector = new (require('../../../mods/systeminfo/index_files/libs.ignore/application.js'))(window.main);
	var tableTemplate;

	$(window).on('load', function(){
		main.it79.fnc({}, [
			function(it1, arg){
				console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= System Info =-=-=-=-=-=');
				console.log('------------------- main', main);
				console.log('------------------- process', main.process);
				console.log('------------------- window', window.parent);
				tableTemplate = $('#template-table').html();
				it1.next();
			},
			function(it1, arg){
				// --------------------------------------
				// ボタンアクション設定： フィードバック送信
				$('.cont_support-page-link button')
					.on('click', function(){
						main.utils.openURL( main.packageJson.extra.forum.url );
						return false;
					})
					.text(main.packageJson.extra.forum.title + ' ページへ、フィードバックを投稿してください。')
				;

				// --------------------------------------
				// ボタンアクション設定： 設定データフォルダを開く
				$('.cont_open-data-dir button')
					.on('click', function(){
						main.openDataDir();
						return false;
					})
				;

				// --------------------------------------
				// ボタンアクション設定： Command Queue のメイン端末を開く
				$('.cont_open-command-queue-main-terminal button')
					.on('click', function(){
						main.commandQueue.show();
						return false;
					})
				;

				it1.next();
			},
			function(it1, arg){
				// --------------------------------------
				// アプリケーション情報テーブル描画
				applicationInfoCollector.getInfo(function(result){
					var html = main.utils.bindEjs(
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
					var html = main.utils.bindEjs(
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
