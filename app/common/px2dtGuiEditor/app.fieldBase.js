window.px2dtGuiEditor.fieldBase = new (function( px, px2dtGuiEditor ){

	/**
	 * データをバインドする
	 */
	this.bind = function( fieldData, mode, mod ){
		var rtn = '';
		if( typeof(fieldData) === typeof([]) ){
			rtn += fieldData.join('');
		}else{
			rtn += fieldData;
		}
		if( mode == 'canvas' && !rtn.length ){
			rtn = $('<span>')
				.text('(ダブルクリックしてHTMLコードを編集してください)')
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
	 * プレビュー用の簡易なHTMLを生成する
	 */
	this.mkPreviewHtml = function( fieldData, mod ){
		// InstanceTreeViewで利用する
		var rtn = this.bind(fieldData, 'finalize', mod);
		return rtn;
	}

	/**
	 * データを正規化する
	 */
	this.normalizeData = function( fieldData, mode ){
		// 編集画面用にデータを初期化。
		var rtn = fieldData;
		return rtn;
	}

	/**
	 * エディタUIを生成
	 */
	this.mkEditor = function( mod, data ){
		var rows = 12;
		if( mod.rows ){
			rows = mod.rows;
		}
		var rtn = $('<div>')
			.append($('<textarea>')
				.attr({
					"name":mod.name,
					"rows":rows
				})
				.val(data)
				.css({'width':'100%','height':'auto'})
		);

		return rtn;
	}

	/**
	 * エディタUIが描画されたら呼ばれるコールバック
	 */
	this.onEditorUiDrawn = function( $dom, mod, data ){
		return;
	}

	/**
	 * データを複製する
	 */
	this.duplicateData = function( data ){
		data = JSON.parse( JSON.stringify( data ) );
		return data;
	}

	/**
	 * エディタUIで編集した内容を保存
	 */
	this.saveEditorContent = function( $dom, data, mod ){
		var src = $dom.find('textarea').val();
		src = JSON.parse( JSON.stringify(src) );
		return src;
	}

})( window.px, window.px2dtGuiEditor );
