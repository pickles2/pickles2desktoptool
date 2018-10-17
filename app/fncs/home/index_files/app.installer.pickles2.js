window.contApp.installer.pickles2 = new (function( px, contApp ){
	var _this = this;
	this.pj = false;

	/**
	 * インストールを実行
	 */
	this.install = function( pj, param, opt ){
		_this.pj = pj;
		setup_composer_create_project_dialog(param, opt);
		return this;
	}

	/**
	 * composer create-project を実行するダイアログを表示する
	 */
	function setup_composer_create_project_dialog(param, opt){
		var realpath = _this.pj.get('path');
		if( px.utils.isFile( realpath+'/.DS_Store' ) ){
			px.fs.unlinkSync( realpath+'/.DS_Store' );
		}
		if( px.utils.isFile( realpath+'/Thumbs.db' ) ){
			px.fs.unlinkSync( realpath+'/Thumbs.db' );
		}
		var $msg = $('<div>');

		var $preCont = $('<div>');
		var $pre = $('<pre>')
			.css({
				'height':'12em',
				'overflow':'auto'
			})
			.append( $preCont
				.addClass('selectable')
				.text('実行中...')
			)
		;
		var dlgOpt = {
			'title': 'Pickles 2 プロジェクトのセットアップ',
			'body': $('<div>')
				.append( $msg.text('Pickles 2 プロジェクトをセットアップしています。この処理はしばらく時間がかかります。') )
				.append( $pre ),
			'buttons': [
				$('<button>')
					.text('セットアップしています...')
					.attr({'disabled':'disabled'})
			]
		};
		px.dialog( dlgOpt );


		var stdout = '';
		px.commandQueue.client.addQueueItem(
			[
				'composer',
				'create-project',
				'--no-interaction',
				'pickles2/preset-get-start-pickles2',
				'./',
				'2.0.*'
			],
			{
				'cdName': 'default', // この時点で composer.json は存在しないので、ルートディレクトリは `composer` ではなく `default`。
				'tags': [
					'pj-'+_this.pj.get('id'),
					'composer-create-project'
				],
				'accept': function(queueId){
					// console.log(queueId);
				},
				'open': function(message){
				},
				'stdout': function(message){
					for(var idx in message.data){
						stdout += message.data[idx];
					}
					$preCont.text(stdout);
				},
				'stderr': function(message){
					for(var idx in message.data){
						stdout += message.data[idx];
					}
					$preCont.text(stdout);
				},
				'close': function(message){
					if( message.data !== 0 ){
						$msg.text('セットアップが正常に完了できませんでした。もう一度お試しください。');
						dlgOpt.buttons[0]
							.text('閉じる')
							.on('click', function(){
								px.closeDialog();
								opt.complete();
							});
					}else{
						$msg.text('Pickles 2 プロジェクトのセットアップが完了しました。');
						dlgOpt.buttons[0]
							.text('次へ')
							.addClass('px2-btn--primary')
							.on('click', function(){
								px.closeDialog();
								setup_finalize_option_dialog(opt);
							});
					}
					dlgOpt.buttons[0].removeAttr('disabled').focus();
					return;
				}
			}
		);

	}

	/**
	 * セットアップ時のオプション選択ダイアログを表示する
	 */
	function setup_finalize_option_dialog(opt){
		var $body = $('<div>');
		var gitUser = {};

		px.it79.fnc({}, [
			function(it1){
				gitUser.name = '';

				px.utils.spawn(
					px.cmd('git'),
					[
						'config',
						'--global',
						'user.name'
					],
					{
						success: function(msgRow){
							// console.log(msgRow.toString());
							gitUser.name += msgRow.toString();
						},
						error: function(msgRow){
							// console.error(msgRow.toString());
							gitUser.name += msgRow.toString();
						},
						complete: function(quitCode){
							// console.log(quitCode);
							it1.next();
						}
					}
				);
			},
			function(it1){
				gitUser.email = '';

				px.utils.spawn(
					px.cmd('git'),
					[
						'config',
						'--global',
						'user.email'
					],
					{
						success: function(msgRow){
							console.log(msgRow.toString());
							gitUser.email += msgRow.toString();
						},
						error: function(msgRow){
							console.error(msgRow.toString());
							gitUser.email += msgRow.toString();
						},
						complete: function(quitCode){
							console.log(quitCode);
							it1.next();
						}
					}
				);
			},
			function(it1){
				$body.append( $('#template-installer-pickles2-setup-finalize-option').html() );

				var dlgOpt = {
					'title': 'Pickles 2 プロジェクトのセットアップ',
					'body': $body,
					'buttons': [
						$('<button>')
							.text('OK')
							.addClass('px2-btn--primary')
							.on('click', function(e){
								var finalizeOptions = {
									"composer_package_name": $body.find('input[name=options_composer_package_name]').val(),
									"git_init": $body.find('input[name=options_git_init]:checked').val(),
									"git_init_username": $body.find('input[name=options_git_init_username]').val(),
									"git_init_email": $body.find('input[name=options_git_init_email]').val()
								};
								if(finalizeOptions.git_init){
									if( !finalizeOptions.git_init_username ){
										alert('Gitユーザー名が空白です。');
										return;
									}
									if( !finalizeOptions.git_init_email ){
										alert('Gitユーザーのメールアドレスが空白です。');
										return;
									}
								}

								px.closeDialog();
								px.progress.start({"showProgressBar":true, 'blindness':true});

								px.it79.fnc({}, [
									function(it1){
										finalize_composerJson(finalizeOptions, function(result){
											if( !result ){
												alert('composer.json の初期化に失敗しました。');
											}
											it1.next();
										});
									},
									function(it1){
										finalize_readme(function(result){
											if( !result ){
												alert('README.md の初期化に失敗しました。');
											}
											it1.next();
										});
									},
									function(it1){
										if( !finalizeOptions.git_init ){
											// Gitリポジトリの初期化をスキップする場合
											it1.next();
											return;
										}
										finalize_git_init(finalizeOptions, function(result){
											if( !result ){
												alert('Gitの初期化に失敗しました。');
											}
											it1.next();
										});
									},
									function(it1){
										px.progress.close();
										opt.complete();
										it1.next();
									}
								]);
							})
					]
				};
				px.dialog( dlgOpt );

				it1.next();
			},
			function(it1){
				$body.find('input[name=options_git_init_username]').val( px.utils79.trim(gitUser.name) );
				$body.find('input[name=options_git_init_email]').val( px.utils79.trim(gitUser.email) );
				it1.next();
			}
		]);
		return;
	}

	/**
	 * composer.json を初期化する
	 */
	function finalize_composerJson( finalizeOptions, callback ){
		var realpath_composerRoot = _this.pj.get_realpath_composer_root();
		var realpath_composerJson = realpath_composerRoot+'composer.json';
		var composerJson = false;
		(function(){
			try{
				var json = px.fs.readFileSync(realpath_composerJson);
				json = JSON.parse(json);
					// MEMO: 2018-10-01
					// JSON.parse() した時点で、 項目の並び順が変わってしまう。
					// 本当はもとの並び順を維持して書き換えたいところだが、
					// いまのところ、順番を維持してパースする方法が見つかっていない。
				composerJson = json;
			}catch(e){}
		})();
		var pj_name = _this.pj.get('name');

		delete(composerJson.name);
		delete(composerJson.description);
		delete(composerJson.license);
		delete(composerJson.authors);

		if( finalizeOptions.composer_package_name ){
			composerJson.name = finalizeOptions.composer_package_name;
		}
		if( pj_name ){
			composerJson.description = pj_name;
		}

		composerJson.extra = composerJson.extra || {};
		composerJson.extra.px2package = composerJson.extra.px2package || {};
		var px2package = false;
		if( composerJson.extra.px2package.type == 'project' ){
			// px2package が 単体で既定されている場合。
			px2package = composerJson.extra.px2package;
		}else if( composerJson.extra.px2package[0] ){
			// 複数の px2package が 既定されている場合。
			for( var i in composerJson.extra.px2package ){
				if( composerJson.extra.px2package[i].type == 'project' ){
					// 1件目を採用する
					px2package = composerJson.extra.px2package[i];
					break;
				}
			}
		}
		if( px2package === false ){
			// 既定されていなければ定義する。
			composerJson.extra.px2package = {
				'name': '',
				'path': '.px_execute.php',
				'path_homedir': 'px-files/',
				'type': 'project'
			};
			px2package = composerJson.extra.px2package;
		}
		px2package.name = pj_name;

		var newJsonSrc = JSON.stringify(composerJson, null, 4);

		px.fs.writeFile(realpath_composerJson, newJsonSrc, function(err){
			if(err){
				console.error('Failed to write composer.json:', err);
			}
			callback(!err);
		});
		return;
	}

	/**
	 * README.md を初期化する
	 */
	function finalize_readme( callback ){
		var realpath_root = _this.pj.get('path');
		var pj_name = _this.pj.get('name');

		if( !px.utils79.is_dir(realpath_root) ){
			alert('ディレクトリが存在しません。');
			console.error('Failed to write README.md:', 'ディレクトリが存在しません。');
			callback(false);
			return;
		}

		// 既存のREADMEをすべて削除する
		var ls = px.fs.readdirSync(realpath_root);
		for(var idx in ls){
			var tmpFileBaseName = ls[idx];
			if( tmpFileBaseName.match(/^readme\.[\s\S]*$/i) ){
				px.fs.unlinkSync( realpath_root+'/'+tmpFileBaseName );
			}
		}

		var README = '';
		README += '# Project "'+pj_name+'"'+"\n";
		README += "\n";
		README += 'この README は、プロジェクトオーナーによって書き換えられることが望まれています。'+"\n";
		README += 'プロジェクトの共有知識を記述するための場として活用してください。'+"\n";

		px.fs.writeFile(realpath_root+'/README.md', README, function(err){
			if(err){
				console.error('Failed to write README.md:', err);
			}
			callback(!err);
		});
		return;
	}

	/**
	 * Gitリポジトリを初期化する
	 */
	function finalize_git_init( finalizeOptions, callback ){

		function executeCommand(cmdAry, callback){
			var stdout = '';
			var phase = cmdAry.join(' ');
			px.commandQueue.client.addQueueItem(
				cmdAry,
				{
					'cdName': 'default',
					'tags': [
						'pj-'+_this.pj.get('id'),
						'git-init'
					],
					'accept': function(queueId){
						// console.log(queueId);
					},
					'open': function(message){
					},
					'stdout': function(message){
						for(var idx in message.data){
							stdout += message.data[idx];
						}
						// $('.cont_console').text(stdout);
					},
					'stderr': function(message){
						for(var idx in message.data){
							stdout += message.data[idx];
						}
						// $('.cont_console').text(stdout);
					},
					'close': function(message){
						// console.log(stdout);
						if( message.data ){
							alert(phase+' が正常に終了できませんでした。');
						}
						callback();
						return;
					}
				}
			);
			return;
		}

		px.it79.fnc({}, [
			function(it1){
				// git init
				console.log('initialize .git');
				executeCommand([
					'git',
					'init'
				], function(){
					it1.next();
				});
			},
			function(it1){
				// ユーザー名を登録
				console.log('git config --global user.name');
				executeCommand([
					'git',
					'config',
					'--global',
					'user.name',
					finalizeOptions.git_init_username
				], function(){
					it1.next();
				});
			},
			function(it1){
				// メールアドレスを登録
				console.log('git config --global user.email');
				executeCommand([
					'git',
					'config',
					'--global',
					'user.email',
					finalizeOptions.git_init_email
				], function(){
					it1.next();
				});
			},
			function(it1){
				// まずは README.md をコミット 1 - git add
				console.log('Commit README.md');
				executeCommand([
					'git',
					'add',
					'README.md'
				], function(){
					it1.next();
				});
			},
			function(it1){
				// まずは README.md をコミット 2 - git commit
				executeCommand([
					'git',
					'commit',
					'-m',
					'Initial Commit'
				], function(){
					it1.next();
				});
			},
			function(it1){
				// 全部コミット - git add
				console.log('Commit all files');
				executeCommand([
					'git',
					'add',
					'.'
				], function(){
					it1.next();
				});
			},
			function(it1){
				// 一旦プロジェクトをリロード
				console.log('Reload project...');
				px.loadProject(function(){
					console.log('Reloaded.');
					_this.pj = px.getCurrentProject();
					it1.next();
				});
			},
			function(it1){
				// 全部コミット - git add (ignoreされたファイルを追加)
				console.log('Commit ignored files');
				var realpath_base = _this.pj.get('path');

				_this.pj.px2dthelperGetAll('/', {'filter': false}, function(pjInfo){
					// console.log(pjInfo);

					var public_cache_dir = pjInfo.config.public_cache_dir;
					public_cache_dir = public_cache_dir.replace( /^[\/\\]*/, '' );
					public_cache_dir = public_cache_dir.replace( /[\/\\]*$/, '/' );

					var pathPublicCacheDir = require('path').relative(realpath_base, pjInfo.realpath_docroot+'/'+public_cache_dir);
					pathPublicCacheDir = './'+pathPublicCacheDir+'/';

					var pathHomeDir = require('path').relative(realpath_base, pjInfo.realpath_homedir);
					pathHomeDir = './'+pathHomeDir+'/';

					executeCommand([
						'git',
						'add',
						'-f',
						pathPublicCacheDir+'.gitkeep',
						pathHomeDir+'_sys/ram/applock/.gitkeep',
						pathHomeDir+'_sys/ram/caches/.gitkeep',
						pathHomeDir+'_sys/ram/data/.gitkeep',
						pathHomeDir+'_sys/ram/publish/.gitkeep'
					], function(){
						it1.next();
					});
				});

			},
			function(it1){
				// 全部コミット - git commit
				executeCommand([
					'git',
					'commit',
					'-m',
					'add Pickles 2 files, from "Get Start Pickles 2!"'
				], function(){
					it1.next();
				});
			},
			function(it1){
				console.log('Initialize .git: done.');
				callback(true);
				it1.next();
			}
		]);

	}

})( window.px, window.contApp );
