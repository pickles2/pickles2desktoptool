function px2dtGitUi(px, pj){
	var _this = this;
	this.px = px;
	this.pj = pj;
	this.git = pj.git();
	var divDb = {
		'sitemaps':{
			'label':'サイトマップ'
		},
		'contents':{
			'label':'コンテンツ'
		}
	};

	/**
	 * ファイルの状態を判定する
	 */
	function fileStatusJudge(index, work_tree){
		if(work_tree == '?' && index == '?'){
			return 'untracked';
		}else if(work_tree == 'M'){
			return 'modified';
		}else if(work_tree == 'D'){
			return 'deleted';
		}
		return 'unknown';
	}

	/**
	 * コミットする
	 */
	this.commit = function( div, options, callback ){
		callback = callback || function(){};
		var $body = $('<div class="px2dt-git-commit">');
		var $ul = $('<ul class="list-group">');
		var $commitComment = $('<textarea>');

		px.progress.start({'blindness': true, 'showProgressBar': true});


		function getGitStatus(div, options, callback){
			switch( div ){
				case 'contents':
					_this.git.statusContents([options.page_path], function(result, err, code){
						callback(result, err, code);
					});
					break;
				default:
					_this.git.status(function(result, err, code){
						callback(result, err, code);
					});
					break;
			}
			return;
		}

		function gitCommit(div, options, commitComment, callback){
			switch( div ){
				case 'contents':
					_this.git.commitContents([options.page_path, commitComment], function(){
						callback();
					});
					break;
				case 'sitemaps':
					_this.git.commitSitemap([commitComment], function(){
						callback();
					});
					break;
				default:
					callback();
					break;
			}
			return;
		}

		getGitStatus(div, options, function(result, err, code){
			// console.log(result, err, code);
			if( result === false ){
				alert('ERROR: '+err);
				px.progress.close();
				return;
			}
			$body.html('');
			$body.append( $('<p>').text('branch: ').append( $('<code>').text( result.branch ) ) );
			var list = [];
			if( div == 'contents' ){
				list = result.changes;
			}else{
				list = result.div[div];
			}
			for( var idx in result.changes ){
				var fileStatus = fileStatusJudge(result.changes[idx].index, result.changes[idx].work_tree);
				var $li = $('<li class="list-group-item">')
					.text( '['+fileStatus+'] '+result.changes[idx].file )
					.addClass('px2dt-git-commit__stats-'+fileStatus)
				;
				$ul.append( $li );
			}
			$body.append( $ul );
			$body.append( $commitComment );

			px.dialog({
				'title': divDb[div].label+'をコミットする',
				'body': $body,
				'buttons':[
					$('<button>')
						.text('コミット')
						.attr({'type':'submit'})
						.addClass('btn btn-primary')
						.click(function(){
							px.progress.start({'blindness': true, 'showProgressBar': true});
							var commitComment = $commitComment.val();
							// console.log(commitComment);
							gitCommit(div, options, commitComment, function(){
								alert('コミットしました。');
								px.progress.close();
								px.closeDialog();
								callback();
							});
						}),
					$('<button>')
						.text('キャンセル')
						.addClass('btn btn-default')
						.click(function(){
							px.closeDialog();
						})
				]
			});
			px.progress.close();

		});


		return this;
	}

}
