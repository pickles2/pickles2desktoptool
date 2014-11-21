
/**
 * プロジェクト設定を追加する
 */
function cont_createProject(form){
	var pj = {};
	pj.name = $(form).find('[name=pj_name]').val();
	pj.path = $(form).find('[name=pj_path]').val();
	pj.entry_script = $(form).find('[name=pj_entry_script]').val();
	pj.vcs = $(form).find('[name=pj_vcs]').val();

	var res = px.createProject(pj);
	if(!res){
		alert('エラー: 入力不備があります。');
		return false;
	}
	px.subapp();
	return true;
}


