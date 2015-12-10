window.px2dtGuiEditor.fieldDefinitions.markdown = _.defaults( new (function( px, px2dtGuiEditor ){
	var utils79 = require('utils79');

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData, mode ){
		var rtn = ''
		if(typeof(fieldData)===typeof('')){
			rtn = utils79.toStr(fieldData);
			rtn = px.utils.markdown( rtn );
		}
		if( mode == 'canvas' && !rtn.length ){
			rtn = $('<span>')
				.text('(ダブルクリックしてマークダウンを編集してください)')
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
			'md'
		);
		$dom.find('.CodeMirror').css({
			'border': '1px solid #ccc',
			'border-radius': '3px'
		});
		return;
	}

})( window.px, window.px2dtGuiEditor ), window.px2dtGuiEditor.fieldBase );
