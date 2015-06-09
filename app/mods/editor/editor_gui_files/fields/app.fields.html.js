window.contApp.fieldDefinitions.html = _.defaults( new (function( px, contApp ){

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

})( window.px, window.contApp ), window.contApp.fieldBase );