window.px = $.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var _pj = px.getCurrentProject();

	var _param = (function(window){
		// URIパラメータをパースする
		var paramsArray = [];
		var url = window.location.href; 
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
		return paramsArray;
	})(window);

	var _contentsPath = px.fs.realpathSync( _pj.get('path')+'/'+_param.page_content);

	function save(cb){
		cb = cb || function(){};
		var src = $('body textarea').val();

		px.fs.writeFile( _contentsPath, '', {encoding:'utf8'}, function(err){
			px.fs.writeFile( _contentsPath, src, {encoding:'utf8'}, function(err){
				cb( !err );
			} );
		} );
		return this;
	}

	function init(){
		$('body')
			.html('')
			// .append($('<p>').text(_param.page_id))
			// .append($('<p>').text(_param.page_path))
			// .append($('<p>').text(_param.page_content))
			// .append($('<p>').text(_contentsPath))
			.append(
				$('<textarea>')
					// .attr('id', 'cont_editor')
					.css({
						'width':'100%' ,
						'height':'28em'
					})
					.val( px.fs.readFileSync(_contentsPath) )
			)
			.append(
				$('<button>')
					.text('保存する')
					.click(function(){
						save(function(result){
							if(!result){ alert('ERROR'); }
						});
					})
			)
			.append(
				$('<button>')
					.text('保存して閉じる')
					.click(function(){
						save(function(result){
							if(!result){ alert('ERROR'); }
							window.parent.contApp.closeEditor();
						});
					})
			)
		;
	}

	$(function(){
		init();
	})

})( window.parent.px );
