/**
 * プロジェクト設定を追加する
 */
function cont_createProject(form){
	var pj = {};
	pj.name = $(form).find('[name=pj_name]').val();
	pj.path = $(form).find('[name=pj_path]').val();
	pj.home_dir = $(form).find('[name=pj_home_dir]').val();
	pj.entry_script = $(form).find('[name=pj_entry_script]').val();
	// pj.vcs = $(form).find('[name=pj_vcs]').val();

	if( !px.utils79.is_dir(pj.path) ){
		alert('存在するディレクトリを選択してください。');
		return false;
	}
	var path_filelist = require('fs').readdirSync(pj.path);
	if( !px.utils79.is_file(pj.path+'/composer.json') ){
		var filelist_length = 0;
		for(var i in path_filelist){
			switch( path_filelist[i] ){
				case '.DS_Store':
				case 'Thumbs.db':
				case 'composer.json':
					break;
				default:
					filelist_length ++;
					break;
			}
		}
		if( filelist_length ){
			alert('内容が空のディレクトリか、または composer.json が置かれているディレクトリを選択してください。');
			return false;
		}
	}

	if( pj.path.match(new RegExp('[^a-zA-Z0-9\\/\\-\\_\\.\\@\\:\\;\\\\]')) ){
		if(!confirm('[注意] マルチバイト文字を含むパスでは、正常に動作しない場合があります。アルファベットのみで構成されたパスにセットアップすることを強くお勧めします。続けますか？')){
			return false;
		}
	}

	// プロジェクトを追加
	px.createProject(
		pj ,
		{
			error:function(errorMsg){
				alert('エラー: 入力不備があります。');
				for( var i in errorMsg ){
					alert(errorMsg[i]);
				}
			},
			success: function(){
				alert('プロジェクトを追加しました。');
				px.subapp();
			}
		}
	);
	return true;
}
