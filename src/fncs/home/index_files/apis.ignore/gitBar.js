/**
 * Home: git.js
 */
module.exports = function(contApp, px, $){
	var _this = this;
	var $elm;
	var pj = px.getCurrentProject();

	/**
	 * レポート表示の初期化
	 */
	this.init = function( tmp$elm, callback ){
		callback = callback || function(){};
		$elm = tmp$elm;

		$elm.html('Gitの情報を収集しています...');
		callback(); // ← ひとまず待ってもらう用事はないので返してしまう。

		pj.git().parser.git(['status'], function(result){
			console.log(result);
			setTimeout(function(){
				$elm.html( '' );
				var changes = result.staged.deleted.length
					+ result.staged.modified.length
					+ result.staged.untracked.length
					+ result.notStaged.deleted.length
					+ result.notStaged.modified.length
					+ result.notStaged.untracked.length;
				$elm.append( $('<div>').text('branch: '+result.currentBranchName) );
				$elm.append( $('<div>').text('Uncommited changes: '+(changes)) );
			}, 500)

			// px.message( 'Git のステータス表示を完了しました。' );
		});

	} // this.init();

	return this;
}
