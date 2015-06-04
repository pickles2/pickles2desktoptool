window.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var _pj = px.getCurrentProject();

	var editTimer;

	var _param = px.utils.parseUriParam( window.location.href );

	var _pageInfo = _pj.site.getPageInfo( _param.page_path );
	if( !_pageInfo ){
		alert('ERROR: Undefined page path.'); return this;
	}
	var _pathContent = _pageInfo.content;
	if( !_pathContent ){
		_pathContent = _pageInfo.path;
	}

	var _cont_path = _pj.findPageContent( _param.page_path );
	var _cont_procType = _pj.getPageContentProcType( _param.page_path );
	// var _cont_realpath = _pj.get('path')+'/'+_cont_path;
	var _cont_realpath = px.php.realpath( px.utils.dirname( _pj.get('path')+'/'+_pj.get('entry_script') )+'/'+_cont_path );

	var _cont_path_info = px.utils.parsePath(_cont_path);

	if( !px.fs.existsSync( _cont_realpath ) ){
		alert('コンテンツファイルが存在しません。');
		window.parent.contApp.closeEditor();
		return this;
	}
	_cont_realpath = px.fs.realpathSync( _cont_realpath );

	var _contentsPath = px.fs.realpathSync( px.utils.dirname( _pj.get('path')+'/'+_pj.get('entry_script') )+'/'+_cont_path);
	var _pathFiles = _pj.getContentFilesByPageContent( _pj.findPageContent( _pathContent ) );
	var strLoaderCSS = '<?php ob_start(); ?><link rel="stylesheet" href="./' + px.php.basename( _pathFiles ) + '/style.css" /><?php $px->bowl()->send( ob_get_clean(), \'head\' );?>'+"\n";
	var strLoaderJS = '<?php ob_start(); ?><script src="./' + px.php.basename( _pathFiles ) + '/script.js"></script><?php $px->bowl()->send( ob_get_clean(), \'head\' );?>'+"\n";

	var $preview, $iframe;
	var $textarea_html, $textarea_css, $textarea_js;
	var $editor_header;

	var CodeMirrorInstance_html, CodeMirrorInstance_css, CodeMirrorInstance_js;

	/**
	 * コンテンツの編集結果を保存する
	 */
	function save(cb){
		cb = cb || function(){};
		CodeMirrorInstance_html.save();
		CodeMirrorInstance_css.save();
		CodeMirrorInstance_js.save();

		var src_html = JSON.parse( JSON.stringify( $textarea_html.val() ) );
		var src_css = JSON.parse( JSON.stringify( $textarea_css.val() ) );
		var src_js = JSON.parse( JSON.stringify( $textarea_js.val() ) );
		var pathFiles = _pj.getContentFilesByPageContent( _pj.findPageContent( _pathContent ) );

		px.utils.iterateFnc([
			function(it){
				var head = '';
				if( px.php.strlen( src_css ) ){
					head += strLoaderCSS;
				}
				if( px.php.strlen( src_js ) ){
					head += strLoaderJS;
				}
				src_html = head + src_html;
				px.fs.writeFile( _contentsPath, src_html, {encoding:'utf8'}, function(err){
					it.next();
				} );
			} ,
			function(it){
				var path = px.php.dirname(_contentsPath) + '/' + px.php.basename( pathFiles ) + '/style.css.scss';
				if( px.php.strlen( src_css ) ){
					px.fs.writeFile( path, src_css, {encoding:'utf8'}, function(err){
						it.next();
					} );
				}else if( px.utils.isFile( path ) ){
					px.fs.unlink( path, function(err){
						it.next();
					} );
				}else{
					it.next();
				}
			} ,
			function(it){
				var path = px.php.dirname(_contentsPath) + '/' + px.php.basename( pathFiles ) + '/script.js';
				if( px.php.strlen( src_js ) ){
					px.fs.writeFile( path, src_js, {encoding:'utf8'}, function(err){
						it.next();
					} );
				}else if( px.utils.isFile( path ) ){
					px.fs.unlink( path, function(err){
						it.next();
					} );
				}else{
					it.next();
				}
			} ,
			function(it){
				cb(true);
			}
		]).start();

		return this;
	}

	/**
	 * プレビュー画面を更新する
	 */
	function preview(){
		$iframe
			.attr('src', px.preview.getUrl(_param.page_path) )
		;
		return true;
	}

	function windowResize(){
		$('.CodeMirror')
			.css({
				'height':$(window).height() - $('.cont_btns').height() - $editor_header.height() - 10
			})
		;
		var selectedTab = $('.switch_tab button[disabled=disabled]').attr('data-switch');
		$('.editor_frame-'+selectedTab+' .CodeMirror').focus();

		$preview
			.css({
				'height': $(window).height()
			})
		;
	}

	/**
	 * 初期化
	 */
	function init(){
		var $html = $( $('#cont_tpl_editor').html() );

		$preview = $html.find('.cont_preview');
		$iframe = $preview.find('iframe');

		$editor_header = $html.find('.cont_editor_header');

		$textarea_html = $html.find('.editor_frame-html textarea');
		$textarea_css = $html.find('.editor_frame-css textarea');
		$textarea_js = $html.find('.editor_frame-js textarea');

		$html.find('.switch_tab button').click(function(e){
			var switchTo = $(this).attr('data-switch');
			_this.selectTab( switchTo );
		});

		var htmlSrc = px.fs.readFileSync(_contentsPath);
		$textarea_html.val( htmlSrc );
		htmlSrc = $textarea_html.val();
		htmlSrc = htmlSrc.replace( strLoaderCSS, '' );
		htmlSrc = htmlSrc.replace( strLoaderJS, '' );
		$textarea_html.val( htmlSrc );

		if( px.utils.isFile( px.php.dirname(_contentsPath) + '/' + px.php.basename( _pathFiles ) + '/style.css.scss' ) ){
			$textarea_css.val( px.fs.readFileSync( px.php.dirname(_contentsPath) + '/' + px.php.basename( _pathFiles ) + '/style.css.scss' ) );
		}
		if( px.utils.isFile( px.php.dirname(_contentsPath) + '/' + px.php.basename( _pathFiles ) + '/script.js' ) ){
			$textarea_js.val( px.fs.readFileSync( px.php.dirname(_contentsPath) + '/' + px.php.basename( _pathFiles ) + '/script.js' ) );
		}

		setTimeout(function(){
			$textarea_html.scrollTop(0);
		}, 10);
		$html
			.find('button.cont_btn_resources')
				.click(function(){
					_this.openResourcesDirectory();
				})
		;
		$html
			.find('button.cont_btn_save')
				.click(function(){
					save(function(result){
						if(!result){
							px.message( 'ページの保存に失敗しました。' );
						}else{
							px.message( 'ページを保存しました。' );
						}
						preview();
						$textarea_html.focus();
					});
				})
		;
		$html
			.find('button.cont_btn_save_and_close')
				.click(function(){
					save(function(result){
						if(!result){
							px.message( 'ページの保存に失敗しました。' );
						}else{
							px.message( 'ページを保存しました。' );
						}
						window.parent.contApp.closeEditor();
					});
				})
		;
		$preview
			.css({
				'width':'100%'
			})
		;
		$iframe
			.bind('load', function(){
				// ↓ これで、現在のURLがとれる。
				var loc = $iframe.get(0).contentWindow.location;
				switch( loc.href ){
					case 'blank':
					case 'about:blank':
						return;
				}
				var to = loc.pathname;
				var pathControot = _pj.getConfig().path_controot;
				to = to.replace( new RegExp( '^'+px.utils.escapeRegExp( pathControot ) ), '' );
				to = to.replace( new RegExp( '^\\/*' ), '/' );

				if( to != _param.page_path ){
					// if(confirm( 'realy to go to "'+to+'"?' )){
					window.parent.contApp.openEditor( to );
					// window.location.href = './index.html?page_path='+encodeURIComponent( to );
					// }
				}
			})
		;
		$('body')
			.html( '' )
			.append($html)
		;
		_this.selectTab('html');

		// CodeMirrorをセットアップ
		CodeMirrorInstance_html = setupCodeMirror( $textarea_html.get(0), 'html' );
		CodeMirrorInstance_css = setupCodeMirror( $textarea_css.get(0), 'css' );
		CodeMirrorInstance_js = setupCodeMirror( $textarea_js.get(0), 'js' );

		CodeMirrorInstance_html.focus();

		preview();
		windowResize();
		$(window).resize(function(){
			windowResize();
		});

		window.initContentsCSS($html);
		px.progress.close();
	}

	function setupCodeMirror( textarea, type ){
		var rtn = CodeMirror.fromTextArea( textarea , {
			lineNumbers: true,
			mode: (function(pt, type){
				if(type=='css'){
					return 'text/x-scss';
				}else if(type=='js'){
					return 'text/javascript';
				}else if(pt=='md'){
					return 'markdown';
				}
				return 'htmlmixed';
			})(_cont_procType, type),
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,
			autoCloseBrackets: true,
			matchBrackets: true,
			showCursorWhenSelecting: true,
			lineWrapping : (_cont_procType=='md'?true:false) ,

			foldGutter: true,
			gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
			extraKeys: {"Ctrl-E": "autocomplete","Cmd-S":function(){clearTimeout(editTimer);save();preview();}},

			theme: (function(pt, type){
				if(type=='css' || type=='js'){
					return 'monokai';
				}else if(pt=='md'){
					return 'base16-light';
				}
				return 'monokai';
			})(_cont_procType, type),
			keyMap: "sublime"
		});
		return rtn;
	}

	/**
	 * リソースフォルダを開く
	 */
	this.openResourcesDirectory = function(){
		var pathFiles = _pj.getContentFilesByPageContent( _pj.findPageContent( _pathContent ) );
		var realpathFiles = _pj.get_realpath_controot()+pathFiles;
		if( !px.utils.isDirectory( realpathFiles ) ){
			px.fs.mkdirSync( realpathFiles );
			if( !px.utils.isDirectory( realpathFiles ) ){
				return false;
			}
		}
		px.utils.openURL( realpathFiles );
		return this;
	}

	/**
	 * タブを選択
	 */
	this.selectTab = function( switchTo ){
		$editor_header.find('.switch_tab button').removeAttr('disabled');
		$editor_header.find('.switch_tab button[data-switch='+switchTo+']').attr('disabled', 'disabled');
		$('.editor_frame > div').hide();
		$('.editor_frame .editor_frame-'+switchTo+'').show();
		setTimeout(function(){
			$('.editor_frame .editor_frame-'+switchTo+' textarea').focus();
			$('.editor_frame .editor_frame-'+switchTo+' .CodeMirror').focus();
		}, 1000);
		return this;
	}

	$(function(){
		px.preview.serverStandby( function(){
			init();
		} );
	})

})( window.parent.px );
