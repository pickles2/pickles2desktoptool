window.contApp.fieldDefinitions.text = _.defaults( new (function( px, contApp ){

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData ){
		var rtn = ''
		if(typeof(fieldData)===typeof('')){
			fieldData = px.$('<div>').text( fieldData ).html();
			fieldData = fieldData.replace(new RegExp('\r\n|\r|\n','g'), '<br />');
		}
		rtn += fieldData;
		return rtn;
	}

})( window.px, window.contApp ), window.contApp.fieldBase );