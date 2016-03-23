(function(px, $, window){

	px.editPx2DTConfig = function(){
		var $tpl = $( $('#template-editPx2DTConfig').html() );

		if( !px.getDb().commands ){ px.getDb().commands = {}; }

		if( !px.getDb().network ){ px.getDb().network = {}; }
		if( !px.getDb().network.preview ){ px.getDb().network.preview = {}; }
		if( !px.getDb().network.preview.port ){ px.getDb().network.preview.port = null; }
		if( !px.getDb().network.appserver ){ px.getDb().network.appserver = {}; }
		if( !px.getDb().network.appserver.port ){ px.getDb().network.appserver.port = null; }

		if( !px.getDb().apps ){ px.getDb().apps = {}; }
		if( !px.getDb().apps.texteditor ){ px.getDb().apps.texteditor = null; }
		if( !px.getDb().apps.texteditorForDir ){ px.getDb().apps.texteditorForDir = null; }

		$tpl.find('[name=php]').val( px.getDb().commands.php );
		$tpl.find('[name=git]').val( px.getDb().commands.git );
		$tpl.find('[name=network_preview_port]').val( px.getDb().network.preview.port ).attr({'placeholder':px.packageJson.pickles2.network.preview.port});
		$tpl.find('[name=network_appserver_port]').val( px.getDb().network.appserver.port ).attr({'placeholder':px.packageJson.pickles2.network.appserver.port});
		$tpl.find('[name=apps_texteditor]').val( px.getDb().apps.texteditor );
		$tpl.find('[name=apps_texteditor_for_dir]').val( px.getDb().apps.texteditorForDir );

		var fileInputs = [
			'php',
			'git',
			'apps_texteditor',
			'apps_texteditor_for_dir'
		];
		for(var idx in fileInputs){
			if( px.getPlatform()=='win' ){
				$tpl.find('[name='+fileInputs[idx]+'__file]')
					.bind('change', function(){
						var val = $(this).val();if(!val){return;}
						var name = $(this).attr('name');
						name = name.replace(new RegExp('__file$'), '');
						$tpl.find('[name='+name+']').val( val );
					})
					.hide()
				;
				$tpl.find('.'+fileInputs[idx]+'__file').click(function(){
					var name = $(this).attr('class');
					$('[name='+name+']').click();
				});
			}else{
				// Macでは上手く動かなかった。 → ボタン削除
				$tpl.find('[name='+fileInputs[idx]+'__file]').remove();
				$tpl.find('.'+fileInputs[idx]+'__file').remove();
			}
		}

		px.dialog({
			title: 'Pickles 2 Desktop Tool 設定' ,
			body: $tpl ,
			buttons: [
				$('<button>')
					.text('OK')
					.addClass('btn')
					.addClass('btn-primary')
					.click(function(){
						px.getDb().commands.php = $tpl.find('[name=php]').val();
						px.getDb().commands.git = $tpl.find('[name=git]').val();
						px.getDb().network.preview.port = $tpl.find('[name=network_preview_port]').val();
						px.getDb().network.appserver.port = $tpl.find('[name=network_appserver_port]').val();
						px.getDb().apps.texteditor = $tpl.find('[name=apps_texteditor]').val();
						px.getDb().apps.texteditorForDir = $tpl.find('[name=apps_texteditor_for_dir]').val();
						px.closeDialog();
					}
				) ,
				$('<button>')
					.text('Cancel')
					.addClass('btn')
					.addClass('btn-default')
					.click(function(){
						px.closeDialog();
					})
			]
		});
	}

})(px, jQuery, window);
