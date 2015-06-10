window.px2dtGuiEditor.fieldDefinitions.html = _.defaults( new (function( px, px2dtGuiEditor ){

	/**
	 * エディタUIが描画されたら呼ばれるコールバック
	 */
	this.onEditorUiDrawn = function( $dom, mod, data ){
		px.textEditor.attachTextEditor(
			$dom.find('textarea').get(0),
			'html'
		);
		return;
	}

})( window.px, window.px2dtGuiEditor ), window.px2dtGuiEditor.fieldBase );