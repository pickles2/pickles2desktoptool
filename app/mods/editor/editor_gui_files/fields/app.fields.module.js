window.contApp.fieldDefinitions.module = _.defaults( new (function( px, contApp ){

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData ){
		var rtn = ''
		rtn += fieldData.join('');
		return rtn;
	}

})( window.px, window.contApp ), window.contApp.fieldBase );