window.px = window.parent.px;
window.contApp = new (function( px ){
	var _this = this;
	var _pj = px.getCurrentProject();

	var _param = px.utils.parseUriParam( window.location.href );
	// console.log(_param);
	if( !_param.theme_id || !_param.layout_id ){
		alert('ERROR: Undefined layout template.'); return this;
	}

	/**
	 * エディターを起動
	 */
	function openEditor(){
		var href = './editor_px2te.html?theme_id='+encodeURIComponent( _param.theme_id )+'&layout_id='+encodeURIComponent( _param.layout_id );
		window.location.href = href;
		return true;
	}

	/**
	 * 初期化
	 */
	function init( callback ){
		openEditor();
		return;
	}

	$(window).on('load', function(){
		init(function(){});
	})

})( window.parent.px );
