window.px2dtGuiEditor.fieldDefinitions.text = _.defaults( new (function( px, px2dtGuiEditor ){

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData, mode ){
		var rtn = ''
		if(typeof(fieldData)===typeof('')){
			rtn = px.$('<div>').text( fieldData ).html(); // ←HTML特殊文字変換
			rtn = rtn.replace(new RegExp('\"','g'), '&quot;'); // ← jqueryで `.html()` しても、ダブルクオートは変換してくれないみたい。
			rtn = rtn.replace(new RegExp('\r\n|\r|\n','g'), '<br />'); // ← 改行コードは改行タグに変換
		}
		if( mode == 'canvas' && !rtn.length ){
			rtn = $('<span>')
				.text('(ダブルクリックしてテキストを編集してください)')
				.css({
					'color':'#999',
					'background-color':'#ddd',
					'font-size':'10px',
					'padding':'0 1em'
				})
				.get(0).outerHTML
			;
		}
		return rtn;
	}

	/**
	 * エディタUIが描画されたら呼ばれるコールバック
	 */
	this.onEditorUiDrawn = function( $dom, mod, data ){
		px.textEditor.attachTextEditor(
			$dom.find('textarea').get(0),
			'text'
		);
		return;
	}

})( window.px, window.px2dtGuiEditor ), window.px2dtGuiEditor.fieldBase );