window.main = window.parent.main;
window.contApp = new (function(){
	var _this = this;
	var pj = main.getCurrentProject();
	this.pj = pj;
	var status = pj.status();
	var $cont,
		$btnGitInit;

	/**
	 * initialize
	 */
	function init(){
		$cont = $('.contents').html('');
		$btnGitInit = $('<button class="px2-btn">');

		if( !status.gitDirExists ){
			// --------------------------------------
			// git init されていない場合
			$cont
				.append( $($('#template-toInitialize-message').html()) )
			;
			$cont.find('.cont-btn-git-init')
				.on('click', function(){
					$(this).attr({'disabled': true});
					git_init(this);
				} )
			;

		}else{
			// --------------------------------------
			// gitリポジトリが存在する場合

			window.px2style.loading();

			var $elm = document.querySelector('.contents');
			var gitUi79 = new GitUi79( $elm, function( cmdAry, callback ){
				pj.git().parser.git(cmdAry, function(result){
					// console.log(result);
					result.stdout = (function(str){
						str = str.replace(/((?:[a-zA-Z\-\_]+))\:\/\/([^\s\/\\]*?\:)([^\s\/\\]*)\@/gi, '$1://$2********@');
						return str;
					})(result.stdout);
					pj.updateGitStatus(function(){
						callback(result.code, result.stdout);
					});
				});
			}, {} );
			gitUi79.init(function(){
				window.px2style.closeLoading();
				console.log('gitUi79: Standby.');
			});

		}

	}

	/**
	 * git-init
	 */
	function git_init(btn){
		$(btn).attr('disabled', 'disabled');
		var pj = main.getCurrentProject();
		$('.cont_console').text('');

		var stdout = '';
		main.commandQueue.client.addQueueItem(
			[
				'git',
				'init'
			],
			{
				'cdName': 'default',　// この時点で .git が存在しないので、 ルートディレクトリは `git` ではなく `default`。
				'tags': [
					'pj-'+pj.get('id'),
					'git-init'
				],
				'accept': function(queueId){
					// console.log(queueId);
				},
				'open': function(message){
				},
				'stdout': function(message){
					for(var idx in message.data){
						stdout += message.data[idx];
					}
					$('.cont_console').text(stdout);
				},
				'stderr': function(message){
					for(var idx in message.data){
						stdout += message.data[idx];
					}
					$('.cont_console').text(stdout);
				},
				'close': function(message){
					$(btn).removeAttr('disabled');
					main.message( 'Git を初期化しました。' );
					main.subapp('fncs/git/index.html');
					return;
				}
			}
		);
	}

	/**
	 * イベント
	 */
	$(function(){
		init();
	});

})();
