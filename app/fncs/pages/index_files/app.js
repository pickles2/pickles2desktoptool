window.px = $.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var _sitemap = null;
	var _config = null;
	var $parent, $current, $childList;
	var $editor = $('<div>');
	var $preview, $previewIframe, $pageinfo;

	var _param = px.utils.parseUriParam( window.location.href );
	var _pj = this.pj = px.getCurrentProject();
	var _lastPreviewPath;

	/**
	 * 初期化
	 */
	function init(){
		$childList = $('.cont_sitemap_childlist');
		$preview = $('.cont_preview');
		$previewIframe = $preview.find('iframe');
		$pageinfo = $('.cont_page_info');

		$preview
			.css({
				height: 600
			})
		;
		$previewIframe
			.bind('load', function(){
				var loc = $previewIframe.get(0).contentWindow.location;
				switch( loc.href ){
					case 'blank':
					case 'about:blank':
						return;
				}
				var to = loc.pathname;
				var pathControot = _pj.getConfig().path_controot;
				to = to.replace( new RegExp( '^'+px.utils.escapeRegExp( pathControot ) ), '' );
				to = to.replace( new RegExp( '^\\/*' ), '/' );

				var pageInfo = _this.pj.site.getPageInfo(to);
				var contProcType = _this.pj.getPageContentProcType( pageInfo.path );
				var $html = $('<div>')
					.append( $('<div>')
						.text( pageInfo.title+'('+pageInfo.path+')'+' - '+contProcType )
					)
					.append( $('<button>')
						.text( '編集する' )
						.attr({'data-path': pageInfo.path})
						.click(function(){
							_this.openEditor( $(this).attr('data-path') );
							return false;
						})
					)
				;

				if( contProcType != '.not_exists' ){
					$html
						.append( $('<a class="icon">')
							.text( 'Finderで開く' )
							.attr({
								'data-content': pageInfo.content ,
								'href':'javascript:;'
							})
							.click(function(){
								px.utils.openURL( px.utils.dirname( _pj.get_realpath_controot()+$(this).attr('data-content') ) );
								return false;
							})
						)
						.append( $('<a class="icon">')
							.text( 'リソースフォルダを開く' )
							.attr({
								'data-path': pageInfo.path ,
								'href':'javascript:;'
							})
							.click(function(){
								var pathFiles = _pj.getContentFilesByPageContent( _pj.findPageContent( $(this).attr('data-path') ) );
								var realpathFiles = _pj.get_realpath_controot()+pathFiles;
								if( !px.utils.isDirectory( realpathFiles ) ){
									px.fs.mkdirSync( realpathFiles );
									if( !px.utils.isDirectory( realpathFiles ) ){
										return false;
									}
								}
								px.utils.openURL( realpathFiles );
								return false;
							})
						)
						.append( $('<a class="icon">')
							.text( '素材フォルダを開く' )
							.attr({
								'data-path': pageInfo.path ,
								'href':'javascript:;'
							})
							.click(function(){
								var pathFiles = _pj.getContentFilesByPageContent( _pj.findPageContent( $(this).attr('data-path') ) );
								var realpathFiles = _pj.get_realpath_controot()+pathFiles;
								if( !px.utils.isDirectory( realpathFiles ) ){
									px.fs.mkdirSync( realpathFiles );
									if( !px.utils.isDirectory( realpathFiles ) ){
										return false;
									}
								}
								var realpath_matDir = realpathFiles + 'materials.ignore/';
								if( !px.utils.isDirectory( realpath_matDir ) ){
									px.fs.mkdirSync( realpath_matDir );
									if( !px.utils.isDirectory( realpath_matDir ) ){
										return false;
									}
								}
								px.utils.openURL( realpath_matDir );
								return false;
							})
						)
					;
					$html
						.append( $('<a class="icon">')
							.text( '編集方法を変更' )
							.attr({
								'data-path': pageInfo.path ,
								'data-proc_type': contProcType ,
								'href':'javascript:;'
							})
							.click(function(){
								var $this = $(this);
								var $body = $('<div>')
									.append( $('#template-change-proctype').html() )
								;
								$body.find('input[name=proc_type]').val( [$this.attr('data-proc_type')] );
								px.dialog({
									'title': '編集方法を変更する',
									'body': $body,
									'buttons':[
										$('<button>')
											.text('OK')
											.click(function(){
												var val = $body.find('input[name=proc_type]:checked').val();
												_pj.changeContentProcType( $this.attr('data-path'), val, function(){
													px.closeDialog();
												} )
											}),
										$('<button>')
											.text('Cancel')
											.click(function(){
												px.closeDialog();
											})
									]
								});
								return false;
							})
						)
					;
					if( contProcType != 'html.gui' ){
						$html
							.append( $('<a class="icon">')
								.text( '外部テキストエディタで編集' )
								.attr({
									'data-path': pageInfo.path ,
									'href':'javascript:;'
								})
								.click(function(){
									var pathCont = _pj.findPageContent( $(this).attr('data-path') );
									px.openInTextEditor( _pj.get_realpath_controot()+pathCont );
									return false;
								})
							)
						;
					}
				}

				$pageinfo.html( $html );
				$childList.find('a').removeClass('current');
				$childList.find('a[data-path="'+pageInfo.path+'"]').addClass('current');

				$(window).resize();
			})
		;

		_this.pj.site.updateSitemap(function(){
			_config = _this.pj.getConfig();
			_sitemap = _this.pj.site.getSitemap();
			_this.redraw();
			_this.loadPreview( _param.page_path, function(){
				$(window).resize();
			} );
		});
	}

	/**
	 * ウィンドウリサイズイベントハンドラ
	 */
	function onWindowResize(){
		$editor
			.css({
				'height':$(window).height() -5
			})
		;
		$('.cont_workspace_container')
			.css({
				'height':$(window).height() - $('.container').height() -15
			})
		;
		$preview
			.css({
				'height': $('.cont_workspace_container').height() - $pageinfo.height() - 40
			})
		;

	}


	/**
	 * プレビューウィンドウにページを表示する
	 */
	this.loadPreview = function( path, cb ){
		cb = cb || function(){};
		if( !path ){ path = '/'; }
		if( _lastPreviewPath == path ){
			// 前回ロードしたpathと同じなら、リロードをスキップ
			cb();
			return this;
		}

		_lastPreviewPath = path;
		px.preview.serverStandby( function(){
			$previewIframe.attr( 'src', px.preview.getUrl(path) );
			cb();
		} );
		return this;
	}

	/**
	 * 再描画
	 */
	this.redraw = function( current ){
		if( _sitemap === null ){
			px.message('[ERROR] サイトマップが正常に読み込まれていません。');
			return;
		}
		var $ul = $('<ul class="listview">');
		// $childList.text( JSON.stringify(_sitemap) );

		current = (typeof(current)==typeof('')?current:'');

		$childList.html('').append($ul);

		for( var idx in _sitemap ){
			$ul.append( $('<li>')
				.append( $('<a>')
					.text( _sitemap[idx].title )
					.attr( 'href', 'javascript:;' )
					.attr( 'data-id', _sitemap[idx].id )
					.attr( 'data-path', _sitemap[idx].path )
					.attr( 'data-content', _sitemap[idx].content )
					.css({
						// ↓暫定だけど、階層の段をつけた。
						'padding-left': (function(pageInfo){
							if( !_sitemap[idx].id.length ){ return '1.5em'; }
							if( !_sitemap[idx].logical_path.length ){ return '3em' }
							var rtn = ( (_sitemap[idx].logical_path.split('>').length + 1) * 2)+'em';
							return rtn;
						})(_sitemap[idx])
					})
					.click( function(){
						_this.loadPreview( $(this).attr('data-path') );
						// _this.openEditor( $(this).attr('data-path') );
					} )
				)
			);
		}
		// $ul.listview();
	};

	/**
	 * エディター画面を開く
	 */
	this.openEditor = function( pagePath ){
		this.closeEditor();//一旦閉じる

		var pageInfo = _pj.site.getPageInfo( pagePath );
		if( !pageInfo ){ alert('ERROR: Undefined page path.'); return this; }

		var contPath = _pj.findPageContent(pagePath);
		var contRealpath = _pj.get('path')+'/'+contPath;
		var pathInfo = px.utils.parsePath(contPath);

		if( px.fs.existsSync( contRealpath ) ){
			contRealpath = px.fs.realpathSync( contRealpath );
		}else{
			// alert('ファイルが存在しません。');
			// return this;
		}

		$editor = $('<div>')
			.css({
				'position':'fixed',
				'top':0,
				'left':0 ,
				'width':'100%',
				'height':$(window).height()
			})
			.append(
				$('<iframe>')
					//↓エディタ自体は別のHTMLで実装
					.attr( 'src', '../../mods/editor/index.html'
						+'?page_path='+encodeURIComponent( pageInfo.path )
					)
					.css({
						'border':'0px none',
						'width':'100%',
						'height':'100%'
					})
			)
			.append(
				$('<a>')
					.text('☓')
					.attr('href', 'javascript:;')
					.click( function(){
						// if(!confirm('編集中の内容は破棄されます。エディタを閉じますか？')){ return false; }
						_this.closeEditor();
					} )
					.css({
						'position':'absolute',
						'top':15,
						'right':15,
						'font-size':'18px',
						'color':'#333',
						'background-color':'#eee',
						'border-radius':'0.5em',
						'border':'1px solid #333',
						'text-align':'center',
						'opacity':0.4,
						'width':'1.5em',
						'height':'1.5em'
					})
					.hover(function(){
						$(this).animate({
							'opacity':1
						});
					}, function(){
						$(this).animate({
							'opacity':0.4
						});
					})
			)
		;
		$('body')
			.append($editor)
			.css({'overflow':'hidden'})
		;

		return this;
	}

	/**
	 * エディター画面を閉じる
	 * 単に閉じるだけです。編集内容の保存などの処理は、editor.html 側に委ねます。
	 */
	this.closeEditor = function(){
		$editor.remove();
		$('body')
			.css({'overflow':'auto'})
		;
		return this;
	}

	$(function(){
		init();
		$(window).resize(function(){
			onWindowResize();
		});

	});


})( window.parent.px );
