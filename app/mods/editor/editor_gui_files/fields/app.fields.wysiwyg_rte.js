/**
 * WYSIWYG Editor "wkrte" field
 * @see https://code.google.com/p/wkrte/
 */
window.contApp.fieldDefinitions.wysiwyg_rte = _.defaults( new (function( px, contApp ){
	var editors;
	var $textarea = px.$('<textarea>');

	/**
	 * エディタUIを生成
	 */
	this.mkEditor = function( mod, data ){
		var rows = 12;
		if( mod.rows ){
			rows = mod.rows;
		}
		var rtn = px.$('<div>')
			.append($textarea
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
	this.onEditorUiDrawn = function( mod, data ){
		editors = $textarea.rte({
			width: 720,
			height: 520,
			controls_rte: window.top.rte_toolbar,
			controls_html: window.top.html_toolbar
		});
		return;
	}

	/**
	 * エディタUIで編集した内容を保存
	 */
	this.saveEditorContent = function( $dom, data ){
		var src = editors[0].get_content();
		if( typeof(src) !== typeof('') ){ src = ''; }
		src = JSON.parse( JSON.stringify(src) );
		return src;
	}


})( window.px, window.contApp ), window.contApp.fieldBase );