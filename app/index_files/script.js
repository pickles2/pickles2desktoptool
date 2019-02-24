/**
 * プロジェクト設定を追加する
 */
function cont_createProject(form){
	var projectInfo = {};
	projectInfo.name = $(form).find('[name=pj_name]').val();
	projectInfo.path = $(form).find('[name=pj_path]').val();
	projectInfo.home_dir = $(form).find('[name=pj_home_dir]').val();
	projectInfo.entry_script = $(form).find('[name=pj_entry_script]').val();
	// projectInfo.vcs = $(form).find('[name=pj_vcs]').val();

	$(form).find('.error_name').html('');
	$(form).find('.error_path').html('');

	if( projectInfo.path.match(new RegExp('[^a-zA-Z0-9\\/\\-\\_\\.\\@\\:\\;\\\\]')) ){
		if(!confirm('[注意] マルチバイト文字を含むパスでは、正常に動作しない場合があります。アルファベットのみで構成されたパスにセットアップすることを強くお勧めします。続けますか？')){
			return false;
		}
	}

	// プロジェクトを追加
	px.createProject(
		projectInfo ,
		{
			error:function(errorMsg){
				alert('エラー: 入力不備があります。');
				for( var fieldName in errorMsg ){
					$(form).find('.error_'+fieldName).html('').append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">Error:</span> '+errorMsg[fieldName]+'</div>');
				}
			},
			success: function(){
				alert('プロジェクト「'+projectInfo.name+'」を追加しました。');
				px.subapp();
			}
		}
	);
	return true;
}
