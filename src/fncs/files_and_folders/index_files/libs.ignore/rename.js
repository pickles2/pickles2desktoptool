/**
 * Files and Folders: rename.js
 */
module.exports = function(contApp, px, _pj, $){
	this.rename = function(renameFrom, callback){
		var is_file;
		var pageInfoAllFrom;
		var pxExternalPathFrom;
		var pxExternalPathTo;
		px.it79.fnc({}, [
			function(it1){
				contApp.parsePx2FilePath(renameFrom, function(_pxExternalPath, _path_type){
					pxExternalPathFrom = _pxExternalPath;
					it1.next();
				});
			},
			function(it1){
				is_file = px.utils79.is_file( _pj.get('path')+renameFrom );
				it1.next();
			},
			function(it1){
				if(!is_file){
					it1.next();
					return;
				}
				_pj.execPx2(
					pxExternalPathFrom+'?PX=px2dthelper.get.all',
					{
						complete: function(resources){
							try{
								resources = JSON.parse(resources);
							}catch(e){
								console.error('Failed to parse JSON "client_resources".', e);
							}
							console.log(resources);
							pageInfoAllFrom = resources;
							it1.next();
						}
					}
				);

			},
			function(it1){
				var $body = $('<div>').html( $('#template-rename').html() );
				$body.find('.cont_target_item').text(renameFrom);
				$body.find('[name=rename_to]').val(renameFrom);
				if(is_file){
					$body.find('.cont_contents_option').show();
				}
				px2style.modal({
					'title': 'Rename',
					'body': $body,
					'buttons': [
						$('<button type="button" class="px2-btn">')
							.text('Cancel')
							.on('click', function(e){
								px2style.closeModal();
							}),
						$('<button class="px2-btn px2-btn--primary">')
							.text('移動する')
					],
					'form': {
						'submit': function(){
							px2style.closeModal();
							var renameTo = $body.find('[name=rename_to]').val();
							if( !renameTo ){ return; }
							if( renameTo == renameFrom ){ return; }

							px.it79.fnc({}, [
								function(it1){
									contApp.parsePx2FilePath(renameTo, function(_pxExternalPath, _path_type){
										pxExternalPathTo = _pxExternalPath;
										it1.next();
									});
								},
								function(it2){
									if( is_file && $body.find('[name=is_rename_files_too]:checked').val() ){
										// リソースも一緒に移動する
										_pj.execPx2(
											pxExternalPathTo+'?PX=px2dthelper.get.all',
											{
												complete: function(pageInfoAllTo){
													try{
														pageInfoAllTo = JSON.parse(pageInfoAllTo);
													}catch(e){
														console.error('Failed to parse JSON "client_resources".', e);
													}
													// console.log(pageInfoAllTo);

													var realpath_files_from = pageInfoAllFrom.realpath_files;
													var realpath_files_to = pageInfoAllTo.realpath_files;
													if(px.utils79.is_dir(realpath_files_from)){
														px.fsEx.renameSync( realpath_files_from, realpath_files_to );
													}
													it2.next();
												}
											}
										);
										return;
									}
									it2.next();
								},
								function(it2){
									callback(renameFrom, renameTo);
									it2.next();
								}
							]);

						}
					},
					'width': 460
				}, function(){
					$body.find('[name=rename_to]').focus();
				});
				it1.next();
			}
		]);
	}
}
