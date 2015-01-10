window.contApp.fieldBase = new (function( px, contApp ){

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData ){
		var rtn = ''
		if( typeof(fieldData) === typeof([]) ){
			rtn += fieldData.join('');
		}else{
			rtn += fieldData;
		}
		return rtn;
	}

	/**
	 * データをバインドして編集画面を作る
	 */
	this.uiBind = function( fieldData, mode ){
		var rtn = fieldData;
		if( mode == 'canvas' && !rtn.length ){
			rtn = '(ダブルクリックしてテキストを編集してください)';
		}
		return rtn;
	}

	/**
	 * エディタUIを生成
	 */
	this.mkEditor = function( mod, data ){
		var rtn = $('<div>')
			.append($('<textarea>')
				.attr({"name":mod.name})
				.val(data)
				.css({'width':'100%','height':'12em'})
		);
		return rtn;
	}

	/**
	 * エディタUIで編集した内容を保存
	 */
	this.saveEditorContent = function( $dom ){
		var src = $dom.find('textarea').val();
		src = JSON.parse( JSON.stringify(src) );
		return src;
	}

})( window.px, window.contApp );