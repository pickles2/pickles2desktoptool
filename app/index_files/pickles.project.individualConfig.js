module.exports = function( main, pj, callbackOnFinished ) {
	callbackOnFinished = callbackOnFinished || function(){}
	var $ = main.$;
	var it79 = main.it79;

	var $form = $( $('#template-editProjectIndividualConfig').html() );
	var px2dtLDA_pj = main.px2dtLDA.project(pj.projectId);
	var gitMainRemoteName = '';

	it79.fnc({}, [
		function(it1){
			// ローディング表示
			main.px2style.loading();
			it1.next();
		},
		function(it1){
			// 初期値をセットする

			$form.find('[name=pj_name]').val(px2dtLDA_pj.getName());
			// $form.find('[name=pj_path]').val(pj.get('path'));//←セットできない！
			$form.find('[name=pj_home_dir]').val(px2dtLDA_pj.get().home_dir);
			$form.find('[name=pj_entry_script]').val(px2dtLDA_pj.getEntryScript());
			$form.find('[name=pj_external_preview_server_origin]').val(px2dtLDA_pj.getExtendedData('external_preview_server_origin'));
			$form.find('[name=pj_external_app_server_origin]').val(px2dtLDA_pj.getExtendedData('external_app_server_origin'));

			it1.next();
		},
		function(it1){
			// Git Remote の初期値をセットする
			if( !pj.status().gitDirExists ){
				// `git init` されていない場合は、入力欄を disabled にする。
				$form.find('[name=pj_git_remote_url]').val('').attr({"disabled":true});
				it1.next();
				return;
			}
			pj.git().parser.git(['remote', '-v'], function(result){
				console.log('$ git remote -v;', result);
				var remoteUrl = '';
				try {
					// まずは `origin` を探す
					for( var idx = 0; idx < result.remotes.length; idx ++ ){
						remoteUrl = result.remotes[idx].fetch;
						gitMainRemoteName = result.remotes[idx].name;
						if( result.remotes[idx].name == 'origin' ){
							break;
						}
					}
					if( !remoteUrl ){
						// `origin` が見つかっていなければ、最初のリモートを採用
						for( var idx = 0; idx < result.remotes.length; idx ++ ){
							remoteUrl = result.remotes[idx].fetch;
							gitMainRemoteName = result.remotes[idx].name;
							break;
						}
					}
				} catch(e){
					console.error(e);
				}
				$form.find('[name=pj_git_remote_url]').val(remoteUrl);
				it1.next();
			});

		},
		function(it1){
			// エラーメッセージの初期化

			$form.find('.error_name').html('');
			$form.find('.error_path').html('');
			$form.find('.error_home_dir').html('');
			$form.find('.error_entry_script').html('');
			$form.find('.error_external_preview_server_origin').html('');
			$form.find('.error_external_app_server_origin').html('');
			$form.find('.error_git_remote_url').html('');

			it1.next();
		},
		function(it1){
			// ダイアログを開く
			var modalObj;
			main.px2style.modal( {
				"title": 'プロジェクト個人設定を編集',
				"body": $form ,
				"buttons": [
					$('<button>')
						.text('OK')
						.addClass('px2-btn')
						.addClass('px2-btn--primary')
						.on('click', function(){
							main.px2style.loading();
							modalObj.lock();
							setTimeout(function(){
								save( function(){
									modalObj.unlock();
									main.px2style.closeModal();
									main.message('プロジェクト情報を更新しました。');
									main.px2style.closeLoading();
								} );
							}, 200);
							return;
						} )
				],
				"buttonsSecondary": [
					$('<button>')
						.text(main.lb.get('ui_label.cancel'))
						.addClass('px2-btn')
						.on('click', function(){
							main.px2style.closeModal();
						} ) ,
				],
				"onclose": function(){
					callbackOnFinished();
				}
			}, function(_modalObj){
				modalObj = _modalObj;
			} );
			it1.next();
		},
		function(it1){
			// ローディング終了
			main.px2style.closeLoading();
			it1.next();
		}
	]);

	function save( callback ){
		callback = callback || function(){};

		it79.fnc({}, [
			function(it1){
				$form.find('.error_name').html('');
				$form.find('.error_path').html('');
				$form.find('.error_home_dir').html('');
				$form.find('.error_entry_script').html('');
				$form.find('.error_external_preview_server_origin').html('');
				$form.find('.error_external_app_server_origin').html('');

				var projectInfo = px2dtLDA_pj.get();

				var newProjectInfo = JSON.parse( JSON.stringify( projectInfo ) );

				newProjectInfo.name = $form.find('[name=pj_name]').val();
				var tmpPath = $form.find('[name=pj_path]').val();
				if( typeof(tmpPath) == typeof('') && tmpPath.length ){
					newProjectInfo.path = tmpPath;//指定があったら上書き
				}
				newProjectInfo.home_dir = $form.find('[name=pj_home_dir]').val()
				newProjectInfo.entry_script = $form.find('[name=pj_entry_script]').val()
				newProjectInfo.external_preview_server_origin = $form.find('[name=pj_external_preview_server_origin]').val();
				newProjectInfo.external_app_server_origin = $form.find('[name=pj_external_app_server_origin]').val();

				var result = main.validateProjectInfo(newProjectInfo);
				if( result.isError ){
					alert('エラー: 入力不備があります。');
					for( var fieldName in result.errorMsg ){
						$form.find('.error_'+fieldName).html('').append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">Error:</span> '+result.errorMsg[fieldName]+'</div>');
					}
					return false;
				}

				px2dtLDA_pj.setName(newProjectInfo.name);
				if( tmpPath.length ){
					px2dtLDA_pj.setPath(newProjectInfo.path);
				}
				projectInfo.home_dir = newProjectInfo.home_dir;
				px2dtLDA_pj.setEntryScript(newProjectInfo.entry_script);
				px2dtLDA_pj.setExtendedData('external_preview_server_origin', (newProjectInfo.external_preview_server_origin || undefined));
				px2dtLDA_pj.setExtendedData('external_app_server_origin', (newProjectInfo.external_app_server_origin || undefined));

				it1.next();
			},
			function(it1){
				// db.json に保存する
				main.save(function(){
					it1.next();
				});
			},
			function(it1){
				// git remote を保存する
				if( !pj.status().gitDirExists ){
					// `git init` されていない場合はスキップする。
					it1.next();
					return;
				}
				var git_remote_url = $form.find('[name=pj_git_remote_url]').val();
				// alert(gitMainRemoteName);
				// alert(git_remote_url);
				if( gitMainRemoteName && git_remote_url ){
					// リモート名とURLが分かる場合
					pj.git().parser.git(['remote', 'set-url', gitMainRemoteName, git_remote_url], function(result){
						console.log('$ git remote set-url '+gitMainRemoteName+' '+git_remote_url+';', result);
						it1.next();
					});
					return;
				}else if( git_remote_url ){
					// URLが入力されているが、リモート名がわからない場合
					pj.git().parser.git(['remote', 'add', 'origin', git_remote_url], function(result){
						console.log('$ git remote add '+'origin'+' '+git_remote_url+';', result);
						it1.next();
					});
					return;
				}else if( gitMainRemoteName ){
					// リモート名は分かるが、URLが入力されていない場合
					pj.git().parser.git(['remote', 'rm', gitMainRemoteName], function(result){
						console.log('$ git remote rm '+gitMainRemoteName+';', result);
						it1.next();
					});
					return;
				}else{
					it1.next();
					return;
				}
			},
			function(it1){
				callback();
				it1.next();
			}
		]);
	}
};
