window.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var _sitemap = null;
	var _config = null;
	var $parent, $current, $childList;
	var $editor = $('<div>');
	var $preview, $previewIframe, $pageinfo, $commentView;

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
		$commentView = $('.cont_comment_view');

		// bootstrap
		$('*').tooltip();

		$preview
			.css({
				height: 600
			})
		;
		$previewIframe
			.bind('load', function(){

				px.utils.iterateFnc([
					function(it, prop){

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

						_this.pj.px2proj.get_page_info(to, function(pageInfo){
							prop.pageInfo = pageInfo;
							if( prop.pageInfo === null ){
								_this.pj.px2proj.get_page_info('', function(pageInfo){
									prop.pageInfo = pageInfo;
									if( prop.pageInfo === null ){
										prop.pageInfo = {};
									}
									it.next(prop);
								});
							}else{
								it.next(prop);
							}
						});

					} ,
					function(it, prop){

						var contProcType = _this.pj.getPageContentProcType( prop.pageInfo.path );
						var $bs3btn = $($('#template-bootstrap3-btn-dropdown-toggle').html());
						var $html = $('<div>')
							.append( $('<div class="cont_page_info-prop">')
								.text( prop.pageInfo.title+'('+prop.pageInfo.path+')'+' - '+contProcType )
							)
							.append( $('<div class="cont_page_info-btn">')
								.append( $bs3btn )
							)
						;

						// サイトマップに編集者コメント欄があったら表示する
						// 　※サイトマップ拡張項目 "editor-comment" から自動的に取得する。
						// 　　Markdown 処理して表示する。
						if( prop.pageInfo['editor-comment'] ){
							$html
								.append( $('<div class="cont_page_info-editor_comment">')
									.html( px.utils.markdown(prop.pageInfo['editor-comment']) )
								)
							;
						}

						$commentView
							.html('...')
							.attr({'data-path': prop.pageInfo.path})
							.dblclick(function(){
								_this.openCommentFile( $(this).attr('data-path') );
								return false;
							})
						;
						setTimeout(function(){
							var pathFiles = _pj.getContentFilesByPageContent( _pj.findPageContent( prop.pageInfo.path ) );
							var realpathFiles = _pj.get_realpath_controot()+pathFiles;
							var realpath_matDir = realpathFiles + 'comments.ignore/';
							var realpath_comment_file = realpath_matDir + 'comment.md';
							if(!px.utils.isFile( realpath_comment_file )){
								$commentView.text('no comment.');
								return;
							}
							$commentView.text('コメントをロードしています...');
							px.fs.readFile(realpath_comment_file, {'encoding':'utf8'}, function(err, data){
								var html = px.utils.markdown( data );
								var $html = $('<div>').html(html);
								$html.find('a[href]').click(function(){
									px.utils.openURL(this.href);
									return false;
								});
								$commentView.html($html);
							});
							return;
						}, 10);

						$bs3btn.find('button.btn--edit').eq(0)
							.attr({'data-path': prop.pageInfo.path})
							// .text('編集する')
							.css({
								'padding-left': '5em',
								'padding-right': '5em'
							})
							.click(function(){
								_this.openEditor( $(this).attr('data-path') );
								return false;
							})
						;
						$bs3btn.find('button.btn--resources').eq(0)
							.attr({'data-path': prop.pageInfo.path})
							// .text('リソース')
							.click(function(){
								_this.openResourcesDirectory( $(this).attr('data-path') );
								return false;
							})
						;
						// $bs3btn.find('button.btn--comment').eq(0)
						// 	.attr({'data-path': prop.pageInfo.path})
						// 	// .text('コメント')
						// 	.click(function(){
						// 		_this.openCommentFile( $(this).attr('data-path') );
						// 		return false;
						// 	})
						// ;
						// setTimeout(function(){
						// 	var button = $bs3btn.find('button.btn--comment').eq(0);
						// 	var pathFiles = _pj.getContentFilesByPageContent( _pj.findPageContent( prop.pageInfo.path ) );
						// 	var realpathFiles = _pj.get_realpath_controot()+pathFiles;
						// 	var realpath_matDir = realpathFiles + 'comments.ignore/';
						// 	var realpath_comment_file = realpath_matDir + 'comment.md';
						// 	if( px.utils.isFile( realpath_comment_file ) ){
						// 		button.text('コメントあり');
						// 	}else{
						// 		button.text('コメントする');
						// 	}
						// }, 10);

						$bs3btn.find('button.btn--materials').eq(0)
							.attr({'data-path': prop.pageInfo.path})
							// .text('素材(--)')
							.click(function(){
								_this.openMaterialsDirectory( $(this).attr('data-path') );
								return false;
							})
						;
						setTimeout(function(){
							var button = $bs3btn.find('button.btn--materials').eq(0);
							var pathFiles = _pj.getContentFilesByPageContent( _pj.findPageContent( prop.pageInfo.path ) );
							var realpathFiles = _pj.get_realpath_controot()+pathFiles;
							var realpath_matDir = realpathFiles + 'materials.ignore/';
							var matCount = 0;
							button.text('素材 ('+matCount+')');
							if( !px.utils.isDirectory(realpath_matDir) ){
								return;
							}

							var countFile_r = function(path){
								var list = px.utils.ls( path );
								for( var idx in list ){
									if( list[idx] == '.DS_Store' || list[idx] == 'Thumbs.db' ){
										continue;
									}
									if( px.utils.isFile(path+'/'+list[idx]) ){
										matCount ++;
										button.text('素材 ('+matCount+')');
									}else if( px.utils.isDirectory(path+'/'+list[idx]) ){
										countFile_r( path+'/'+list[idx] );
									}
								}
							}
							countFile_r(realpath_matDir);

						}, 10);

						if( contProcType != '.not_exists' ){
							$bs3btn.find('ul[role=menu]')
								.append( $('<li>')
									.append( $('<a>')
										.text( 'フォルダを開く' )
										.attr({
											'data-content': prop.pageInfo.content ,
											'href':'javascript:;'
										})
										.click(function(){
											$bs3btn.find('.dropdown-toggle').click();
											px.utils.openURL( px.utils.dirname( _pj.get_realpath_controot()+$(this).attr('data-content') ) );
											return false;
										})
									)
								)
							;
						}
						if( contProcType != 'html.gui' ){
							$bs3btn.find('ul[role=menu]')
								.append( $('<li>')
									.append( $('<a>')
										.text( '外部テキストエディタで編集' )
										.attr({
											'data-path': prop.pageInfo.path ,
											'href':'javascript:;'
										})
										.click(function(){
											$bs3btn.find('.dropdown-toggle').click();
											var pathCont = _pj.findPageContent( $(this).attr('data-path') );
											px.openInTextEditor( _pj.get_realpath_controot()+pathCont );
											return false;
										})
									)
								)
							;
						}

						$bs3btn.find('ul[role=menu]')
							.append( $('<li>')
								.append( $('<a>')
									.text( 'ブラウザでプレビュー' )
									.attr({
										'data-path': prop.pageInfo.path ,
										'href':'javascript:;'
									})
									.click(function(){
										$bs3btn.find('.dropdown-toggle').click();
										var $this = $(this);
										px.preview.serverStandby(function(){
											px.utils.openURL( px.preview.getUrl( $this.attr('data-path') ) );
										});
										return false;
									})
								)
							)
							.append( $('<li class="divider">') )
							.append( $('<li>')
								.append( $('<a>')
									.text( 'show DEC' )
									.attr({
										'data-path': prop.pageInfo.path ,
										'href':'javascript:;'
									})
									.click(function(){
										$bs3btn.find('.dropdown-toggle').click();
										var $this = $(this);
										var bookmarklet = "javascript:(function(){var b=document.body;elm=document.createElement('script');elm.setAttribute('type','text/javascript');elm.src='http://tomk79.github.io/DEC/dec_show.js';b.appendChild(elm);b.removeChild(elm);return;})();";
										$previewIframe.get(0).contentWindow.location = bookmarklet;
										return false;
									})
								)
							)
							.append( $('<li class="divider">') )
							.append( $('<li>')
								.append( $('<a>')
									.text( '他のページから複製して取り込む' )
									.attr({
										'data-path': prop.pageInfo.path ,
										'data-proc_type': contProcType ,
										'href':'javascript:;'
									})
									.click(function(){
										$bs3btn.find('.dropdown-toggle').click();
										if( !confirm('現状のコンテンツを破棄し、他のページを複製して取り込みます。よろしいですか？') ){
											return false;
										}
										var $this = $(this);
										var $body = $('<div>')
											.append( $('#template-copy-from-other-page').html() )
										;
										px.dialog({
											'title': '他のページから複製',
											'body': $body,
											'buttons':[
												$('<button>')
													.text('OK')
													.click(function(){
														var val = $body.find('input').val();
														var pageinfo = _this.pj.site.getPageInfo(val);
														if( !pageinfo ){
															alert('存在しないページです。');
															return false;
														}
														_this.pj.copyContentsData(
															pageinfo.path,
															$this.attr('data-path'),
															function(){
																_this.loadPreview( _lastPreviewPath, function(){
																	px.closeDialog();
																}, {"force":true} );
															}
														);
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
							)
						;
						if( contProcType == 'html.gui' ){
							$bs3btn.find('ul[role=menu]')
								.append( $('<li>')
									.append( $('<a>')
										.text( 'GUI編集コンテンツを再構成する' )
										.attr({
											'title':'モジュールの変更を反映させます。',
											'data-path': prop.pageInfo.path ,
											'href':'javascript:;'
										})
										.click(function(){
											$bs3btn.find('.dropdown-toggle').click();
											var pagePath = $(this).attr('data-path');
											_pj.buildGuiEditContent( pagePath, function(result){
												_this.loadPreview( pagePath, function(){}, {'force':true} );
											} );
											return false;
										})
									)
								)
							;
						}
						if( contProcType != '.not_exists' ){
							$bs3btn.find('ul[role=menu]')
								.append( $('<li>')
									.append( $('<a>')
										.text( '編集方法を変更' )
										.attr({
											'data-path': prop.pageInfo.path ,
											'data-proc_type': contProcType ,
											'href':'javascript:;'
										})
										.click(function(){
											$bs3btn.find('.dropdown-toggle').click();
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
																_this.loadPreview( _lastPreviewPath, function(){
																	px.closeDialog();
																}, {"force":true} );
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
								)
							;
						}
						$bs3btn.find('ul[role=menu]')
							.append( $('<li>')
								.append( $('<a>')
									.text( 'ページをリロード' )
									.attr({
										'data-path': prop.pageInfo.path ,
										'href':'javascript:;'
									})
									.click(function(){
										$bs3btn.find('.dropdown-toggle').click();
										var pagePath = $(this).attr('data-path');
										_this.loadPreview( pagePath, function(){}, {'force':true} );
										return false;
									})
								)
							)
						;

						$pageinfo.html( $html );

						$bs3btn.find('li').css(
							{
								"max-width": $bs3btn.width(),
								"overflow": "hidden"
							}
						);

						$childList.find('a').removeClass('current');
						$childList.find('a[data-path="'+prop.pageInfo.path+'"]').addClass('current');

						$(window).resize();


						it.next(prop);
					} ,
					function(it, prop){
						it.next(prop);
					}
				]).start({});

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
	}// init()

	/**
	 * 素材フォルダを開く
	 */
	this.openMaterialsDirectory = function( path ){
		var pathFiles = _pj.getContentFilesByPageContent( _pj.findPageContent( path ) );
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
		return this;
	}

	/**
	 * リソースフォルダを開く
	 */
	this.openResourcesDirectory = function( path ){
		var pathFiles = _pj.getContentFilesByPageContent( _pj.findPageContent( path ) );
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
	 * コメントファイルを開く
	 */
	this.openCommentFile = function( path ){
		var pathFiles = _pj.getContentFilesByPageContent( _pj.findPageContent( path ) );
		var realpathFiles = _pj.get_realpath_controot()+pathFiles;
		if( !px.utils.isDirectory( realpathFiles ) ){
			px.fs.mkdirSync( realpathFiles );
			if( !px.utils.isDirectory( realpathFiles ) ){
				return false;
			}
		}
		var realpath_matDir = realpathFiles + 'comments.ignore/';
		if( !px.utils.isDirectory( realpath_matDir ) ){
			px.fs.mkdirSync( realpath_matDir );
			if( !px.utils.isDirectory( realpath_matDir ) ){
				return false;
			}
		}
		var realpath_comment_file = realpath_matDir + 'comment.md';
		if( !px.utils.isFile( realpath_comment_file ) ){
			px.fs.writeFileSync( realpath_comment_file, '# comment: '+path );
			if( !px.utils.isFile( realpath_comment_file ) ){
				return false;
			}
		}
		px.utils.openURL( realpath_comment_file );
		return this;
	}

	/**
	 * ウィンドウリサイズイベントハンドラ
	 */
	function onWindowResize(){
		$editor
			.css({
				'height': $(window).innerHeight() -0
			})
		;
		$commentView
			// .css({
			// 	'height': $(window).innerHeight() - $('.container').outerHeight() -10
			// })
		;
		$('.cont_workspace_container')
			.css({
				'height': $(window).innerHeight() - $('.container').outerHeight() - $commentView.outerHeight() -20,
				'margin-top': 10
			})
		;
		$preview
			.css({
				'height': $('.cont_workspace_container').parent().outerHeight() - $pageinfo.outerHeight() - 3
			})
		;

	}


	/**
	 * プレビューウィンドウにページを表示する
	 */
	this.loadPreview = function( path, cb, opt ){
		cb = cb || function(){};
		if(!opt){ opt = {}; }
		if(!opt.force){ opt.force = false; }

		if( !path ){
			path = _pj.getConfig().path_top;
			// path = '/';
		}

		if( _lastPreviewPath == path && !opt.force ){
			// 前回ロードしたpathと同じなら、リロードをスキップ
			cb();
			return this;
		}
		$pageinfo.html('<div style="text-align:center;">now loading ...</div>');

		_lastPreviewPath = path;
		px.preview.serverStandby( function(){
			_pj.px2proj.href(path, function(linkto){
				$previewIframe.attr( 'src', px.preview.getUrl(linkto) );
				cb();
			});
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
						_this.loadPreview( $(this).attr('data-path'), function(){}, {"force":true} );
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

		// プログレスモード表示
		px.progress.start({
			'blindness':true
		});

		var pageInfo = _pj.site.getPageInfo( pagePath );
		if( !pageInfo ){ alert('ERROR: Undefined page path.'); return this; }

		var contPath = _pj.findPageContent( pagePath );
		var contRealpath = _pj.get('path')+'/'+contPath;
		var pathInfo = px.utils.parsePath(contPath);

		if( px.fs.existsSync( contRealpath ) ){
			contRealpath = px.fs.realpathSync( contRealpath );
		}

		$editor = $('<div>')
			.css({
				'position':'fixed',
				'top':0,
				'left':0 ,
				'z-index': '1000',
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
					.html('&times;')
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
						'height':'1.5em',
						'text-decoration': 'none'
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
