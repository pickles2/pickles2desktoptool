window.px = window.parent.px;
window.contApp = new (function(){
	var _this = this;
	var pj = px.getCurrentProject();
	this.pj = pj;
	var status = pj.status();

	/**
	 * installer collection
	 */
	this.installer = {};

	/**
	 * initialize
	 */
	function init(){
		var px2dtLDA_pj = px.px2dtLDA.project(pj.projectId);

		px.utils.iterateFnc([
			function(it, arg){
				$('.tpl_name').text( pj.get('name') );
				$('.tpl_path').text( pj.get('path') );
				$('.tpl_home_dir').text( pj.get('home_dir') );
				$('.tpl_entry_script').text( pj.get('entry_script') );
				$('.tpl_external_preview_server_origin').text( px2dtLDA_pj.getExtendedData('external_preview_server_origin')||'' );
				$('address.center').text( px.packageJson.pickles2.credit );
				it.next(arg);
			} ,
			function(it, arg){
				var statusTable = px.utils.bindEjs( $('#template-status-table').html(), {'status': status} );
				$('.tpl_status_table').html( statusTable );
				it.next(arg);
			} ,
			function(it, arg){
				var $mainTaskUi = $('.cont_maintask_ui');

				if( !status.pathExists ){
					// パスの選択しなおし
					$mainTaskUi
						.html( $('#template-reselectProject-path').html() )
						.find('form')
							.on('submit', function(){
								_this.selectProjectPath( $(this).find('[name=pj_path]').val() );
								return false;
							})
					;
				}else if( status.pathContainsFileCount && !status.entryScriptExists ){
					// EntryScript が存在しない。
					$mainTaskUi
						.html( $('#template-reselectProject-entryScript').html() )
						.find('form')
							.on('submit', function(){
								_this.editProject();
								return false;
							})
					;
				}else if( status.pathExists && !status.composerJsonExists && status.pathContainsFileCount ){
					// ディレクトリが空ではないためセットアップできない画面
					$mainTaskUi
						.html( $('#template-is-not-empty-dir').html() )
						.find('form')
							.on('submit', function(){
								_this.selectProjectPath( $(this).find('[name=pj_path]').val() );
								return false;
							})
					;
				}else if( status.pathExists && !status.composerJsonExists ){
					// インストールボタン
					$mainTaskUi
						.html( $('#template-install-pickles2').html() )
						.find('form')
							.on('submit', function(){
								install(this);
								return false;
							})
					;
				}else if( status.pathExists && !status.vendorDirExists ){
					// `composer install` ボタン
					$mainTaskUi
						.html( $('#template-install-composer').html() )
					;
				}else if( !status.isPxStandby || !status.pathExists || !status.confFileExists ){
					// 何らかのエラーがある可能性があります
					$mainTaskUi
						.html( $('#template-conf-not-exists').html() )
					;
				}else{
					// ちゃんとインストールできてます
					$mainTaskUi
						.html( $('#template-standby').html() )
					;
				}

				var errors = pj.getErrors();
				if( errors.length ){
					var $errors = $('<div class="selectable">');
					for( var idx in errors ){
						$errors.append( $('<pre>').append( $('<code>').text( errors[idx].message ) ) );
					}
					$mainTaskUi.append( $errors );
				}

				it.next(arg);
				return;
			} ,
			function(it, arg){
				var hint = px.hint.getRandom();
				// console.log(hint);
				$('.cont_hint').html( hint );
				it.next(arg);
			} ,
			function(it, arg){
				if( !status.isPxStandby || !status.pathExists || !status.composerJsonExists || !status.vendorDirExists || !status.confFileExists ){
					// セットアップが不十分な場合は、 composer update をチェックしない。
					it.next(arg);
					return;
				}
				px.composerInstallChecker.getStatus(pj, function(checked){
					// console.log('composerInstallChecker.check() done.', checked.status);
					if( checked.status == 'update_found' ){
						$('.cont_info').append( $('<div class="alert alert-info">')
							.append( $('<span>').text('composer パッケージのいくつかに、更新が見つかりました。') )
							.append( $('<a href="javascript:px.subapp(\'fncs/composer/index.html\');">').text('composer install を実行してください') )
							.append( $('<span>').text('。') )
						);
					}
					it.next(arg);
				});
			} ,
			function(it, arg){
				// README.md を表示する
				var readmePath = pj.get('path');
				if( status.gitDirExists ){
					readmePath = pj.get_realpath_git_root();
				}
				var htmlSrc = '<p class="cont_readme_content-no_readme">--- NO README.md ---</p>';
				if( px.utils.isDirectory(readmePath) ){
					var filenames = ['README.md','readme.md','README.html','readme.html','README.txt','readme.txt'];
					for( var idx in filenames ){
						if( px.utils.isFile(readmePath+'/'+filenames[idx]) ){
							var ext = px.utils.getExtension(filenames[idx]);
							switch(ext){
								case 'md':
									htmlSrc = px.fs.readFileSync( readmePath+'/'+filenames[idx] );
									htmlSrc = htmlSrc.toString();
									htmlSrc = px.utils.markdown(htmlSrc);
									break;
								case 'html':
									htmlSrc = px.fs.readFileSync( readmePath+'/'+filenames[idx] );
									htmlSrc = htmlSrc.toString();
									break;
								case 'txt':
								default:
									htmlSrc = px.fs.readFileSync( readmePath+'/'+filenames[idx] );
									htmlSrc = htmlSrc.toString();
									htmlSrc = $('<div>').text(htmlSrc).html();
									htmlSrc = htmlSrc.replace(/\r\n|\r|\n/g, '<br />');
									break;
							}
							break;
						}
					}
				}

				$('.cont_readme_content')
					.html('')
					.append( htmlSrc )
					.find('a').each(function(){
						$(this).on('click', function(){
							px.utils.openURL( $(this).attr('href') );
							return false;
						});
					})
				;

				it.next(arg);
			}
		]).start({});

	}// init()

	/**
	 * パスの選び直し
	 */
	this.selectProjectPath = function(path){
		var validatePjInfo = {path: path};
		var result = px.validateProjectInfo(validatePjInfo);
		if( result.errorMsg.path ){
			console.error(result.errorMsg.path);
			alert(result.errorMsg.path);
			return false;
		}

		var pj = px.getCurrentProject();
		pj.projectInfo.path = path;
		if( !px.updateProject(pj.projectId, pj.projectInfo) ){
			var msg = 'ERROR: FAILED to update project info.';
			console.error(msg);
			alert(msg);
			return false;
		}
		px.save(function(){
			px.subapp();
		});
		return true;
	}

	/**
	 * Pickles2 クリーンインストール
	 */
	function install(form){
		var btn = $(form).find('button');
		$(btn).attr('disabled','disabled');

		var method = $(form).find('input[name=setup_method]:checked').val();
		var param = {};
		switch(method){
			case 'git':
				param.repositoryUrl = $(form).find('input[name=git_url_repository]').val();
				break;
		}

		_this.installer[method].install( pj, param, {
			complete: function(){
				$(btn).removeAttr('disabled');
				var currentPjId = pj.projectId;
				px.deselectProject();
				px.selectProject( currentPjId, function(){
					px.subapp();
				} );
			}
		} );
	}

	/**
	 * プロジェクトを編集する
	 */
	this.editProject = function(){
		var $form = $( $('#template-form-editProject').html() );
		var px2dtLDA_pj = px.px2dtLDA.project(pj.projectId);
		$form.find('[name=pj_name]').val(px2dtLDA_pj.getName());
		// $form.find('[name=pj_path]').val(pj.get('path'));//←セットできない！
		$form.find('[name=pj_home_dir]').val(px2dtLDA_pj.get().home_dir);
		$form.find('[name=pj_entry_script]').val(px2dtLDA_pj.getEntryScript());
		$form.find('[name=pj_external_preview_server_origin]').val(px2dtLDA_pj.getExtendedData('external_preview_server_origin'));

		$form.find('.error_name').html('');
		$form.find('.error_path').html('');
		$form.find('.error_home_dir').html('');
		$form.find('.error_entry_script').html('');
		$form.find('.error_external_preview_server_origin').html('');

		px.dialog( {
			title: 'プロジェクト情報を編集',
			body: $form ,
			buttons: [
				$('<button>')
					.text('OK')
					.addClass('px2-btn--primary')
					.on('click', function(){
						$form.find('.error_name').html('');
						$form.find('.error_path').html('');
						$form.find('.error_home_dir').html('');
						$form.find('.error_entry_script').html('');
						$form.find('.error_external_preview_server_origin').html('');

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

						var result = px.validateProjectInfo(newProjectInfo);
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

						px.save(function(){
							px.closeDialog();
							px.message('プロジェクト情報を更新しました。');
							px.subapp();
						});
					} ) ,
				$('<button>')
					.text('Cancel')
					.on('click', function(){
						px.closeDialog();
					} )
			]
		} );
	}

	/**
	 * イベント
	 */
	$(function(){
		init();
	});

})();
