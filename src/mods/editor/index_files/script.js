window.px = window.parent.px;
window.contApp = new (function( px ){
	var _this = this;
	var _pj = px.getCurrentProject();

	var _param = px.utils.parseUriParam( window.location.href );

	var _pageInfo = _pj.site.getPageInfo( _param.page_path );
	if( !_pageInfo ){
		alert('ERROR: Undefined page path.'); return this;
	}

	if( window.parent && window.parent.contApp && window.parent.contApp.loadPreview ){
		// 呼び出し元のプレビュー状態を同期する。
		window.parent.contApp.loadPreview(_param.page_path);
	}


	/**
	 * エディターを起動
	 */
	function openEditor(){
		window.location.href = './editor_px2ce.html?page_path='+encodeURIComponent( _param.page_path );
		return true;
	}

	/**
	 * エイリアスページのためのリダイレクト処理
	 */
	function redirectEditor( to ){
		// window.parent.contApp.openEditor( to );
		window.location.href = './index.html?page_path='+encodeURIComponent( to );
		return true;
	}

	/**
	 * 初期化
	 */
	function init( callback ){
		if( _pageInfo.path.match( new RegExp('^alias[0-9]*\\:(.*)$') ) ){
			// エイリアスはリダイレクトする
			var to = RegExp.$1;
			redirectEditor( to );
			return this;
		}
		openEditor();
		return this;
	}

	$(function(){
		init(function(){});
	})

})( window.parent.px );
