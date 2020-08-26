/**
 * Files and Folders: copy.js
 */
module.exports = function(contApp, px, _pj, $){
	this.copy = function(copyFrom, callback){
		var is_file;
		var pageInfoAll;
		var pxExternalPathFrom;
		var pxExternalPathTo;
		var pathTypeFrom;
		var pathTypeTo;
		px.it79.fnc({}, [
			function(it1){
				contApp.parsePx2FilePath(copyFrom, function(_pxExternalPath, _pathType){
					pxExternalPathFrom = _pxExternalPath;
					pathTypeFrom = _pathType;
					it1.next();
				});
			},
			function(it1){
				is_file = px.utils79.is_file( _pj.get('path')+copyFrom );
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
							// console.log(resources);
							pageInfoAll = resources;
							it1.next();
						}
					}
				);

			},
			function(it1){
				var $body = $('<div>').html( $('#template-copy').html() );
				$body.find('.cont_target_item').text(copyFrom);
				$body.find('[name=copy_to]').val(copyFrom);
				if(pathTypeFrom == 'contents' && is_file){
					$body.find('.cont_contents_option').show();
				}
				px2style.modal({
					'title': 'Copy',
					'body': $body,
					'buttons': [
						$('<button type="button" class="px2-btn">')
							.text('Cancel')
							.on('click', function(e){
								px2style.closeModal();
							}),
						$('<button class="px2-btn px2-btn--primary">')
							.text('複製する')
					],
					'form': {
						'submit': function(){
							px2style.closeModal();
							var copyTo = $body.find('[name=copy_to]').val();
							if( !copyTo ){ return; }
							if( copyTo == copyFrom ){ return; }

							px.it79.fnc({}, [
								function(it1){
									contApp.parsePx2FilePath(copyTo, function(_pxExternalPath, _pathType){
										pxExternalPathTo = _pxExternalPath;
										pathTypeTo = _pathType;
										it1.next();
									});
								},
								function(it2){
									if( pathTypeFrom == 'contents' && pathTypeTo == 'contents' && is_file && $body.find('[name=is_copy_files_too]:checked').val() ){
										// --------------------------------------
										// リソースも一緒に複製する
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

													var realpath_files_from = pageInfoAll.realpath_files;
													var realpath_files_to = pageInfoAllTo.realpath_files;
													if(px.utils79.is_dir(realpath_files_from)){
														px.fsEx.copySync( realpath_files_from, realpath_files_to );
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
									callback(copyFrom, copyTo);
									it2.next();
								}
							]);

						}
					},
					'width': 460
				}, function(){
					$body.find('[name=copy_to]').focus();
				});
				it1.next();
			}
		]);
	}
}
