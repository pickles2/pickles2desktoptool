window.px = $.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;

	var _param = (function(){
		// URIパラメータをパースする
		var paramsArray = [];
		var url = location.href; 
		parameters = url.split("?");
		if( parameters.length > 1 ) {
			var params = parameters[1].split("&");
			for ( var i = 0; i < params.length; i++ ) {
				var paramItem = params[i].split("=");
				for( var i2 in paramItem ){
					paramItem[i2] = decodeURIComponent( paramItem[i2] );
				}
				paramsArray.push( paramItem[0] );
				paramsArray[paramItem[0]] = paramItem[1];
			}
		}
		//
		return paramsArray;
	})();

	$(function(){
		$('.contents')
			.append(
				$('<p>')
					.text(_param.page_path)
			)
		;
	})

})( window.parent.px );
