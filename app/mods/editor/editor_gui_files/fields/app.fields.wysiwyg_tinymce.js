/**
 * WYSIWYG Editor "TinyMCE" field
 * @see http://www.tinymce.com/
 */
window.contApp.fieldDefinitions.wysiwyg_tinymce = _.defaults( new (function( px, contApp ){
	var editors;
	var $iframe = $('<iframe>');

	/**
	 * エディタUIを生成
	 */
	this.mkEditor = function( mod, data ){
		var rows = 12;
		if( mod.rows ){
			rows = mod.rows;
		}
		var rtn = $('<div>')
			.append( $iframe
				.attr({
					"src": './mods/editor/editor_gui_files/fields/app.fields.wysiwyg_tinymce.form.html'
				})
				.css({'width':'100%'})
				.load(function(){
					var $this = $(this);
					var win = $this.get(0).contentWindow;
					$(win.document).find('textarea').val(data);
					win.tinymce.init({
						selector:'textarea',
						plugins: "table",
						tools: "inserttable"
					});
					setTimeout(function(){
						$this
							.css({'height':$(win.document).find('html').height()})
						;
					}, 500);
				})
			)
		;

		return rtn;
	}

	/**
	 * エディタUIが描画されたら呼ばれるコールバック
	 */
	this.onEditorUiDrawn = function( $dom, mod, data ){
		// window.top.tinymce = tinymce;
		return;
	}

	/**
	 * エディタUIで編集した内容を保存
	 */
	this.saveEditorContent = function( $dom, data, mod ){
		var win = $iframe.get(0).contentWindow;
		var src = win.tinymce.get('tinymce_editor').getContent()
		if( typeof(src) !== typeof('') ){ src = ''; }
		src = JSON.parse( JSON.stringify(src) );
		return src;
	}


})( window.px, window.contApp ), window.contApp.fieldBase );