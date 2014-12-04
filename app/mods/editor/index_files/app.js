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


	function cont_openEditor(){
		window.location.href = 'editor_default.html?page_path='+encodeURIComponent( _param.page_path );
	}


	function resizeEvent(){
	}

	function init(){
		if( px.fs.existsSync( _cont_realpath ) ){
			// alert('ファイルはありました。');
			cont_openEditor();
			return this;
		}

		alert('ファイルが存在しません。');
		window.parent.contApp.closeEditor();

		resizeEvent();
		return this;
	}

	$(function(){
		init();
	})
	$(window).resize(function(){
		resizeEvent();
	});

})( window.parent.px );
