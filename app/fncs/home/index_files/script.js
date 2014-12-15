window.px = $.px = window.parent.px;
window.contApp = new (function(){
	var _this = this;
	var pj = px.getCurrentProject();
	var status = pj.status();

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
						.find('button')
							.click(function(){
								_this.install(this);
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

	}

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
	this.install = function(btn){
		$(btn).attr('disabled','disabled');

		px.utils.spawn( px.cmd('composer'),
			[
				'create-project',
				'tomk79/pickles2',
				'./',
				'dev-master'
			],
			{
				cd: pj.get('path'),
				success: function(data){
				} ,
				error: function(data){
					alert('ERROR: '+data);
				} ,
				complete: function(code){
					$(btn).removeAttr('disabled');
					px.subapp();
				}
			}
		);
	}

	$(function(){
		init();
	});

})();
