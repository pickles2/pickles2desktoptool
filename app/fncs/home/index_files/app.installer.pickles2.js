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
					.text('OK')
					.on('click', function(){
						px.closeDialog();
						opt.complete();
					})
					.attr({'disabled':'disabled'})
			]
		};
		$dialog = px.dialog( dlgOpt );


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
				'cdName': 'default',
				'tags': ['composer-create-project'],
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
					dlgOpt.buttons[0].removeAttr('disabled').focus();
					$msg.text('Pickles 2 プロジェクトのセットアップが完了しました。');
					opt.complete();
					return;
				}
			}
		);

		return this;
	}

})( window.px, window.contApp );
