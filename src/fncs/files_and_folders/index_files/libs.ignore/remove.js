/**
 * Files and Folders: remove.js
 */
module.exports = function(contApp, main, _pj, $){
	this.remove = function(target_item, callback){
		var is_file;
		var pageInfoAll;
		var pxExternalPath;
		var pathType;
		main.it79.fnc({}, [
			function(it1){
				contApp.parsePx2FilePath(target_item, function(_pxExternalPath, _pathType){
					pxExternalPath = _pxExternalPath;
					pathType = _pathType;
					it1.next();
				});
			},
			function(it1){
				is_file = main.utils79.is_file( _pj.get('path')+target_item );
				it1.next();
			},
			function(it1){
				if(!is_file || pathType !== 'contents'){
					it1.next();
					return;
				}
				_pj.execPx2(
					pxExternalPath+'?PX=px2dthelper.get.all',
					{
						complete: function(resources){
							try{
								resources = JSON.parse(resources);
							}catch(e){
								console.error('Failed to parse JSON "pageInfoAll".', e);
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
				if(is_file && pathType == 'contents'){
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

							main.it79.fnc({}, [
								function(it2){
									if( is_file && pathType == 'contents' && $body.find('[name=is_remove_files_too]:checked').val() ){
										// --------------------------------------
										// リソースも一緒に削除する
										var realpath_files = pageInfoAll.realpath_files;
										if(main.utils79.is_dir(realpath_files)){
											main.fsEx.removeSync( realpath_files );
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
