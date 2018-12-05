/**
 * Files and Folders: mkfile.js
 */
module.exports = function(contApp, px, _pj, $){
	this.mkfile = function(current_dir, callback){
		var $body = $('<div>').html( $('#template-mkfile').html() );
		$body.find('.cont_current_dir').text(current_dir);
		$body.find('[name=filename]').on('change keyup', function(){
			var filename = $body.find('[name=filename]').val();
			if( filename.match(/\.html?$/i) ){
				$body.find('.cont_html_ext_option').show();
			}else{
				$body.find('.cont_html_ext_option').hide();
			}
		});
		px2style.modal({
			'title': 'Create new File',
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
					var filename = $body.find('[name=filename]').val();
					if( !filename ){ return; }
					var pageInfoAll;

					px.it79.fnc({}, [
						function(it1){
							_pj.execPx2(
								current_dir+filename+'?PX=px2dthelper.get.all',
								{
									complete: function(resources){
										try{
											resources = JSON.parse(resources);
										}catch(e){
											console.error('Failed to parse JSON "client_resources".', e);
										}
										// console.log(resources);
										pageInfoAll = resources;
										it1.next();
									}
								}
							);

						},
						function(it1){
							if( filename.match(/\.html?$/i) && $body.find('[name=is_guieditor]:checked').val() ){
								// GUI編集モードが有効
								var realpath_data_dir = pageInfoAll.realpath_data_dir;
								px.fsEx.mkdirpSync( realpath_data_dir );
								px.fs.writeFileSync( realpath_data_dir+'data.json', '{}' );
							}
							it1.next();
						},
						function(it1){
							callback( filename );
							it1.next();
						}
					]);

				}
			},
			'width': 460
		}, function(){
			$body.find('[name=filename]').focus();
		});
	}
}
