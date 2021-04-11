window.px = window.parent.main;
window.main = window.parent.main;
window.contApp = new (function(){
	var _this = this;
	var pj = main.getCurrentProject();
	this.pj = pj;
	var status = pj.status();
	this.gitBar = new(require('./apis.ignore/gitBar.js'))(this, main, $);
	this.wasabiBar = new(require('./apis.ignore/wasabiBar.js'))(this, main, $);

	var templates = {
		'install-pickles2': require('./templates.ignore/install-pickles2.html'),
		'standby': require('./templates.ignore/standby.html'),
		'reselectProject-path': require('./templates.ignore/reselectProject-path.html'),
		'reselectProject-entryScript': require('./templates.ignore/reselectProject-entryScript.html'),
		'installer-pickles2-setup-finalize-option': require('./templates.ignore/installer-pickles2-setup-finalize-option.html'),
		'is-not-empty-dir': require('./templates.ignore/is-not-empty-dir.html'),
		'install-composer': require('./templates.ignore/install-composer.html'),
		'conf-not-exists': require('./templates.ignore/conf-not-exists.html'),
		'status-table': require('./templates.ignore/status-table.html'),
		'wasabi-bar': require('./templates.ignore/wasabi-bar.html')
	};
	this.getTemplate = function(name){
		return templates[name];
	}

	/**
	 * installer collection
	 */
	this.installer = {
		pickles2: new (require('./app.installer.pickles2.ignore.js'))( window.main, this, $ ),
		git: new (require('./app.installer.git.ignore.js'))( window.main, this, $ )
	};

	/**
	 * initialize
	 */
	function init(){
		var px2dtLDA_pj = main.px2dtLDA.project(pj.projectId);

		main.utils.iterateFnc([
			function(it, arg){
				$('.tpl_name').text( pj.get('name') );
				$('.tpl_path').text( pj.get('path') );
				$('.tpl_home_dir').text( pj.get('home_dir') );
				$('.tpl_entry_script').text( pj.get('entry_script') );
				$('.tpl_external_preview_server_origin').text( px2dtLDA_pj.getExtendedData('external_preview_server_origin')||'' );
				$('.tpl_external_app_server_origin').text( px2dtLDA_pj.getExtendedData('external_app_server_origin')||'' );
				$('address').text( main.packageJson.extra.credit );
				it.next(arg);
			} ,
			function(it, arg){
				var statusTable = main.utils.bindEjs( templates['status-table'], {'status': status} );
				$('.tpl_status_table').html( statusTable );
				it.next(arg);
			} ,
			function(it, arg){
				var $mainTaskUi = $('.cont_maintask_ui');

				if( !status.pathExists ){
					// パスの選択しなおし
					$mainTaskUi
						.html( templates['reselectProject-path'] )
						.find('form')
							.on('submit', function(){
								_this.selectProjectPath( $(this).find('[name=pj_path]').val() );
								return false;
							})
					;
				}else if( status.pathContainsFileCount && !status.entryScriptExists ){
					// EntryScript が存在しない。
					$mainTaskUi
						.html( templates['reselectProject-entryScript'] )
					;
				}else if( status.pathExists && !status.composerJsonExists && status.pathContainsFileCount ){
					// ディレクトリが空ではないためセットアップできない画面
					$mainTaskUi
						.html( templates['is-not-empty-dir'] )
						.find('form')
							.on('submit', function(){
								_this.selectProjectPath( $(this).find('[name=pj_path]').val() );
								return false;
							})
					;
				}else if( status.pathExists && !status.composerJsonExists ){
					// インストールボタン
					$mainTaskUi
						.html( templates['install-pickles2'] )
						.find('form')
							.on('submit', function(){
								install(this);
								return false;
							})
					;
				}else if( status.pathExists && !status.vendorDirExists ){
					// `composer install` ボタン
					$mainTaskUi
						.html( templates['install-composer'] )
					;
				}else if( !status.isPxStandby || !status.pathExists || !status.confFileExists ){
					// 何らかのエラーがある可能性があります
					$mainTaskUi
						.html( templates['conf-not-exists'] )
					;
				}else{
					// ちゃんとインストールできてます
					$mainTaskUi
						.html( templates['standby'] )
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
				// --------------------------------------
				// Gitバーを表示する
				var $gitBar = $('.cont-git-bar__body');
				if(!status.gitDirExists){
					$('.cont-git-bar').remove();
					it.next(arg);
					return;
				}
				_this.gitBar.init( $gitBar, function(){
					it.next(arg);
				} );
			} ,
			function(it, arg){
				// --------------------------------------
				// WASABIバーを表示する
				var $wasabiBar = $('.cont-wasabi-bar');
				if(!pj.wasabiPjAgent.hasWasabi()){
					$('.cont-wasabi-bar').remove();
					it.next(arg);
					return;
				}
				_this.wasabiBar.init( $wasabiBar, function(){
					it.next(arg);
				} );
			} ,
			function(it, arg){
				// --------------------------------------
				// Hintを表示する
				var hint = main.hint.getRandom();
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
				main.composerInstallChecker.getStatus(pj, function(checked){
					// console.log('composerInstallChecker.check() done.', checked.status);
					if( checked.status == 'update_found' ){
						$('.cont_info').append( $('<div class="alert alert-info">')
							.append( $('<span>').text('composer パッケージのいくつかに、更新が見つかりました。') )
							.append( $('<a href="javascript:main.subapp(\'fncs/composer/index.html\');">').text('composer install を実行してください') )
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
				if( main.utils.isDirectory(readmePath) ){
					var filenames = ['README.md','readme.md','README.html','readme.html','README.txt','readme.txt'];
					for( var idx in filenames ){
						if( main.utils.isFile(readmePath+'/'+filenames[idx]) ){
							var ext = main.utils.getExtension(filenames[idx]);
							switch(ext){
								case 'md':
									htmlSrc = main.fs.readFileSync( readmePath+'/'+filenames[idx] );
									htmlSrc = htmlSrc.toString();
									htmlSrc = main.utils.markdown(htmlSrc);
									break;
								case 'html':
									htmlSrc = main.fs.readFileSync( readmePath+'/'+filenames[idx] );
									htmlSrc = htmlSrc.toString();
									break;
								case 'txt':
								default:
									htmlSrc = main.fs.readFileSync( readmePath+'/'+filenames[idx] );
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
							main.utils.openURL( $(this).attr('href') );
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
		var result = main.validateProjectInfo(validatePjInfo);
		if( result.errorMsg.path ){
			console.error(result.errorMsg.path);
			alert(result.errorMsg.path);
			return false;
		}

		var pj = main.getCurrentProject();
		pj.projectInfo.path = path;
		if( !main.updateProject(pj.projectId, pj.projectInfo) ){
			var msg = 'ERROR: FAILED to update project info.';
			console.error(msg);
			alert(msg);
			return false;
		}
		main.save(function(){
			main.subapp();
		});
		return true;
	}

	/**
	 * Pickles 2 クリーンインストール
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
			"complete": function(){
				var currentPjId = pj.projectId;
				main.deselectProject();
				main.selectProject( currentPjId, function(){
					main.subapp();
				} );
			},
		} );
	}

	/**
	 * プロジェクトを削除する
	 */
	this.deleteProject = function(){
		var pj = main.getCurrentProject();
		var projectId = pj.projectId;
		var projectName = pj.projectInfo.name;
		// console.log(pj);

		var $body = $('<div>')
			.append( '<p>このプロジェクトを削除してよろしいですか？</p>' )
			.append( $('<table class="px2-table">')
				.append(
					$('<tr>')
						.append( $('<th>').append('プロジェクト名'))
						.append( $('<td>').append(pj.projectInfo.name))
				)
				.append(
					$('<tr>')
						.append( $('<th>').append('パス'))
						.append( $('<td>').append(pj.projectInfo.path))
				)
			)
			.append( '<p>プロジェクトを削除しても、ファイルの実体は消えません。手動で削除してください。</p>' )
		;
		main.px2style.modal(
			{
				'title': 'プロジェクトを削除',
				'body': $body,
				'buttons': [
					$('<button class="px2-btn px2-btn--danger">')
						.text('削除する')
						.on('click', function(e){
							main.deleteProject(
								projectId,
								function(){
									main.px2style.closeModal();
									main.message('プロジェクト "' + projectName + '" を削除しました。');
									main.subapp();
								}
							);
						})
				],
				'buttonsSecondary': [
					$('<button class="px2-btn">')
						.text('キャンセル')
						.on('click', function(e){
							main.px2style.closeModal();
						})
				],
				'onclose': function(){}
			},
			function(){}
		);

		return;
	}

	/**
	 * イベント
	 */
	$(function(){
		init();
	});

})();
