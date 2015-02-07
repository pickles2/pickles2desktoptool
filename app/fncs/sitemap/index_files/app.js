window.px = $.px = window.parent.px;
window.contApp = new (function(){
	var _this = this;
	var pj = px.getCurrentProject();
	var filelist = pj.getSitemapFilelist();

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

						window.px.utils.spawn('open',
							[path],
							{
								success: function(data){
								} ,
								error: function(data){
									alert('error!');
								} ,
								complete: function(code){
								}
							}
						);

					} )
					.text( filelist[i] )
				)
			);
		}
		// $('.cont_filelist_sitemap ul').listview();

	}

	/**
	 * Finderで表示する
	 */
	this.openInFinder = function(){
		px.utils.spawn('open', [pj.get('path')+'/'+pj.get('home_dir')+'/sitemaps/'], {});
	}

	/**
	 * イベント
	 */
	$(function(){
		init();
	});

})();
