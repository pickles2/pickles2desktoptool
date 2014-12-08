window.px = $.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var _pj = px.getCurrentProject();

	var _param = px.utils.parseUriParam( window.location.href );

	// var _pageInfo = _pj.site.getPageInfo( _param.page_path );
	// if( !_pageInfo ){ alert('ERROR: Undefined page path.'); return this; }

	var _cont_path = _pj.findPageContent( _param.page_path );
	var _cont_realpath = _pj.get('path')+'/'+_cont_path;
	var _cont_path_info = px.utils.parsePath(_cont_path);

	if( !px.fs.existsSync( _cont_realpath ) ){
		alert('コンテンツファイルが存在しません。');
		window.parent.contApp.closeEditor();
		return this;
	}
	_cont_realpath = px.fs.realpathSync( _cont_realpath );

	var _contentsPath = px.fs.realpathSync( _pj.get('path')+'/'+_cont_path);

	function save(cb){
		cb = cb || function(){};
		var src = $('body textarea').val();

		// 文字化け問題にたいそう苦しめられた。
		// どういうわけか、一旦JSON文字列にしてからデコードすると、
		// ちゃんと保存できた。
		src = JSON.parse( JSON.stringify( src ) );

		px.fs.writeFile( _contentsPath, src, {encoding:'utf8'}, function(err){
			cb( !err );
		} );
		return this;
	}

	function preview(iframe){
		$(iframe)
			.attr('src', 'http://127.0.0.1:8080'+_param.page_path)
		;
		return true;
	}

	function resize(){
		$('textarea')
			.css({
				'height':$(window).height() - $('.cont_btns').height() - 10
			})
			.focus()
		;
		$('iframe.cont_preview')
			.css({
				'height':$(window).height() - 10
			})
		;
	}

	function init(){
		var $html = $( $('#cont_tpl_editor').html() );

		$html
			.find('textarea')
				// .attr('id', 'cont_editor')
				.css({
					'width':'100%' ,
					'border':'none',
					'resize':'none'
				})
				.val( px.fs.readFileSync(_contentsPath) )
		;
		$html
			.find('button.cont_btn_save')
				.click(function(){
					save(function(result){
						if(!result){
							px.message( 'ページの保存に失敗しました。' );
						}else{
							px.message( 'ページを保存しました。' );
						}
						preview('iframe.cont_preview');
						$('textarea').focus();
					});
				})
		;
		$html
			.find('button.cont_btn_save_and_close')
				.click(function(){
					save(function(result){
						if(!result){
							px.message( 'ページの保存に失敗しました。' );
						}else{
							px.message( 'ページを保存しました。' );
						}
						window.parent.contApp.closeEditor();
					});
				})
		;
		$html
			.find('iframe.cont_preview')
				.css({
					'border':'none',
					'width':'100%'
				})
		;
		$('body')
			.html( '' )
			.append($html)
		;
		preview('iframe.cont_preview');
		resize();
	}

	$(function(){
		px.getCurrentProject().serverStandby( function(){
			init();
		} );
	})
	$(window).resize(function(){
		resize();
	});

})( window.parent.px );
