/**
 * Home: wasabiBar.js
 */
module.exports = function(contApp, main, $){
	var _this = this;
	var $elm;
	var pj = main.getCurrentProject();

	/**
	 * レポート表示の初期化
	 */
	this.init = function( tmp$elm, callback ){
		callback = callback || function(){};
		$elm = tmp$elm;

		$elm.html('WASABIの情報を収集しています...');
		callback(); // ← 待ってもらう用事はないので返してしまう。

		var appKey = '';
		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.info(pj);
				pj.wasabiPjAgent.getAppKey(function(result){
					appKey = result;
					rlv();
				});
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				$elm.html(contApp.getTemplate('wasabi-bar'));
				$elm.find('.cont-wasabi-bar__wasabi-url').text(pj.wasabiPjAgent.wasabiUrl);
				$elm.find('.cont-wasabi-bar__wasabi-pj-id').text(pj.wasabiPjAgent.projectId);
				$elm.find('input[name=wasabi-appkey]').val(appKey);
				$elm.find('form').on('submit', function(){
					var newAppKey = $elm.find('input[name=wasabi-appkey]').val();
					// alert(newAppKey);
					pj.wasabiPjAgent.updateAppKey(newAppKey, function(result){
						if( !result ){
							alert('WASABI の APPKEY の更新に [失敗] しました。');
							return;
						}
						alert('WASABI の APPKEY を更新しました。');
						_this.init($elm, function(){});
					});
					return false;
				});
				rlv();
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.info(pj);
				pj.wasabiPjAgent.getUserInfo(function(result){
					console.info('WASABI UserInfo:', result);
					$('.cont-wasabi-bar__wasabi-user-info').text(result.user.name + ' ('+result.user.account+')');
					rlv();
				});
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.info(pj);
				pj.wasabiPjAgent.callWasabiApi('projects/'+pj.wasabiPjAgent.projectId+'/permissions', {}, function(result){
					console.info('WASABI Project Permissions:', result);
					rlv();
				});
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.info(pj);
				pj.wasabiPjAgent.callWasabiApi('projects/'+pj.wasabiPjAgent.projectId+'/app/pickles2', {}, function(result){
					console.info('WASABI App Pickles 2:', result);
					rlv();
				});
				return;
			}); })
		;

	} // this.init();

	return this;
}
