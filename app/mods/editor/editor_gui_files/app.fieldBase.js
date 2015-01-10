window.contApp.fieldBase = new (function( px, contApp ){

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData ){
		var rtn = ''
		rtn += fieldData;
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

})( window.px, window.contApp );