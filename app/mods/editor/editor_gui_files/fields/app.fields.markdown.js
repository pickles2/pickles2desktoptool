window.contApp.fieldDefinitions.markdown = _.defaults( new (function( px, contApp ){

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData ){
		var rtn = ''
		if(typeof(fieldData)===typeof('')){
			fieldData = px.utils.markdown( fieldData );
		}
		rtn += fieldData;
		return rtn;
	}


})( window.px, window.contApp ), window.contApp.fieldBase );