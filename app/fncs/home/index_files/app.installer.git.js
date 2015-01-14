window.contApp.installer.git = new (function( px, contApp ){
	var _this = this;

	/**
	 * インストールを実行
	 */
	this.install = function( pj, param, opt ){

		var $msg = $('<div>');
		px.spawnDialog(
			px.cmd('git'),
			[
				'clone',
				param.repositoryUrl,
				'./'
			],
			{
				cd: pj.get('path'),
				title: 'Pickles のセットアップ',
				description: $msg.text('Gitリポジトリからクローンしています。この処理はしばらく時間がかかります。'),
				success: function(data){
				} ,
				error: function(data){
					px.message('ERROR: '+data);
					$msg.text('ERROR: '+data);
				} ,
				cmdComplete: function(code){
					$msg.text('$ git clone が完了しました。');
				},
				complete: function(dataFin){
					alert(dataFin);
					px.spawnDialog(
						px.cmd('composer'),
						[
							'install'
						],
						{
							cd: pj.get('path'),
							title: 'Pickles のセットアップ',
							description: $msg.text('composer をセットアップしています。この処理はしばらく時間がかかります。'),
							success: function(data){
							} ,
							error: function(data){
								$msg.text('ERROR: '+data);
							} ,
							cmdComplete: function(code){
								$msg.text('Pickles のセットアップが完了しました。');
							},
							complete: function(dataFin){
								opt.complete( dataFin );
							}
						}
					);
				}
			}
		);
		return this;
	}

})( window.px, window.contApp );