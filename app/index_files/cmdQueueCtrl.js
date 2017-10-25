/**
 * Command Queue Control
 */
module.exports = function(px, window){
	var _this = this;
	var $ = window.jQuery;

	// CmdQueue オブジェクト(Server Side) を生成する。
	this.server = new (require('cmd-queue'))({
		'cd': {'default': process.cwd()},
		'allowedCommands': [],
		'preprocess': function(cmd, callback){
			if(cmd.command[0] == 'git'){
				// --------------------------------------
				// gitコマンドの仲介処理
				cmd.command[0] = px.cmd(cmd.command[0]);
				var gitCmd = JSON.parse( JSON.stringify(cmd.command) );
				gitCmd.shift();

				var tmpCd = cmd.cd;
				if( tmpCd ){
					process.chdir( tmpCd );
				}

				window.px.utils.spawn(px.cmd('git'),
					gitCmd,
					{
						cd: cmd.cd,
						success: function(data){
							cmd.stdout(data);
						} ,
						error: function(data){
							cmd.stdout(data);
						} ,
						complete: function(code){
							cmd.complete(code);
						}
					}
				);
				process.chdir( px.cwd );
				return false;
			}
			if(cmd.command[0] == 'composer'){
				// --------------------------------------
				// Composerコマンドの仲介処理
				cmd.command[0] = px.cmd(cmd.command[0]);
				var phpCmd = JSON.parse( JSON.stringify(cmd.command) );

				var tmpCd = cmd.cd;
				if( tmpCd ){
					process.chdir( tmpCd );
				}

				px.nodePhpBin.script(
					phpCmd ,
					{
						'cwd': cmd.cd
					} ,
					{
						'success': function(data){
							cmd.stdout(data);
						},
						'error': function(data){
							cmd.stderr(data);
						},
						'complete': function(data, error, code){
							cmd.complete(code);
						}
					}
				);
				process.chdir( px.cwd );
				return false;
			}
			if(cmd.command[0] == 'php'){
				// --------------------------------------
				// PHPコマンドの仲介処理
				var phpCmd = JSON.parse( JSON.stringify(cmd.command) );
				phpCmd.shift();

				var tmpCd = cmd.cd;
				if( tmpCd ){
					process.chdir( tmpCd );
				}

				px.nodePhpBin.script(
					phpCmd ,
					{
						'cwd': cmd.cd
					} ,
					{
						'success': function(data){
							cmd.stdout(data);
						},
						'error': function(data){
							cmd.stderr(data);
						},
						'complete': function(data, error, code){
							cmd.complete(code);
						}
					}
				);
				process.chdir( px.cwd );
				return false;
			}

			callback(cmd);
		},
		'gpiBridge': function(message, done){
			// サーバーからクライアントへのメッセージ送信を仲介
			// console.log(message);
			_this.client.gpi(message);
			done();
			return;
		}
	});

	// CmdQueue オブジェクト(Client Side) を生成する。
	this.client = new window.CmdQueue(
		{
			'gpiBridge': function(message, done){
				_this.server.gpi(message, function(result){
					done(result);
				});
			}
		}
	);

	var $mainTerminal = $('<div class="theme-command-terminal" id="theme-command-terminal">');
	$mainTerminal__cQ = $('<div class="theme-command-terminal__cQ">');
	$($mainTerminal).append($mainTerminal__cQ);
	$('body').append($mainTerminal);
	var mainTerminal = this.client.createTerminal($mainTerminal__cQ.get(0));
	// console.log('Command Queue Standby.');

	$mainTerminal.on('click', function(){
		_this.hide(); // TODO: 一時的な実装
	});

	setTimeout(function(){
		// TODO: 確認用。用事が済んだら消す。
		_this.client.addQueueItem(['php', '-v']);
	},3000);

	/**
	 * メイン端末を表示する
	 */
	this.show = function(){
		$mainTerminal.css({"bottom": 0, "height": "70%"});
	}

	/**
	 * メイン端末を隠す
	 */
	this.hide = function(){
		$mainTerminal.css({"bottom": "-70%"});
	}
}
