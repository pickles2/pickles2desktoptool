window.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var _pj = px.getCurrentProject();

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
	var $textareas = {'html':null, 'css': null, 'js': null};
	var $editor_header;

	var CodeMirrorInstances = {'html':null, 'css': null, 'js': null};

	/**
	 * コンテンツの編集結果を保存する
	 */
	function save(cb){
		cb = cb || function(){};
		// CodeMirrorInstances['html'].save();
		// CodeMirrorInstances['css'].save();
		// CodeMirrorInstances['js'].save();

		var src_html = JSON.parse( JSON.stringify( $textareas['html'].val() ) );
		var src_css = JSON.parse( JSON.stringify( $textareas['css'].val() ) );
		var src_js = JSON.parse( JSON.stringify( $textareas['js'].val() ) );
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

		$textareas['html'] = $html.find('.editor_frame-html textarea');
		$textareas['css'] = $html.find('.editor_frame-css textarea');
		$textareas['js'] = $html.find('.editor_frame-js textarea');

		$html.find('.switch_tab button').click(function(e){
			var switchTo = $(this).attr('data-switch');
			_this.selectTab( switchTo );
		});

		var htmlSrc = px.fs.readFileSync(_contentsPath);
		$textareas['html'].val( htmlSrc );
		htmlSrc = $textareas['html'].val();
		htmlSrc = htmlSrc.replace( strLoaderCSS, '' );
		htmlSrc = htmlSrc.replace( strLoaderJS, '' );
		$textareas['html'].val( htmlSrc );

		if( px.utils.isFile( px.php.dirname(_contentsPath) + '/' + px.php.basename( _pathFiles ) + '/style.css.scss' ) ){
			$textareas['css'].val( px.fs.readFileSync( px.php.dirname(_contentsPath) + '/' + px.php.basename( _pathFiles ) + '/style.css.scss' ) );
		}
		if( px.utils.isFile( px.php.dirname(_contentsPath) + '/' + px.php.basename( _pathFiles ) + '/script.js' ) ){
			$textareas['js'].val( px.fs.readFileSync( px.php.dirname(_contentsPath) + '/' + px.php.basename( _pathFiles ) + '/script.js' ) );
		}

		setTimeout(function(){
			$textareas['html'].scrollTop(0);
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
						$textareas['html'].focus();
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

		preview();
		windowResize();
		$(window).resize(function(){
			windowResize();
		});

		window.initContentsCSS($html);
		px.progress.close();
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

		// CodeMirrorをセットアップ
		if( CodeMirrorInstances[switchTo] === null ){
			CodeMirrorInstances[switchTo] = window.textEditor.attachTextEditor(
				$textareas[switchTo].get(0),
				(function(_cont_procType, switchTo){
					if(switchTo=='css' || switchTo=='js'){
						return switchTo;
					}else if(_cont_procType=='md'){
						return _cont_procType;
					}
					return 'html';
				})(_cont_procType, switchTo),
				{
					save: function(){
						save();
						preview();
					}
				}
			);
		}
		CodeMirrorInstances[switchTo].focus();
		windowResize();
		return this;
	}

	$(function(){
		px.preview.serverStandby( function(){
			init();
		} );
	})

})( window.parent.px );
