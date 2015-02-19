window.contApp.installer.git = new (function( px, contApp ){
	var _this = this;

	/**
	 * インストールを実行
	 */
	this.install = function( pj, param, opt ){

		var path = pj.get('path');

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
		dlgOpt.title = 'Pickles のセットアップ';
		dlgOpt.body = $('<div>')
			.append( $msg.text('Gitリポジトリからクローンしています。この処理はしばらく時間がかかります。') )
			.append( $pre )
		;
		dlgOpt.buttons = [
			$('<button>')
				.text('OK')
				.click(function(){
					// これがセットアップ完了の最後の処理
					px.closeDialog();
					opt.complete();
				})
				.attr({'disabled':'disabled'})
		];

		$dialog = px.dialog( dlgOpt );

		// stdout = '';
		px.utils.spawn(
			px.cmd('git'), ['clone', param.repositoryUrl, './'],
			{
				cd: path,
				success: function(data){
					stdout += data;
					$pre.text(stdout);
				} ,
				error: function(data){
					stdout += data;
				} ,
				complete: function(code){
					$msg.text('composer をセットアップしています。この処理はしばらく時間がかかります。');
					px.utils.spawn(
						px.cmd('composer'), ['install'],
						{
							cd: path,
							success: function(data){
								stdout += data;
								$pre.text(stdout);
							} ,
							error: function(data){
								stdout += data;
								$msg.text('ERROR: '+data);
							} ,
							cmdComplete: function(code){
								$msg.text('Pickles のセットアップが完了しました。');
							},
							complete: function(dataFin){
								dlgOpt.buttons[0].removeAttr('disabled');
							}
						}
					);
				}
			}
		);

		return this;
	}

})( window.px, window.contApp );