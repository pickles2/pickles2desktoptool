/**
 * Files and Folders: remove.js
 */
module.exports = function(contApp, px, _pj, $){
	this.remove = function(target_item, callback){
		var is_file;
		var pageInfoAll;
		px.it79.fnc({}, [
			function(it1){
				is_file = px.utils79.is_file( _pj.get('path')+target_item );
				it1.next();
			},
			function(it1){
				if(!is_file){
					it1.next();
					return;
				}
				_pj.execPx2(
					target_item+'?PX=px2dthelper.get.all',
					{
						complete: function(resources){
							try{
								resources = JSON.parse(resources);
							}catch(e){
								console.error('Failed to parse JSON "client_resources".', e);
							}
							console.log(resources);
							pageInfoAll = resources;
							it1.next();
						}
					}
				);

			},
			function(it1){
				var $body = $('<div>').html( $('#template-remove').html() );
				$body.find('.cont_target_item').text(target_item);
				if(is_file){
					$body.find('.cont_contents_option').show();
				}
				px2style.modal({
					'title': 'Remove',
					'body': $body,
					'buttons': [
						$('<button type="button" class="px2-btn">')
							.text('Cancel')
							.on('click', function(e){
								px2style.closeModal();
							}),
						$('<button class="px2-btn px2-btn--danger">')
							.text('削除する')
					],
					'form': {
						'submit': function(){
							px2style.closeModal();

							px.it79.fnc({}, [
								function(it2){
									if( is_file && $body.find('[name=is_remove_files_too]:checked').val() ){
										// リソースも一緒に削除する
										var realpath_files = pageInfoAll.realpath_files;
										if(px.utils79.is_dir(realpath_files)){
											px.fsEx.removeSync( realpath_files );
										}
									}
									it2.next();
								},
								function(it2){
									callback();
									it2.next();
								}
							]);

						}
					},
					'width': 460
				}, function(){
				});
				it1.next();
			}
		]);
	}
}
