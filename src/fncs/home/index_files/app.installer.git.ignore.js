module.exports = function(px, contApp, $){
	var _this = this;

	/**
	 * インストールを実行
	 */
	this.install = function( pj, param, opt ){

		var path = pj.get('path');
		if( px.utils.isFile( path+'/.DS_Store' ) ){
			px.fs.unlinkSync( path+'/.DS_Store' );
		}
		if( px.utils.isFile( path+'/Thumbs.db' ) ){
			px.fs.unlinkSync( path+'/Thumbs.db' );
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
					px.closeDialog();
					opt.complete();
				})
				.attr({'disabled':'disabled'})
		];

		$dialog = px.dialog( dlgOpt );

		px.utils.iterateFnc([
			function(it, prop){
				$msg.text('Gitリポジトリからクローンしています。この処理はしばらく時間がかかります。')
				px.commandQueue.client.addQueueItem(
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
							var errMsg = '';
							for(var idx in message.data){
								errMsg += message.data[idx];
							}
							stdout += errMsg;
							$pre.text(stdout);
							px.log('git clone Error: '+ errMsg);
						},
						'close': function(message){
							it.next(prop);
							return;
						}
					}
				);

			} ,
			function(it, prop){
				px.commandQueue.server.setCurrentDir('composer', pj.get_realpath_composer_root());
				px.commandQueue.server.setCurrentDir('git', pj.get_realpath_git_root());
				$msg.text('composer により依存パッケージをセットアップしています。この処理はしばらく時間がかかります。');

				px.commandQueue.client.addQueueItem(
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
							px.log('composer install Error: '+ errMsg);
						},
						'close': function(message){
							$msg.text('Pickles のセットアップが完了しました。');
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

		return this;
	}

};
