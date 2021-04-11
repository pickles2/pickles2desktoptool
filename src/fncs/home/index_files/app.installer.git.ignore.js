module.exports = function(main, contApp, $){
	var _this = this;

	/**
	 * インストールを実行
	 */
	this.install = function( pj, param, opt ){

		var path = pj.get('path');
		if( main.utils.isFile( path+'/.DS_Store' ) ){
			main.fs.unlinkSync( path+'/.DS_Store' );
		}
		if( main.utils.isFile( path+'/Thumbs.db' ) ){
			main.fs.unlinkSync( path+'/Thumbs.db' );
		}

		var $msg = $('<div>');

		var $dialog;
		var stdout = '';

		var $pre = $('<pre>')
			.css({
				'height':'12em',
				'overflow':'auto'
			})
			.addClass('selectable')
			.text('実行中...')
		;

		var dlgOpt = {};
		dlgOpt.title = 'Pickles 2 のセットアップ';
		dlgOpt.body = $('<div>')
			.append( $msg.text('しばらくお待ちください。') )
			.append( $pre )
		;
		dlgOpt.buttons = [
			$('<button>')
				.text('OK')
				.on('click', function(){
					// これがセットアップ完了の最後の処理
					main.closeDialog();
					opt.success();
					opt.complete();
				})
				.attr({'disabled':'disabled'})
		];

		$dialog = main.dialog( dlgOpt );

		main.utils.iterateFnc([
			function(it, prop){
				$msg.text('Gitリポジトリからクローンしています。この処理はしばらく時間がかかります。')
				main.commandQueue.client.addQueueItem(
					[
						'git',
						'clone',
						param.repositoryUrl,
						'./'
					],
					{
						'cdName': 'default', // この時点で .git は存在しないので、ルートディレクトリは `git` ではなく `default`。
						'tags': [
							'pj-'+pj.get('id'),
							'composer-create-project'
						],
						'accept': function(queueId){
							// console.log(queueId);
						},
						'open': function(message){
						},
						'stdout': function(message){
							for(var idx in message.data){
								stdout += message.data[idx];
							}
							$pre.text(stdout);
						},
						'stderr': function(message){
							console.error('git clone Error:', message);
							var errMsg = '';
							for(var idx in message.data){
								errMsg += message.data[idx];
							}
							stdout += errMsg;
							$pre.text(stdout);
							main.log('git clone Error: '+ errMsg);
						},
						'close': function(message){
							it.next(prop);
							return;
						}
					}
				);

			} ,
			function(it, prop){
				if( pj.get_realpath_composer_root() === false ){
					$msg.text('composer.json がありません。依存パッケージを解決できません。');
					it.next(prop);
					return;
				}

				main.commandQueue.server.setCurrentDir('composer', pj.get_realpath_composer_root());
				main.commandQueue.server.setCurrentDir('git', pj.get_realpath_git_root());
				$msg.text('Composer により依存パッケージをセットアップしています。この処理はしばらく時間がかかります。');

				main.commandQueue.client.addQueueItem(
					[
						'composer',
						'install',
						'--no-interaction'
					],
					{
						'cdName': 'composer',
						'tags': [
							'pj-'+pj.get('id'),
							'composer-create-project'
						],
						'accept': function(queueId){
							// console.log(queueId);
						},
						'open': function(message){
						},
						'stdout': function(message){
							for(var idx in message.data){
								stdout += message.data[idx];
							}
							$pre.text(stdout);
						},
						'stderr': function(message){
							var errMsg = '';
							for(var idx in message.data){
								errMsg += message.data[idx];
							}
							stdout += errMsg;
							$pre.text(stdout);
							main.log('composer install Error: '+ errMsg);
						},
						'close': function(message){
							$msg.text('Pickles 2 のセットアップが完了しました。');
							it.next(prop);
							return;
						}
					}
				);
			} ,
			function(it, prop){
				dlgOpt.buttons[0].removeAttr('disabled').focus();
				it.next(prop);
			}
		]).start({param: param});

		return;
	}

};
