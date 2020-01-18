/**
 * Home: gitBar.js
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

		$elm.html('Gitの情報を収集しています...');
		callback(); // ← 待ってもらう用事はないので返してしまう。

		var status,
			branches;
		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				pj.git().parser.git(['status', '-uall'], function(result){
					// console.log(result);
					status = result;
					rlv();
				});
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				pj.git().parser.git(['branch'], function(result){
					// console.log(result);
					branches = result;
					rlv();
				});
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				var $select = $('<select>').on('change', function(){
					var newBranchName = $(this).val();
					gitCheckout(newBranchName);
				});
				for(var i = 0; i<branches.branches.length; i++){
					$select.append( $('<option>')
						.val(branches.branches[i])
						.text(branches.branches[i])
						.attr({'selected': (branches.branches[i] == branches.currentBranchName ? 'selected' : false)})
					);
				}
				$elm.html( '' );
				var changes = status.staged.deleted.length
					+ status.staged.modified.length
					+ status.staged.untracked.length
					+ status.notStaged.deleted.length
					+ status.notStaged.modified.length
					+ status.notStaged.untracked.length;
				$elm.append( $('<div>').text('branch: ').append( $select ) );
				$elm.append( $('<div>').text('Uncommited changes: '+(changes)) );
				$elm.append( $('<div>').append( $('<a class="px2-link px2-link--burette">')
					.attr({
						'href': 'javascript:main.subapp(\'fncs/git/index.html\');'
					})
					.text('Git を操作する')
				) );
				rlv();
				return;
			}); })
		;

	} // this.init();

	function gitCheckout(newBranchName){

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				pj.git().parser.git(['status'], function(result){
					console.log(result);
					var status = result;
					var changes = status.staged.deleted.length
						+ status.staged.modified.length
						+ status.staged.untracked.length
						+ status.notStaged.deleted.length
						+ status.notStaged.modified.length
						+ status.notStaged.untracked.length;
					if( changes ){
						alert('コミットされていない変更があります。コミットするか、変更を破棄してから再度実行してください。');
						return;
					}
					rlv();
				});
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				pj.git().parser.git(['checkout', newBranchName], function(result){
					console.log(result);
					rlv();
				});
				return;
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				main.message('ブランチを切り替えました。');
				main.subapp();
				rlv();
				return;
			}); })
		;

	}

	return this;
}
