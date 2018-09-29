window.contApp.installer.pickles2 = new (function( px, contApp ){
	var _this = this;

	/**
	 * インストールを実行
	 */
	this.install = function( pj, param, opt ){
		var realpath = pj.get('path');
		if( px.utils.isFile( realpath+'/.DS_Store' ) ){
			px.fs.unlinkSync( realpath+'/.DS_Store' );
		}
		if( px.utils.isFile( realpath+'/Thumbs.db' ) ){
			px.fs.unlinkSync( realpath+'/Thumbs.db' );
		}
		var $msg = $('<div>');

		var $preCont = $('<div>');
		var $pre = $('<pre>')
			.css({
				'height':'12em',
				'overflow':'auto'
			})
			.append( $preCont
				.addClass('selectable')
				.text('実行中...')
			)
		;
		var dlgOpt = {
			'title': 'Pickles 2 プロジェクトのセットアップ',
			'body': $('<div>')
				.append( $msg.text('Pickles 2 プロジェクトをセットアップしています。この処理はしばらく時間がかかります。') )
				.append( $pre ),
			'buttons': [
				$('<button>')
					.text('セットアップしています...')
					.attr({'disabled':'disabled'})
			]
		};
		px.dialog( dlgOpt );


		var stdout = '';
		px.commandQueue.client.addQueueItem(
			[
				'composer',
				'create-project',
				'--no-interaction',
				'pickles2/preset-get-start-pickles2',
				'./',
				'2.0.*'
			],
			{
				'cdName': 'default', // この時点で composer.json は存在しないので、ルートディレクトリは `composer` ではなく `default`。
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
					$preCont.text(stdout);
				},
				'stderr': function(message){
					for(var idx in message.data){
						stdout += message.data[idx];
					}
					$preCont.text(stdout);
				},
				'close': function(message){
					if( message.data !== 0 ){
						$msg.text('セットアップが正常に完了できませんでした。もう一度お試しください。');
						dlgOpt.buttons[0].text('閉じる');
					}else{
						$msg.text('Pickles 2 プロジェクトのセットアップが完了しました。');
						dlgOpt.buttons[0].text('OK');
					}
					dlgOpt.buttons[0].removeAttr('disabled').focus();
					dlgOpt.buttons[0].on('click', function(){
						px.closeDialog();
						opt.complete();
					});
					return;
				}
			}
		);

		return this;
	}

})( window.px, window.contApp );
