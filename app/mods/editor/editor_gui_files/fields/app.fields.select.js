window.contApp.fieldDefinitions.select = _.defaults( new (function( px, contApp ){

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData, mode ){
		var rtn = ''
		if( typeof(fieldData) === typeof([]) ){
			rtn += fieldData.join('');
		}else{
			rtn += fieldData;
		}
		if( mode == 'canvas' && !rtn.length ){
			rtn = $('<span>')
				.text('(ダブルクリックして選択してください)')
				.css({
					'color':'#999',
					'background-color':'#ddd',
					'font-size':'10px',
					'padding':'0 1em'
				})
				.get(0).outerHTML
			;
		}
		return rtn;
	}

	/**
	 * エディタUIを生成
	 */
	this.mkEditor = function( mod, data ){

		var $select = $('<select>')
			.attr({
				"name":mod.name
			})
			.css({'max-width':'100%'})
		;
		if( mod.options ){
			for( var idx in mod.options ){
				var $option = $('<option>')
					.attr({
						'value':mod.options[idx].value
					})
					.text(mod.options[idx].label)
				;
				if( data==mod.options[idx].value ){
					$option.attr({
						'selected': 'selected'
					});
				}
				$select.append( $option );
			}
		}
		var rtn = $('<div>')
			.append( $select )
		;
		return rtn;
	}

	/**
	 * エディタUIが描画されたら呼ばれるコールバック
	 */
	this.onEditorUiDrawn = function( mod, data ){
		return;
	}

	/**
	 * エディタUIで編集した内容を保存
	 */
	this.saveEditorContent = function( $dom, data ){
		var src = $dom.find('select').val();
		src = JSON.parse( JSON.stringify(src) );
		return src;
	}

})( window.px, window.contApp ), window.contApp.fieldBase );