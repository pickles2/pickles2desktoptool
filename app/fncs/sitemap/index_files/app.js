window.px = window.parent.px;
window.contApp = new (function(px, $){
	var _this = this;
	var pj = px.getCurrentProject();
	var filelist = pj.getSitemapFilelist();
	this.git = pj.git();
	// console.log(git);

	/**
	 * initialize
	 * @return {void} no return;
	 */
	function init(){

		$('.cont_filelist_sitemap')
			.html('')
			.append( $('<ul>').addClass('listview') )
		;

		filelistLoop:for( var i in filelist ){
			switch( px.utils.getExtension(filelist[i]) ){
				case 'csv':
				case 'xlsx':
					break;
				default:
					continue filelistLoop;
			}

			$('.cont_filelist_sitemap ul').append( $('<li>')
				.append( $('<a>')
					.attr('href', 'javascript:;')
					.data('filename', filelist[i] )
					.data('num', i)
					.click( function(e){
						var path = pj.get('path')+'/'+pj.get('home_dir')+'/sitemaps/'+$(this).data('filename');
						px.utils.openURL( path );
					} )
					.text( filelist[i] )
				)
			);
		}
		// $('.cont_filelist_sitemap ul').listview();

	}

	/**
	 * サイトマップをコミットする
	 */
	this.commitSitemap = function(){
		var $body = $('<div>');
		var $ul = $('<ul class="list-group">');
		var $commitComment = $('<textarea>');

		px.progress.start({'blindness': true, 'showProgressBar': true});

		this.git.status(function(result, err, code){
			// console.log(result, err, code);
			if( result === false ){
				alert('ERROR: '+err);
				px.progress.close();
				return;
			}
			$body.html('');
			$body.append( $('<p>').text('branch: ' + result.branch) );
			for( var idx in result.div.sitemaps ){
				var $li = $('<li class="list-group-item">').text( result.div.sitemaps[idx].file );
				$ul.append( $li );
			}
			$body.append( $ul );
			$body.append( $commitComment );

			px.dialog({
				'title': 'サイトマップをコミットする',
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
						_this.git.commitSitemaps([commitComment], function(){
							alert('コミットしました。');
							px.progress.close();
							px.closeDialog();
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

	/**
	 * フォルダを開く
	 */
	this.openInFinder = function(){
		px.utils.openURL( pj.get('path')+'/'+pj.get('home_dir')+'/sitemaps/' );
	}

	/**
	 * 初期化イベント発火
	 */
	$(function(){
		init();
	});

})(px, $);
