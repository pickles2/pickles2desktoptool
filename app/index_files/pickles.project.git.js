/**
 * px.project.git
 */
module.exports = function( px, pj ) {
	var GitParse79 = require('gitparse79');
	this.parser = new GitParse79(function(cmdAry, callback){

		var cmd = JSON.parse(JSON.stringify(cmdAry));
		cmd.unshift(px.cmd('git'));

		// PHPスクリプトを実行する
		var stdout = '';
		var stderr = '';
		px.commandQueue.client.addQueueItem(
			cmd,
			{
				'cdName': 'default',
				'tags': [
					'pj-'+pj.get('id'),
					'project-git'
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
				},
				'stderr': function(message){
					for(var idx in message.data){
						stdout += message.data[idx];
						stderr += message.data[idx];
						console.error(message.data[idx]);
					}
				},
				'close': function(message){
					setTimeout(function(){
						var code = message.data;
						// console.log(stdout, stderr, code);
						callback(code, stdout);
					},500);
					return;
				}
			}
		);


		// var stdout = '';
		// var _pathCurrentDir = process.cwd();
		// process.chdir( '/path/to/git_repository/' ); // git実行時のカレントディレクトリはここで指定

		// var proc = require('child_process').spawn('git', cmdAry);
		// proc.stdout.on('data', function(data){
		// 	stdout += data;
		// });
		// proc.stderr.on('data', function(data){
		// 	stdout += data; // エラー出力も stdout に混ぜて送る
		// });
		// proc.on('close', function(code){
		// 	callback(code, stdout);
		// });

		// process.chdir( _pathCurrentDir ); // カレントディレクトリを戻す
		return;
	});
};
