window.contApp.fieldDefinitions.image = _.defaults( new (function( px, contApp ){

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData ){
		var rtn = ''
		if(typeof(fieldData)===typeof({})){
			rtn = fieldData.path;
		}
		return rtn;
	}

	/**
	 * データをバインドして編集画面を作る
	 */
	this.uiBind = function( fieldData, mode ){
		var rtn = fieldData;
		if( mode == 'canvas' && !rtn.length ){
			rtn = 'about:blank';
		}
		return rtn;
	}

	/**
	 * エディタUIを生成
	 */
	this.mkEditor = function( mod, data ){
		var rtn = $('<div>')
			.append($('<input>')
				.attr({
					"name":mod.name ,
					"type":"file",
					"webkitfile":"webkitfile"
				})
				.css({'width':'100%'})
			)
		;
		return rtn;
	}

	/**
	 * エディタUIで編集した内容を保存
	 */
	this.saveEditorContent = function( $dom ){
		var src = {};
		src.realpath = $dom.find('input').val();
		src.realpath = JSON.parse( JSON.stringify( src.realpath ) );
		var bin = px.fs.readFileSync( src.realpath, {} );
		src.path = 'data:image/png;base64,' + px.utils.base64encode( bin );
		return src;
	}

})( window.px, window.contApp ), window.contApp.fieldBase );