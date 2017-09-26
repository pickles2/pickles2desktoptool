/**
 * Command Queue Control
 */
module.exports = function(px, window){
	var _this = this;

	// CommandQueue オブジェクト(Server Side) を生成する。
	this.server = new (require('command-queue'))({
		'cd': {'default': process.cwd()},
		'allowedCommands': [],
		'checkCommand': function(cmd, callback){
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

	// this.server.addAllowedCommand(['ls', '-la']);
	// this.client.query(['ls', '-la']);

	// console.log('Command Queue Standby.');
}
