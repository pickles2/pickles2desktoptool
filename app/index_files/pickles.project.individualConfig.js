module.exports = function( main, pj, callbackOnFinished ) {
	callbackOnFinished = callbackOnFinished || function(){}
	var $ = main.$;

	var $form = $( $('#template-editProjectIndividualConfig').html() );
	var px2dtLDA_pj = main.px2dtLDA.project(pj.projectId);
	$form.find('[name=pj_name]').val(px2dtLDA_pj.getName());
	// $form.find('[name=pj_path]').val(pj.get('path'));//←セットできない！
	$form.find('[name=pj_home_dir]').val(px2dtLDA_pj.get().home_dir);
	$form.find('[name=pj_entry_script]').val(px2dtLDA_pj.getEntryScript());
	$form.find('[name=pj_external_preview_server_origin]').val(px2dtLDA_pj.getExtendedData('external_preview_server_origin'));
	$form.find('[name=pj_external_app_server_origin]').val(px2dtLDA_pj.getExtendedData('external_app_server_origin'));

	$form.find('.error_name').html('');
	$form.find('.error_path').html('');
	$form.find('.error_home_dir').html('');
	$form.find('.error_entry_script').html('');
	$form.find('.error_external_preview_server_origin').html('');
	$form.find('.error_external_app_server_origin').html('');

	main.px2style.modal( {
		"title": 'プロジェクト個人設定を編集',
		"body": $form ,
		"buttons": [
			$('<button>')
				.text('OK')
				.addClass('px2-btn')
				.addClass('px2-btn--primary')
				.on('click', function(){
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

					main.save(function(){
						main.px2style.closeModal();
						main.message('プロジェクト情報を更新しました。');
					});
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
	} );

};
