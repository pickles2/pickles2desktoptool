/**
 * Files and Folders: mkdir.js
 */
module.exports = function(contApp, px, _pj, $){
	this.mkdir = function(current_dir, callback){
		var $body = $('<div>').html( $('#template-mkdir').html() );
		$body.find('.cont_current_dir').text(current_dir);
		$body.find('[name=dirname]').on('change keyup', function(){
			var dirname = $body.find('[name=dirname]').val();
			if( dirname.match(/\.html?$/i) ){
				$body.find('.cont_html_ext_option').show();
			}else{
				$body.find('.cont_html_ext_option').hide();
			}
		});
		px2style.modal({
			'title': 'Create new Directory',
			'body': $body,
			'buttons': [
				$('<button type="button" class="px2-btn">')
					.text('Cancel')
					.on('click', function(e){
						px2style.closeModal();
					}),
				$('<button class="px2-btn px2-btn--primary">')
					.text('OK')
			],
			'form': {
				'submit': function(){
					px2style.closeModal();
					var dirname = $body.find('[name=dirname]').val();
					if( !dirname ){ return; }

					callback( dirname );
				}
			},
			'width': 460
		}, function(){
			$body.find('[name=dirname]').focus();
		});
	}
}
