window.px = window.parent.px;
window.contApp = new (function( px ){

	$(function(){

		px.cancelDrop( window );

		var _param = px.utils.parseUriParam( window.location.href );

		window.px2dtGuiEditor.init( _param.page_path );
	})

})( window.parent.px );
