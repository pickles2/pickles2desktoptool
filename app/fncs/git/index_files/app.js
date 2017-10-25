window.px = window.parent.px;
window.contApp = new (function(){
	var _this = this;
	var pj = px.getCurrentProject();
	this.pj = pj;
	var status = pj.status();
	var $cont, $btnGitInit, $btnGitStatus, $pre;

	/**
	 * initialize
	 */
	function init(){
		$cont = $('.contents').html('');
		$btnGitInit = $('<button class="btn px2-btn">');
		$btnGitStatus = $('<button class="btn px2-btn">');
		$pre = $('<pre>');

		if( !status.gitDirExists ){
			// git init しなくてはいけない場合
			$cont
				.append( $($('#template-toInitialize-message').html()) )
				.append( $btnGitStatus
					.on('click', function(){ git_init(this); } )
					.text('gitを初期化する')
					.css({
						'width':'100%'
					})
				)
				.append( $pre
					.addClass( 'cont_console' )
					.css({
						'max-height': 360,
						'height': 360
					})
				)
			;
		}else{
			// gitリポジトリが存在する場合
			$cont
				.append( $btnGitStatus
					.on('click', function(){ git_status(this); } )
					.text('ステータスを表示する')
					.css({
						'width':'100%'
					})
				)
				.append( $pre
					.addClass( 'cont_console' )
					.css({
						'max-height': 360,
						'height': 360
					})
				)
			;
		}
	}

	function git_init(btn){
		$(btn).attr('disabled', 'disabled');
		var pj = px.getCurrentProject();
		$('.cont_console').text('');

		var stdout = '';
		px.commandQueue.client.addQueueItem(
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
					px.message( 'gitを初期化しました。' );
					px.subapp('fncs/git/index.html');
					return;
				}
			}
		);
	}

	function git_status(btn){
		$(btn).attr('disabled', 'disabled');
		var pj = px.getCurrentProject();
		$('.cont_console').text('');


		var stdout = '';
		px.commandQueue.client.addQueueItem(
			[
				'git',
				'status'
			],
			{
				'cdName': 'git',
				'tags': [
					'pj-'+pj.get('id'),
					'git-status'
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
					$('.cont_console').text( stdout );
					$(btn).removeAttr('disabled').focus();
					px.message( 'gitのステータス表示を完了しました。' );
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
