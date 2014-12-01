window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var sitemap = null;
	var $parent, $current, $childList;

	this.pj = px.getCurrentProject();

	$(function(){
		$childList = $('.cont_sitemap_childlist');

		px.utils.iterateFnc([
			function(it, arg){
				_this.pj.getSitemap(function(data){
					sitemap = JSON.parse(data);
					it.next();
				});
			} ,
			function(it, arg){
				_this.redraw();
				it.next();
			}
		]).start();
	});

	this.redraw = function( current ){
		if( sitemap === null ){ return; }
		var $ul = $('<ul>');
		// $childList.text( JSON.stringify(sitemap) );

		current = (typeof(current)==typeof('')?current:'');

		$childList.html('').append($ul);

		for( var idx in sitemap ){
			$ul.append( $('<li>')
				.append( $('<a>')
					.text( sitemap[idx].title )
					.attr( 'href', 'javascript:;' )
					.data( 'path', sitemap[idx].path )
					.data( 'content', sitemap[idx].content )
					.click( function(){
						alert( $(this).data('path') );
						alert( $(this).data('content') );
					} )
				)
			);
		}
		$ul.listview();
	};


})( window.parent.px );


