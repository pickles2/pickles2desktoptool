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
	 * コミットログの日付表現の標準化
	 */
	function dateFormat(date){
		var tmpDate = new Date(date);
		var fillZero = function( int ){
			return ('00000' + int).slice( -2 );
		}
		return tmpDate.getFullYear() + '-' + fillZero(tmpDate.getMonth()+1) + '-' + fillZero(tmpDate.getDate()) + ' ' + fillZero(tmpDate.getHours()) + ':' + fillZero(tmpDate.getMinutes()) + ':' + fillZero(tmpDate.getSeconds());
	} // dateFormat()

	/**
	 * ファイルの状態を判定する
	 */
	function fileStatusJudge(fileInfo){
		if(fileInfo.work_tree == '?' && fileInfo.index == '?'){
			return 'untracked';
		}else if(fileInfo.work_tree == 'M' || fileInfo.index == 'M'){
			return 'modified';
		}else if(fileInfo.work_tree == 'D' || fileInfo.index == 'D'){
			return 'deleted';
		}
		console.error('unknown status type;');
		console.error(fileInfo);
		return 'unknown';
	} // fileStatusJudge()

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
				callback();
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
				var fileStatus = fileStatusJudge(result.changes[idx]);
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
	} // commit()

	/**
	 * コミットログを表示する
	 */
	this.log = function( div, options, callback ){
		callback = callback || function(){};

		var $body = $('<div class="px2dt-git-commit">');
		var $ul = $('<ul class="list-group">');

		px.progress.start({'blindness': true, 'showProgressBar': true});

		function getGitLog(div, options, callback){
			switch( div ){
				case 'contents':
					_this.git.logContents([options.page_path], function(result, err, code){
						callback(result, err, code);
					});
					break;
				case 'sitemaps':
					_this.git.logSitemaps(function(result, err, code){
						callback(result, err, code);
					});
					break;
				default:
					break;
			}
			return;
		}

		function getGitRollback(div, options, hash, callback){
			switch( div ){
				case 'contents':
					_this.git.rollbackContents([options.page_path, hash], function(result, err, code){
						callback(result, err, code);
					});
					break;
				case 'sitemaps':
					_this.git.rollbackSitemaps([hash], function(result, err, code){
						callback(result, err, code);
					});
					break;
				default:
					break;
			}
			return;
		}

		getGitLog(div, options, function(result, err, code){
			// console.log(result, err, code);
			if( result === false ){
				alert('ERROR: '+err);
				px.progress.close();
				callback();
				return;
			}

			$body.html('');
			for( var idx in result ){
				(function(){
					var $li = $('<li class="list-group-item px2dt-git-commit__loglist">');
					var $row = $('<div class="px2dt-git-commit__loglist-row">');
					$row.append( $('<div class="px2dt-git-commit__loglist-row-date">').text( dateFormat(result[idx].date) ) );
					$row.append( $('<div class="px2dt-git-commit__loglist-row-title">').text( result[idx].title ) );
					$row.append( $('<div class="px2dt-git-commit__loglist-row-name">').text( result[idx].name + ' <'+result[idx].email+'>' ) );
					$row.append( $('<div class="px2dt-git-commit__loglist-row-hash">').text( result[idx].hash ) );
					var $detail = $('<div class="px2dt-git-commit__loglist-detail">')
						.hide()
						.attr({
							'data-px2dt-hash': result[idx].hash
						})
						.click(function(e){
							e.stopPropagation();
						})
					;
					$li.click(function(){
						$detail.toggle('fast', function(){
							var hash = $(this).attr('data-px2dt-hash');
							if( $detail.is(':visible') ){
								$detail.html( '<div class="px2dt-loading"></div>' );
								_this.git.show([hash], function(res){
									// console.log(res);
									$detail
										.html( '' )
										.append( $('<pre>')
											.text(res)
											.css({
												'max-height': 300,
												'overflow': 'auto'
											})
										)
										.append( $('<button>')
											.addClass('btn')
											.addClass('btn-primary')
											.text('このバージョンまでロールバックする')
											.click(function(){
												if( !confirm('この操作は現在の ' + divDb[div].label + ' の変更を破棄します。よろしいですか？') ){
													return;
												}
												getGitRollback(div, options, hash, function(result, err, code){
													if( result ){
														alert('ロールバックを完了しました。');
													}else{
														alert('ロールバックは失敗しました。');
														alert('ERROR: ' + err);
														console.error('ERROR: ' + err);
													}
												});
												return;
											})
										)
									;
								});
							}else{
								$detail.html( '' );
							}
						});
					});
					$ul.append( $li.append($row).append($detail) );
				})();
			}
			$body.append( $ul );

			px.dialog({
				'title': divDb[div].label + 'のコミットログ',
				'body': $body,
				'buttons':[
					$('<button>')
						.text('閉じる')
						.attr({'type':'submit'})
						.addClass('btn btn-default')
						.click(function(){
							px.closeDialog();
							callback();
						})
				]
			});
			px.progress.close();

		});


		return this;
	} // log()

}
