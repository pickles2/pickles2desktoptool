/**
 * Command Queue Control
 */
module.exports = function(px, window){
	var _this = this;
	var $ = window.jQuery;

	// CommandQueue オブジェクト(Server Side) を生成する。
	this.server = new (require('command-queue'))({
		'cd': {'default': process.cwd()},
		'allowedCommands': [],
		'preprocess': function(cmd, callback){
			// console.log(cmd);
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

	// CommandQueue オブジェクト(Client Side) を生成する。
	this.client = new window.CommandQueue(
		{
			'gpiBridge': function(message, done){
				_this.server.gpi(message, function(result){
					console.log(result);
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
		_this.server.addAllowedCommand(['ls', '-la']);
		_this.client.addQueueItem(['ls', '-la']);
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
