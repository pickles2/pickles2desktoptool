/**
 * Files and Folders: mkfile.js
 */
module.exports = function(contApp, main, _pj, $){
	this.mkfile = function(current_dir, callback){

		var pxExternalPath_before;
		var pathType_before;
		var pxExternalPath;
		var pathType;

		main.it79.fnc({}, [
			function(it1){
				contApp.parsePx2FilePath(current_dir+'___before.html', function(_pxExternalPath, _pathType){
					// コンテンツディレクトリ内か否かを判定するため、
					// 先んじてダミーのファイル名で属性を調査しておく。
					pxExternalPath_before = _pxExternalPath;
					pathType_before = _pathType;
					it1.next();
				});
			},
			function(it1){
				var $body = $('<div>').html( $('#template-mkfile').html() );
				$body.find('.cont_current_dir').text(current_dir);
				$body.find('[name=filename]').on('change keyup', function(){
					var filename = $body.find('[name=filename]').val();
					if( pathType_before == 'contents' && filename.match(/\.html?$/i) ){
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

							main.it79.fnc({}, [
								function(it2){
									contApp.parsePx2FilePath(current_dir+filename, function(_pxExternalPath, _pathType){
										pxExternalPath = _pxExternalPath;
										pathType = _pathType;
										it2.next();
									});
								},
								function(it2){
									_pj.execPx2(
										pxExternalPath+'?PX=px2dthelper.get.all',
										{
											complete: function(resources){
												try{
													resources = JSON.parse(resources);
												}catch(e){
													console.error('Failed to parse JSON "client_resources".', e);
												}
												pageInfoAll = resources;
												it2.next();
											}
										}
									);

								},
								function(it2){
									if( pathType == 'contents' && filename.match(/\.html?$/i) && $body.find('[name=is_guieditor]:checked').val() ){
										// --------------------------------------
										// GUI編集モードが有効
										var realpath_data_dir = pageInfoAll.realpath_data_dir;
										main.fsEx.mkdirpSync( realpath_data_dir );
										main.fs.writeFileSync( realpath_data_dir+'data.json', '{}' );
									}
									it2.next();
								},
								function(it2){
									callback( filename );
									it2.next();
								}
							]);

						}
					},
					'width': 460
				}, function(){
					$body.find('[name=filename]').focus();
				});
			}
		]);
	}
}
