window.contApp.fieldDefinitions.html_attr_text = _.defaults( new (function( px, contApp ){

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData, mode ){
		var rtn = ''
		if(typeof(fieldData)===typeof('')){
			rtn = px.$('<div>').text( fieldData ).html(); // ←HTML特殊文字変換
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

})( window.px, window.contApp ), window.contApp.fieldBase );