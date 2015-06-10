window.px = window.parent.px;
window.contApp = new (function( px ){

	$(function(){
		window.px2dtGuiEditor.init();
	})

})( window.parent.px );
