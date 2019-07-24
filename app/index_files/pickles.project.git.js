/**
 * px.project.git
 */
module.exports = function( px, pj ) {
	// var GitParser = require('git-parser'),
	// 	gitParser = new GitParser(function(cmdAry, callback){
	// 		var stdout = '';
	// 		var _pathCurrentDir = process.cwd();
	// 		process.chdir( '/path/to/git_repository/' ); // git実行時のカレントディレクトリはここで指定

	// 		var proc = require('child_process').spawn('git', cmdAry);
	// 		proc.stdout.on('data', function(data){
	// 			stdout += data;
	// 		});
	// 		proc.stderr.on('data', function(data){
	// 			stdout += data; // エラー出力も stdout に混ぜて送る
	// 		});
	// 		proc.on('close', function(code){
	// 			callback(code, stdout);
	// 		});

	// 		process.chdir( _pathCurrentDir ); // カレントディレクトリを戻す
	// 		return;
	// 	});
	// gitParser.git(['status'], function(result){
	// 	console.log(result);
	// });
};
