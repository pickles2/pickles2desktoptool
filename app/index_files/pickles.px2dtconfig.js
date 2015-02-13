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
		$tpl.find('[name=network_preview_port]').val( px.getDb().network.preview.port );
		$tpl.find('[name=network_appserver_port]').val( px.getDb().network.appserver.port );
		$tpl.find('[name=apps_texteditor]').val( px.getDb().apps.texteditor );
		$tpl.find('[name=apps_texteditor_for_dir]').val( px.getDb().apps.texteditorForDir );

		px.dialog({
			title: 'Pickles 2 Desktop Tool 設定' ,
			body: $tpl ,
			buttons: [
				$('<button>').text('OK').click(function(){
					px.getDb().commands.php = $tpl.find('[name=php]').val();
					px.getDb().network.preview.port = $tpl.find('[name=network_preview_port]').val();
					px.getDb().network.appserver.port = $tpl.find('[name=network_appserver_port]').val();
					px.getDb().apps.texteditor = $tpl.find('[name=apps_texteditor]').val();
					px.getDb().apps.texteditorForDir = $tpl.find('[name=apps_texteditor_for_dir]').val();
					px.preview.serverStop(function(){
						px.closeDialog();
					});
				}) ,
				$('<button>').text('Cancel').click(function(){
					px.closeDialog();
				})
			]
		});
	}

})(px, jQuery, window);