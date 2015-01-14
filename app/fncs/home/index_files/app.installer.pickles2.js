window.contApp.installer.pickles2 = new (function( px, contApp ){
	var _this = this;

	/**
	 * インストールを実行
	 */
	this.install = function( pj, param, opt ){

		var $msg = $('<div>');
		px.spawnDialog(
			px.cmd('composer'),
			[
				'create-project',
				'tomk79/pickles2',
				'./',
				'dev-master'
			],
			{
				cd: pj.get('path'),
				title: 'Pickles のセットアップ',
				description: $msg.text('Pickles をセットアップしています。この処理はしばらく時間がかかります。'),
				success: function(data){
				} ,
				error: function(data){
					px.message('ERROR: '+data);
					$msg.text('ERROR: '+data);
				} ,
				cmdComplete: function(code){
					$msg.text('Pickles のセットアップが完了しました。');
				},
				complete: function(dataFin){
					opt.complete();
				}
			}
		);
		return this;
	}

})( window.px, window.contApp );