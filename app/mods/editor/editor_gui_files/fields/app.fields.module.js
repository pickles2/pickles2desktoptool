window.contApp.fieldDefinitions.module = _.defaults( new (function( px, contApp ){

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData ){
		var rtn = ''
		rtn += fieldData.join('');
		return rtn;
	}

	/**
	 * データをバインドして編集画面を作る
	 */
	this.uiBind = function( fieldData, mode, opt ){
		var rtn = [];
		for( var idx2 in fieldData ){
			rtn[idx2] = fieldData[idx2].bind( mode );
		}
		if( mode == 'canvas' ){
			var instancePathNext = opt.instancePath+'/fields.'+opt.fieldName+'@'+( fieldData.length );
			rtn.push( $('<div>')
				.attr( "data-guieditor-cont-data-path", instancePathNext )
				.append( $('<div>')
					.text(
						// instancePathNext +
						'ここに新しいモジュールをドラッグしてください。'
					)
					.css({
						'overflow':'hidden',
						"padding": 15,
						"background-color":"#eef",
						"border-radius":5,
						"font-size":9,
						'text-align':'center',
						'box-sizing': 'content-box'
					})
				)
				.css({
					"padding":'5px 0'
				})
				.get(0).outerHTML
			);
		}
		return rtn;
	}

})( window.px, window.contApp ), window.contApp.fieldBase );