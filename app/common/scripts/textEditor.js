window.textEditor = new (function(){

	/**
	 * textarea にテキストエディタ(CodeMirror)を適用する
	 */
	this.attachTextEditor = function( textarea, ext, options ){
		options = options||{};
		options.save = options.save||function(){};
		var rtn = CodeMirror.fromTextArea( textarea , {
			lineNumbers: true,
			mode: (function(ext){
				switch(ext){
					case 'css': return 'text/x-scss'; break;
					case 'js': case 'json': return 'text/javascript'; break;
					case 'html': return 'htmlmixed'; break;
					case 'md': case 'markdown': return 'markdown'; break;
				}
				return ext;
			})(ext),
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,
			autoCloseBrackets: true,
			styleActiveLine: true,
			matchBrackets: true,
			showCursorWhenSelecting: true,
			lineWrapping : (ext=='md'?true:false) ,

			foldGutter: true,
			gutters: [
				"CodeMirror-linenumbers",
				"CodeMirror-foldgutter"
			],

			keyMap: "sublime",
			extraKeys: {
				"Ctrl-E": "autocomplete",
				"Cmd-S": function(){
					rtn.save();
					options.save();
				}
			},

			theme: (function(ext){
				switch(ext){
					case 'txt': case 'text': return 'default';break;
					case 'js': return 'ambiance';break;
					case 'css': return 'mdn-like';break;
					case 'md': case 'markdown': return 'ttcn';break;
				}
				return 'monokai';
			})(ext)
		});
		rtn.on('blur',function(){
			rtn.save();
		});
		rtn.focus();
		return rtn;
	}// attachTextEditor()

	/**
	 * common header
	 */
	this.get_header_html = function(root){
		var rtn = '';

		// ========== CodeMirror ==========
		rtn += '<link rel="stylesheet" href="'+root+'/common/codemirror/lib/codemirror.css">';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/lib/codemirror.js"></scri'+'pt>';

		// CodeMirror modes
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/mode/xml/xml.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/mode/javascri'+'pt/javascri'+'pt.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/mode/css/css.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/mode/php/php.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/mode/htmlmixed/htmlmixed.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/mode/markdown/markdown.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/mode/jade/jade.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/mode/lua/lua.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/mode/clike/clike.js"></scri'+'pt>';

		// CodeMirror addon: foldGutter
		rtn += '<link rel="stylesheet" href="'+root+'/common/codemirror/addon/fold/foldgutter.css" />';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/fold/foldcode.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/fold/foldgutter.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/fold/brace-fold.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/fold/xml-fold.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/fold/markdown-fold.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/fold/comment-fold.js"></scri'+'pt>';

		// CodeMirror addon: hints
		rtn += '<link rel="stylesheet" href="'+root+'/common/codemirror/addon/hint/show-hint.css" />';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/hint/show-hint.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/hint/xml-hint.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/hint/html-hint.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/hint/javascri'+'pt-hint.js"></scri'+'pt>';

		rtn += '<link rel="stylesheet" href="'+root+'/common/codemirror/addon/dialog/dialog.css" />';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/dialog/dialog.js"></scri'+'pt>';

		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/search/searchcursor.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/search/search.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/edit/matchbrackets.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/edit/closebrackets.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/selection/active-line.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/comment/comment.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/addon/wrap/hardwrap.js"></scri'+'pt>';

		// CodeMirror keymaps: submime
		rtn += '<scri'+'pt src="'+root+'/common/codemirror/keymap/sublime.js"></scri'+'pt>';

		// CodeMirror Themes
		var themeList = [
			'monokai',
			'base16-dark',
			'base16-light',
			'mdn-like',
			'ambiance',
			'ttcn'
		];
		for( var idx in themeList ){
			rtn += '<link rel="stylesheet" href="'+root+'/common/codemirror/theme/'+themeList[idx]+'.css" />';
		}
		return rtn;
	}

})();