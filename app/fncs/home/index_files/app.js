window.px = $.px = window.parent.px;
window.contApp = new (function(){
	var _this = this;
	var pj = px.getCurrentProject();
	var status = pj.status();

	/**
	 * installer collection
	 */
	this.installer = {};

	/**
	 * initialize
	 */
	function init(){

		px.utils.iterateFnc([
			function(it, arg){
				$('.tpl_name').text( pj.get('name') );
				$('.tpl_path').text( pj.get('path') );
				$('.tpl_home_dir').text( pj.get('home_dir') );
				$('.tpl_entry_script').text( pj.get('entry_script') );
				$('.tpl_vcs').text( pj.get('vcs') );
				it.next(arg);
			} ,
			function(it, arg){
				px.utils.iterate(
					_.keys( status ) ,
					function(it2, data, idx){
						$('.tpl_status_table').append($('<tr>')
							.append($('<th>').text(data))
							.append($('<td>')
								.text((status[data]?'true':'false'))
							)
						);
						it2.next();
					} ,
					function(){
						it.next(arg);
					}
				);
			} ,
			function(it, arg){
				if( !status.pathExists ){
					// パスの選択しなおしbutton
					$('.cont_maintask_ui')
						.html( $('#template-reselectProject-path').html() )
						.find('form')
							.submit(function(){
								_this.selectProjectPath( $(this).find('[name=pj_path]').val() );
								return false;
							})
					;
				}else if( status.pathExists && !status.composerJsonExists ){
					// インストールボタン
					$('.cont_maintask_ui')
						.html( $('#template-install-pickles2').html() )
						.find('form')
							.submit(function(){
								install(this);
								return false;
							})
					;
				}else{
					// ちゃんとインストールできてます
					$('.cont_maintask_ui')
						.html( $('#template-standby').html() )
					;
				}
				it.next(arg);
			}
		]).start({});

	}// init()

	/**
	 * パスの選び直し
	 */
	this.selectProjectPath = function(path){
		var pj = px.getCurrentProject();
		pj.projectInfo.path = path;
		if( !px.updateProject(pj.projectId, pj.projectInfo) ){
			alert('ERROR');
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
			complete: function( dataFin ){
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
		$form.find('[name=pj_name]').val(pj.get('name'));
		// $form.find('[name=pj_path]').val(pj.get('path'));//←セットできない！
		$form.find('[name=pj_home_dir]').val(pj.get('home_dir'));
		$form.find('[name=pj_entry_script]').val(pj.get('entry_script'));
		// $form.find('[name=pj_vcs]').val(pj.get('vcs'));

		px.dialog( {
			title: 'プロジェクト情報を編集',
			body: $form ,
			buttons: [
				$('<button>').text('OK').click( function(){
					pj
						.set('name', $form.find('[name=pj_name]').val())
						.set('home_dir', $form.find('[name=pj_home_dir]').val())
						.set('entry_script', $form.find('[name=pj_entry_script]').val())
						.set('vcs', $form.find('[name=pj_vcs]').val())
					;
					if( $form.find('[name=pj_path]').val().length ){
						pj
							.set('path', $form.find('[name=pj_path]').val())
						;

					}
					px.save( function(){
						px.closeDialog();
						px.message('プロジェクト情報を更新しました。');
						px.subapp();
					} );
				} ) ,
				$('<button>').text('Cancel').click( function(){
					px.closeDialog();
				} )
			]
		} );
	}

	/**
	 * イベント
	 */
	this.openInBrowser = function(){
		px.preview.serverStandby(function(){
			px.utils.openURL( px.preview.getUrl() );
		});
	}

	/**
	 * イベント
	 */
	$(function(){
		init();
	});

})();
