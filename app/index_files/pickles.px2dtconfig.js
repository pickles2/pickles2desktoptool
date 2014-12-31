(function(px, $, window){

	px.editPx2DTConfig = function(){
		var $tpl = $( $('#template-editPx2DTConfig').html() );

		if( !px.getDb().network ){ px.getDb().network = {}; }
		if( !px.getDb().network.preview ){ px.getDb().network.preview = {}; }
		if( !px.getDb().network.preview.port ){ px.getDb().network.preview.port = null; }

		$tpl.find('[name=php]').val( px.getDb().commands.php );
		$tpl.find('[name=network_preview_port]').val( px.getDb().network.preview.port );

		px.dialog({
			title: 'Pickles 2 Desktop Tool 設定' ,
			body: $tpl ,
			buttons: [
				$('<button>').text('OK').click(function(){
					px.getDb().commands.php = $tpl.find('[name=php]').val();
					px.getDb().network.preview.port = $tpl.find('[name=network_preview_port]').val();
					px.closeDialog();
				})
			]
		});
	}

})(px, jQuery, window);