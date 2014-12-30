(function(px, $, window){

	px.editPx2DTConfig = function(){
		var $tpl = $( $('#template-editPx2DTConfig').html() );
		$tpl.find('[name=php]').val( px.getDb().commands.php );
		px.dialog({
			title: 'Pickles 2 Desktop Tool 設定' ,
			body: $tpl ,
			buttons: [
				$('<button>').text('OK').click(function(){
					px.getDb().commands.php = $tpl.find('[name=php]').val();
					px.closeDialog();
				})
			]
		});
	}

})(px, jQuery, window);