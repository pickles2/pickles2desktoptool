window.px = $.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _lastSourceCode;
	var _this = this;
	var _pj = px.getCurrentProject();

	var _param = px.utils.parseUriParam( window.location.href );

	var _pageInfo = _pj.site.getPageInfo( _param.page_path );
	if( !_pageInfo ){
		alert('ERROR: Undefined page path.'); return this;
	}
	var _pathContent = _pageInfo.content;
	if( !_pathContent ){
		_pathContent = _pageInfo.path;
	}

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

	var $preview, $iframe;

	/**
	 * コンテンツの編集結果を保存する
	 */
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

	/**
	 * プレビュー画面を更新する
	 */
	function preview(){
		$iframe
			.attr('src', px.preview.getUrl(_param.page_path) )
		;
		return true;
	}

	function windowResize(){
		$('textarea')
			.css({
				'height':$(window).height() - $('.cont_btns').height() - 10
			})
			.focus()
		;
		$preview
			.css({
				'height': $(window).height()
			})
		;
	}

	/**
	 * 初期化
	 */
	function init(){
		var $html = $( $('#cont_tpl_editor').html() );
		var editTimer;
		_lastSourceCode = px.fs.readFileSync(_contentsPath);

		$preview = $html.find('.cont_preview');
		$iframe = $preview.find('iframe');

		$html
			.find('textarea')
				// .attr('id', 'cont_editor')
				.css({
					'width':'100%' ,
					'border':'none',
					'resize':'none'
				})
				.val( _lastSourceCode )
				// .scrollTop(0)
				.blur( function(){
					var src = $('body textarea').val();
					if( src == _lastSourceCode ){ return; }
					_lastSourceCode = src;
					save(function(result){
						if(!result){
							px.message( 'ページの保存に失敗しました。' );
						}else{
							// px.message( 'ページを保存しました。' );
						}
						preview();
					});
				} )
				.keydown( function(){
					if(editTimer){ clearTimeout( editTimer ); }
					editTimer = setTimeout(function(){
						var src = $('body textarea').val();
						if( src == _lastSourceCode ){ return; }
						_lastSourceCode = src;
						save(function(result){
							if(!result){
								px.message( 'ページの保存に失敗しました。' );
							}else{
								// px.message( 'ページを保存しました。' );
							}
							preview();
						});
					}, 1000);
				} )
		;
		setTimeout(function(){
			$html.find('textarea').scrollTop(0);
		}, 10);
		$html
			.find('button.cont_btn_save')
				.click(function(){
					save(function(result){
						if(!result){
							px.message( 'ページの保存に失敗しました。' );
						}else{
							px.message( 'ページを保存しました。' );
						}
						preview();
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
		$preview
			.css({
				'width':'100%'
			})
		;
		$iframe
			.bind('load', function(){
				// ↓ これで、現在のURLがとれる。
				var loc = $iframe.get(0).contentWindow.location;
				switch( loc.href ){
					case 'blank':
					case 'about:blank':
						return;
				}
				var to = loc.pathname;
				var pathControot = _pj.getConfig().path_controot;
				to = to.replace( new RegExp( '^'+px.utils.escapeRegExp( pathControot ) ), '' );
				to = to.replace( new RegExp( '^\\/*' ), '/' );

				if( to != _param.page_path ){
					// if(confirm( 'realy to go to "'+to+'"?' )){
					window.location.href = './index.html?page_path='+encodeURIComponent( to );
					// }
				}
			})
		;
		$('body')
			.html( '' )
			.append($html)
		;

		preview();
		windowResize();

		window.initContentsCSS($html);
	}

	$(function(){
		px.preview.serverStandby( function(){
			init();
		} );
	})
	$(window).resize(function(){
		windowResize();
	});

})( window.parent.px );
