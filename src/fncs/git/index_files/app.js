window.px = window.parent.px;
window.contApp = new (function(){
	var _this = this;
	var pj = px.getCurrentProject();
	this.pj = pj;
	var status = pj.status();
	var $cont,
		$btnGitInit,
		$btnGitStatus,
		$btnGitPull,
		$btnGitCommit,
		$btnGitPush,
		$pre;

	/**
	 * initialize
	 */
	function init(){
		$cont = $('.contents').html('');
		$btnGitInit = $('<button class="btn px2-btn">');
		$btnGitStatus = $('<button class="btn px2-btn">');
		$btnGitPull = $('<button class="btn px2-btn">');
		$btnGitCommit = $('<button class="btn px2-btn">');
		$btnGitPush = $('<button class="btn px2-btn">');
		$pre = $('<pre>');

		if( !status.gitDirExists ){
			// git init しなくてはいけない場合
			$cont
				.append( $($('#template-toInitialize-message').html()) )
				.append( $btnGitInit
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
				.append( $('<div class="btn-group">')
					.append( $btnGitStatus
						.on('click', function(){ git_status(this); } )
						.text('ステータスを表示する')
					)
					.append( $btnGitPull
						.on('click', function(){ git_pull(this); } )
						.text('履歴をダウンロードする')
					)
					.append( $btnGitCommit
						.on('click', function(){ git_commit(this); } )
						.text('コミットする')
					)
					.append( $btnGitPush
						.on('click', function(){ git_push(this); } )
						.text('履歴をアップロードする')
					)
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

	/**
	 * git-init
	 */
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
					px.message( 'Git を初期化しました。' );
					px.subapp('fncs/git/index.html');
					return;
				}
			}
		);
	}

	/**
	 * git-status
	 */
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
					px.message( 'Git のステータス表示を完了しました。' );
					return;
				}
			}
		);
	}

	/**
	 * git-pull
	 */
	function git_pull(btn){
		$(btn).attr('disabled', 'disabled');
		var pj = px.getCurrentProject();
		$('.cont_console').text('');


		var stdout = '';
		px.commandQueue.client.addQueueItem(
			[
				'git',
				'pull'
			],
			{
				'cdName': 'git',
				'tags': [
					'pj-'+pj.get('id'),
					'git-pull'
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
					px.message( 'git-pull を完了しました。' );
					return;
				}
			}
		);
	}

	/**
	 * git-commit
	 */
	function git_commit(btn){
		var pj = px.getCurrentProject();
		var commit_message = prompt('Commit Message?');
		if(!commit_message){return;}

		$(btn).attr('disabled', 'disabled');
		$('.cont_console').text('');

		var stdout = '';

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				// git-add
				px.commandQueue.client.addQueueItem(
					[
						'git',
						'add',
						'./'
					],
					{
						'cdName': 'git',
						'tags': [
							'pj-'+pj.get('id'),
							'git-commit'
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
							rlv();
							return;
						}
					}
				);
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// git-commit
				px.commandQueue.client.addQueueItem(
					[
						'git',
						'commit',
						'-m',
						commit_message
					],
					{
						'cdName': 'git',
						'tags': [
							'pj-'+pj.get('id'),
							'git-commit'
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
							px.message( 'git-commit を完了しました。' );
							rlv();
							return;
						}
					}
				);
				return;
			}); })
		;

	}

	/**
	 * git-push
	 */
	function git_push(btn){
		$(btn).attr('disabled', 'disabled');
		var pj = px.getCurrentProject();
		$('.cont_console').text('');


		var stdout = '';
		px.commandQueue.client.addQueueItem(
			[
				'git',
				'push'
			],
			{
				'cdName': 'git',
				'tags': [
					'pj-'+pj.get('id'),
					'git-push'
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
					px.message( 'git-push を完了しました。' );
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
