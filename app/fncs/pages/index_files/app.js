window.px = $.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var _sitemap = null;
	var $parent, $current, $childList;
	var $editor = $('<div>');

	this.pj = px.getCurrentProject();

	$(function(){
		$childList = $('.cont_sitemap_childlist');

		px.utils.iterateFnc([
			function(it, arg){
				_this.pj.getSitemap(function(data){
					_sitemap = JSON.parse(data);
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
		if( _sitemap === null ){ return; }
		var $ul = $('<ul>');
		// $childList.text( JSON.stringify(_sitemap) );

		current = (typeof(current)==typeof('')?current:'');

		$childList.html('').append($ul);

		for( var idx in _sitemap ){
			$ul.append( $('<li>')
				.append( $('<a>')
					.text( _sitemap[idx].title )
					.attr( 'href', 'javascript:;' )
					.data( 'id', _sitemap[idx].id )
					.data( 'path', _sitemap[idx].path )
					.data( 'content', _sitemap[idx].content )
					.click( function(){
						_this.openEditor( $(this).data('path') );
						// alert( $(this).data('id') );
						// alert( $(this).data('path') );
						// alert( $(this).data('content') );
					} )
				)
			);
		}
		$ul.listview();
	};

	/**
	 * エディター画面を開く
	 */
	this.openEditor = function( pagePath ){
		this.closeEditor();//一旦閉じる

		var pageInfo = _sitemap[pagePath];
		if( !pageInfo ){ alert('ERROR: Undefined page path.'); return this; }

		$editor = $('<div>')
			.css({
				'position':'fixed',
				'top':0,
				'left':0 ,
				'width':'100%',
				'height':$(window).height()
			})
			.append(
				$('<iframe>')
					.attr( 'src', 'editor.html?page_path='+encodeURIComponent( pageInfo.path ) )//←エディタ自体は別のHTMLで実装
					.css({
						'border':'0px none',
						'width':'100%',
						'height':'100%'
					})
			)
			.append(
				$('<a>')
					.text('☓')
					.attr('href', 'javascript:;')
					.click( function(){
						if(!confirm('編集中の内容は破棄されます。エディタを閉じますか？')){
							return false;
						}
						_this.closeEditor();
					} )
					.css({
						'position':'absolute',
						'top':10,
						'right':10,
						'color':'#000',
						'background-color':'#eee',
						'border-radius':'0.5em',
						'text-align':'center',
						'width':'1.5em',
						'height':'1.5em'
					})
			)
		;
		$('body')
			.append($editor)
			.css({'overflow':'hidden'})
		;

		return this;
	}
	/**
	 * エディター画面を閉じる
	 * 単に閉じるだけです。編集内容の保存などの処理は、editor.html 側に委ねます。
	 */
	this.closeEditor = function(){
		$editor.remove();
		$('body')
			.css({'overflow':'auto'})
		;
		return this;
	}

	$(window).resize(function(){
		// エディタのサイズ調整
		$editor
			.css({
				'height':$(window).height()
			})
	});

})( window.parent.px );
