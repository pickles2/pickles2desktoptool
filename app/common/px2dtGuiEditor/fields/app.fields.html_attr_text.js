window.px2dtGuiEditor.fieldDefinitions.html_attr_text = _.defaults( new (function( px, px2dtGuiEditor ){
	var utils79 = require('utils79');

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData, mode ){
		var rtn = ''
		if(typeof(fieldData)===typeof('')){
			rtn = utils79.toStr(fieldData);
			rtn = px.$('<div>').text( rtn ).html(); // ←HTML特殊文字変換
			rtn = rtn.replace(new RegExp('\"','g'), '&quot;'); // ← jqueryで `.html()` しても、ダブルクオートは変換してくれないみたい。
			// rtn = rtn.replace(new RegExp('\r\n|\r|\n','g'), '<br />'); // ← 属性値などに使うので、改行コードは改行コードのままじゃないとマズイ。
		}
		if( mode == 'canvas' && !rtn.length ){
			// rtn = $('<span>')
			// 	.text('(ダブルクリックしてテキストを編集してください)')
			// 	.css({
			// 		'color':'#999',
			// 		'background-color':'#ddd',
			// 		'font-size':'10px',
			// 		'padding':'0 1em'
			// 	})
			// 	.get(0).outerHTML
			// ;
			// ↑属性値などに使うので、HTMLタグを含むのはマズイ。
			rtn = '(ダブルクリックしてテキストを編集してください)';
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
		$dom.find('.CodeMirror').css({
			'border': '1px solid #ccc',
			'border-radius': '3px'
		});
		return;
	}

})( window.px, window.px2dtGuiEditor ), window.px2dtGuiEditor.fieldBase );
