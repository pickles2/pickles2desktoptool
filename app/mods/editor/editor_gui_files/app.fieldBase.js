window.contApp.fieldBase = new (function( px, contApp ){

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData ){
		var rtn = ''
		rtn += fieldData;
		return rtn;
	}

})( window.px, window.contApp );