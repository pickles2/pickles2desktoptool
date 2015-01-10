window.contApp.fieldDefinitions.text = _.defaults( new (function( px, contApp ){

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData ){
		var rtn = ''
		if(typeof(fieldData)===typeof('')){
			rtn = px.$('<div>').text( fieldData ).html();
			rtn = rtn.replace(new RegExp('\r\n|\r|\n','g'), '<br />');
		}
		return rtn;
	}

})( window.px, window.contApp ), window.contApp.fieldBase );