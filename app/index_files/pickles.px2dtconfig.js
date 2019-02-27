(function(px, $, window){
	var $tpl;

	px.editPx2DTConfig = function(){
		$tpl = $( $('#template-editPx2DTConfig').html() );

		if( !px.getDb().commands ){ px.getDb().commands = {}; }

		if( !px.getDb().network ){ px.getDb().network = {}; }
		if( !px.getDb().network.preview ){ px.getDb().network.preview = {}; }
		if( !px.getDb().network.preview.port ){ px.getDb().network.preview.port = null; }
		if( !px.getDb().network.preview.accessRestriction ){ px.getDb().network.preview.port = 'loopback'; }
		if( !px.getDb().network.appserver ){ px.getDb().network.appserver = {}; }
		if( !px.getDb().network.appserver.port ){ px.getDb().network.appserver.port = null; }

		if( !px.getDb().apps ){ px.getDb().apps = {}; }
		if( !px.getDb().apps.texteditor ){ px.getDb().apps.texteditor = null; }
		if( !px.getDb().apps.texteditorForDir ){ px.getDb().apps.texteditorForDir = null; }
		if( !px.getDb().language ){ px.getDb().language = 'ja'; }
		if( !px.getDb().extra.px2dt.checkForUpdate ){ px.getDb().extra.px2dt.checkForUpdate = 'autoCheck'; }

		$tpl.find('[name=php]').val( px.getDb().commands.php );
		$tpl.find('[name=git]').val( px.getDb().commands.git );
		$tpl.find('[name=network_preview_port]').val( px.getDb().network.preview.port ).attr({'placeholder':px.packageJson.pickles2.network.preview.port});
		$tpl.find('[name=network_preview_access_restriction]').val( px.getDb().network.preview.accessRestriction );
		$tpl.find('[name=network_appserver_port]').val( px.getDb().network.appserver.port ).attr({'placeholder':px.packageJson.pickles2.network.appserver.port});
		$tpl.find('[name=apps_texteditor]').val( px.getDb().apps.texteditor );
		$tpl.find('[name=apps_texteditor_for_dir]').val( px.getDb().apps.texteditorForDir );
		$tpl.find('[name=apps_git_client]').val( px.getDb().apps.gitClient );
		$tpl.find('[name=language]').val( px.getDb().language );
		$tpl.find('[name=checkForUpdate]').attr( {"checked": (px.getDb().extra.px2dt.checkForUpdate=='autoCheck' ? 'checked' : null)} );

		// placeholder
		var placeholder = '';
		if( px.getPlatform()=='win' ){
			placeholder = '"C:\\path\\to\\your\\application.exe" $PATH';
		}else if( px.getPlatform()=='mac' ){
			placeholder = 'open $PATH -a "/path/to/your/application.app"';
		}
		$tpl.find('[name=apps_texteditor]').attr({'placeholder': placeholder} );
		$tpl.find('[name=apps_texteditor_for_dir]').attr({'placeholder': placeholder} );
		$tpl.find('[name=apps_git_client]').attr({'placeholder': placeholder} );


		// ファイル選択のインターフェイス
		var fileInputs = [
			'php',
			'git',
			'apps_texteditor',
			'apps_texteditor_for_dir',
			'apps_git_client'
		];
		for(var idx in fileInputs){
			if( px.getPlatform()=='win' ){
				$tpl.find('[name='+fileInputs[idx]+'__file]')
					.bind('change', function(){
						var val = $(this).val();if(!val){return;}
						var name = $(this).attr('name');
						name = name.replace(new RegExp('__file$'), '');
						$tpl.find('[name='+name+']').val( val );
					})
					.hide()
				;
				$tpl.find('.'+fileInputs[idx]+'__file').on('click', function(){
					var name = $(this).attr('class');
					$('[name='+name+']').click();
				});
			}else{
				// Macでは上手く動かなかった。 → ボタン削除
				$tpl.find('[name='+fileInputs[idx]+'__file]').remove();
				$tpl.find('.'+fileInputs[idx]+'__file').remove();
			}
		}

		// --------------------------------------
		// ダイアログを開く
		px.dialog({
			title: px.packageJson.window.title+" "+px.lb.get('menu.desktoptoolConfig') ,
			body: $tpl ,
			buttons: [
				$('<button>')
					.text(px.lb.get('ui_label.cancel'))
					.addClass('px2-btn')
					.on('click', function(){
						px.closeDialog();
					}) ,
				$('<button>')
					.text(px.lb.get('ui_label.ok'))
					.addClass('px2-btn')
					.addClass('px2-btn--primary')
					.on('click', function(){
						px.getDb().commands.php = $tpl.find('[name=php]').val();
						px.getDb().commands.git = $tpl.find('[name=git]').val();
						px.getDb().network.preview.port = $tpl.find('[name=network_preview_port]').val();
						px.getDb().network.preview.accessRestriction = $tpl.find('[name=network_preview_access_restriction]').val();
						px.getDb().network.appserver.port = $tpl.find('[name=network_appserver_port]').val();
						px.getDb().apps.texteditor = $tpl.find('[name=apps_texteditor]').val();
						px.getDb().apps.texteditorForDir = $tpl.find('[name=apps_texteditor_for_dir]').val();
						px.getDb().apps.gitClient = $tpl.find('[name=apps_git_client]').val();
						px.getDb().language = $tpl.find('[name=language]').val();
						px.getDb().extra.px2dt.checkForUpdate = ($tpl.find('[name=checkForUpdate]:checked').val() ? 'autoCheck' : 'none');
						px.save(function(){
							updateGitUserConfig(function(){
								px.closeDialog();
							});
						});
					})
			]
		});

		// コマンドパスの状態更新
		$tpl.find('[name=php]').on('change', function(){ updateCommandPathStatus('php') });
		$tpl.find('[name=git]').on('change', function(){ updateCommandPathStatus('git') });
		updateCommandPathStatus('php');
		updateCommandPathStatus('git');
	}

	/**
	 * コマンドパスの状態更新
	 */
	function updateCommandPathStatus(cmd){
		var cmdPath = $tpl.find('[name='+cmd+']').val();
		if(!cmdPath){ cmdPath = cmd; }
		var $status = $('.'+cmd+'__status');
		$status.html('<p style="height: 6em; text-align: center;">Please wait...</p>');


		px.it79.fnc({}, [
			function(it1){
				var cmdRealPath = '';

				px.utils.spawn(
					( px.getPlatform()=='win' ? 'where' : 'which' ),
					[
						cmdPath
					],
					{
						success: function(msgRow){
							// console.log(msgRow.toString());
							cmdRealPath += msgRow.toString();
						},
						error: function(msgRow){
							// console.error(msgRow.toString());
							cmdRealPath += msgRow.toString();
						},
						complete: function(quitCode){
							// console.log(quitCode);
							// console.log(cmdRealPath);
							if( !cmdRealPath ){
								$status.html('');
								$status.append('<span>コマンドが見つかりません。パスを確認してください。</span>');
								return;
							}
							// $status.append('<span>path</span>');
							// $status.append($('<pre style="max-width: 100%; overflow: auto;">')
							// 	.html(cmdRealPath)
							// );
							it1.next();
						}
					}
				);

			} ,
			function(it1){
				var varsionString = '';

				px.utils.spawn(
					cmdPath,
					[
						'--version'
					],
					{
						success: function(msgRow){
							console.log(msgRow.toString());
							varsionString += msgRow.toString();
						},
						error: function(msgRow){
							console.error(msgRow.toString());
							varsionString += msgRow.toString();
						},
						complete: function(quitCode){
							// console.log(quitCode);
							$status.html('');
							if( quitCode ){
								$status.append('<span class="error">コマンドが見つかりません。パスを確認してください。</span>');
								return;
							}
							$status.append('<span>version</span>');
							$status.append($('<pre style="max-width: 100%; overflow: auto;">')
								.html(varsionString)
							);
							it1.next();
						}
					}
				);
			} ,
			function(it1){
				if( cmd != 'git' ){
					it1.next();
					return;
				}

				var msg = '';

				px.utils.spawn(
					cmdPath,
					[
						'config',
						'--global',
						'user.name'
					],
					{
						success: function(msgRow){
							// console.log(msgRow.toString());
							msg += msgRow.toString();
						},
						error: function(msgRow){
							// console.error(msgRow.toString());
							msg += msgRow.toString();
						},
						complete: function(quitCode){
							// console.log(quitCode);
							$status.append('<span>user.name (global)</span>');
							$status.append($('<div>')
								.append( $('<input />')
									.attr({
										'type': 'text',
										'name': 'git_config_user_name',
										'placeholder': msg
									})
									.addClass('form-control')
									.val(msg)
								)
							);
							it1.next();
						}
					}
				);
			} ,
			function(it1){
				if( cmd != 'git' ){
					it1.next();
					return;
				}

				var msg = '';

				px.utils.spawn(
					cmdPath,
					[
						'config',
						'--global',
						'user.email'
					],
					{
						success: function(msgRow){
							// console.log(msgRow.toString());
							msg += msgRow.toString();
						},
						error: function(msgRow){
							// console.error(msgRow.toString());
							msg += msgRow.toString();
						},
						complete: function(quitCode){
							// console.log(quitCode);
							$status.append('<span>user.email (global)</span>');
							$status.append($('<div>')
								.append( $('<input />')
									.attr({
										'type': 'text',
										'name': 'git_config_user_email',
										'placeholder': msg
									})
									.addClass('form-control')
									.val(msg)
								)
							);
							it1.next();
						}
					}
				);
			}
		]);

	}

	/**
	 * gitのユーザー情報設定を更新する
	 */
	function updateGitUserConfig(callback){
		callback = callback || function(){};

		var cmdPath = $tpl.find('[name=git]').val();
		if(!cmdPath){ cmdPath = 'git'; }


		px.it79.fnc({}, [
			function(it1){
				var userName = $tpl.find('[name=git_config_user_name]').val();
				if( !userName ){
					it1.next();
					return;
				}

				var msg = '';

				px.utils.spawn(
					cmdPath,
					[
						'config',
						'--global',
						'user.name',
						userName
					],
					{
						success: function(msgRow){
							// console.log(msgRow.toString());
							msg += msgRow.toString();
						},
						error: function(msgRow){
							// console.error(msgRow.toString());
							msg += msgRow.toString();
						},
						complete: function(quitCode){
							// console.log(quitCode);
							console.log(msg);
							it1.next();
						}
					}
				);
			} ,
			function(it1){
				var userEmail = $tpl.find('[name=git_config_user_email]').val();
				if( !userEmail ){
					it1.next();
					return;
				}

				var msg = '';

				px.utils.spawn(
					cmdPath,
					[
						'config',
						'--global',
						'user.email',
						userEmail
					],
					{
						success: function(msgRow){
							// console.log(msgRow.toString());
							msg += msgRow.toString();
						},
						error: function(msgRow){
							// console.error(msgRow.toString());
							msg += msgRow.toString();
						},
						complete: function(quitCode){
							// console.log(quitCode);
							console.log(msg);
							it1.next();
						}
					}
				);
			} ,
			function(it1){
				callback();
			}
		]);
	}

})(px, jQuery, window);
