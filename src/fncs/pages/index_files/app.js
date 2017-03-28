window.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var _sitemap = null;
	var _config = null;
	var $parent, $current, $childList;
	var $editor = $('<div>');
	var $preview,
		$previewIframe,
		$pageinfo,
		$commentView,
		$workspaceFilter;

	var _param = px.utils.parseUriParam( window.location.href );
	var _pj = this.pj = px.getCurrentProject();
	var _lastPreviewPath,
		_currentPreviewPath,
		_workspaceFilterKeywords='',
		_workspaceFilterListLabel='title';
	var it79 = px.it79;

	var ContentsComment = require('./libs.ignore/contentsComment.js'),
		contentsComment = new ContentsComment(_this, px, _pj);

	this.git = _pj.git();
	this.gitUi = new px2dtGitUi(px, _pj);

	/**
	 * 初期化
	 */
	function init(){
		$childList = $('.cont_sitemap_childlist');
		$preview = $('.cont_preview');
		$previewIframe = $preview.find('iframe');
		$pageinfo = $('.cont_page_info');
		$commentView = $('.cont_comment_view');
		$workspaceFilter = $('.cont_workspace_filter');

		// bootstrap
		$('*').tooltip();

		$preview
			.css({
				height: 600
			})
		;
		$previewIframe
			.bind('load', function(){
				var contProcType;

				it79.fnc({}, [
					function(it, prop){
						px.cancelDrop( $previewIframe.get(0).contentWindow );

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
						_currentPreviewPath = to;

						_this.pj.px2proj.get_page_info(_currentPreviewPath, function(pageInfo){
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
						// console.log(prop);
						_this.pj.getPageContentEditorMode( prop.pageInfo.path, function(editorMode){
							contProcType = editorMode;
							it.next(prop);
						} );
					} ,
					function(it, prop){

						var $bs3btn = $($('#template-bootstrap3-btn-dropdown-toggle').html());
						var $html = $('<div>')
							.append( $('<div class="cont_page_info-prop">')
								.append( $('<span>')
									.text( prop.pageInfo.title+'('+prop.pageInfo.path+')' )
								)
								.append( $('<span>')
									// .text( contProcType )
									.addClass( 'px2-editor-type__' + (function(contProcType){
										switch(contProcType){
											case 'html.gui': return 'html-gui'; break;
											case '.not_exists': return 'not-exists'; break;
											case '.page_not_exists': return 'page-not-exists'; break;
											default:
												break;
										}
										return contProcType;
									})(contProcType) )
								)
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

						// --------------------------------------
						// コンテンツコメント機能
						contentsComment.init( prop.pageInfo, $commentView );

						// --------------------------------------
						// ページフィルター機能
						var fileterTimer;
						$workspaceFilter.find('input[type=text]')
							.val(_workspaceFilterKeywords)
							.on('keyup', function(e){
								_workspaceFilterKeywords = $workspaceFilter.find('input[type=text]').val();
								// console.log(_workspaceFilterKeywords);
								clearTimeout(fileterTimer);
								fileterTimer = setTimeout(function(){
									_this.redraw();
								}, (e.keyCode==13 ? 0 : 1000)); // EnterKey(=13)なら、即座に再描画を開始
							})
						;
						$workspaceFilter.find('input[type=radio][name=list-label]')
							.on('change', function(){
								_workspaceFilterListLabel = $workspaceFilter.find('input[type=radio][name=list-label]:checked').val();
								// console.log(_workspaceFilterListLabel);
								clearTimeout(fileterTimer);
								fileterTimer = setTimeout(function(){
									_this.redraw();
								}, 1000);
							})
						;

						// --------------------------------------
						// メインの編集ボタンにアクションを付加
						$bs3btn.find('button.btn--edit').eq(0)
							.attr({'data-path': prop.pageInfo.path})
							// .text('編集する')
							.css({
								'padding-left': '5em',
								'padding-right': '5em'
							})
							.on('click', function(){
								_this.openEditor( $(this).attr('data-path') );
								return false;
							})
						;
						$bs3btn.find('button.btn--resources').eq(0)
							.attr({'data-path': prop.pageInfo.path})
							// .text('リソース')
							.on('click', function(){
								_this.openResourcesDirectory( $(this).attr('data-path') );
								return false;
							})
						;

						// --------------------------------------
						// ドロップダウンのサブメニューを追加

						if( contProcType != '.not_exists' ){
							$bs3btn.find('ul[role=menu]')
								.append( $('<li>')
									.append( $('<a>')
										.text( 'フォルダを開く' )
										.attr({
											'data-content': prop.pageInfo.content ,
											'href':'javascript:;'
										})
										.on('click', function(){
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
										.on('click', function(){
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
									.on('click', function(){
										$bs3btn.find('.dropdown-toggle').click();
										var $this = $(this);
										px.preview.serverStandby(function(){
											px.utils.openURL( px.preview.getUrl( $this.attr('data-path') ) );
										});
										return false;
									})
								)
							)
							.append( $('<li>')
								.append( $('<a>')
									.text( 'コンテンツのソースコードを表示' )
									.attr({
										'data-path': prop.pageInfo.path ,
										'href':'javascript:;'
									})
									.on('click', function(){
										$bs3btn.find('.dropdown-toggle').click();
										var pathCont = _pj.findPageContent( $(this).attr('data-path') );
										var src = px.fs.readFileSync( _pj.get_realpath_controot()+pathCont );
										px.dialog({
											title: 'コンテンツのソースコードを表示',
											body: $('<div>')
												.append( $('<p>').text('ソースの閲覧・確認ができます。ここで編集はできません。'))
												.append( $('<p>').text('GUI編集されたコンテンツの場合は、編集後にビルドされたソースが表示されています。'))
												.append( $('<textarea class="form-control">')
													.val(src)
													.attr({'readonly':true})
													.css({
														'width':'100%',
														'height':300,
														'font-size': 14,
														'font-family': 'monospace'
													})
												)
										});
										return false;
									})
								)
							)
							.append( $('<li>')
								.append( $('<a>')
									.text( 'ページ情報を表示' )
									.attr({
										'data-path': prop.pageInfo.path ,
										'data-page-info': JSON.stringify(prop.pageInfo),
										'href':'javascript:;'
									})
									.on('click', function(){
										$bs3btn.find('.dropdown-toggle').click();

										var pagePath = $(this).attr('data-path');
										var pageInfo = $(this).attr('data-page-info');
										try {
											pageInfo = JSON.parse(pageInfo);
										} catch (e) {
										}

										var $tbl = $('<table class="def">')
											.css({'width': '100%'})
										;
										for(var idx in pageInfo){
											var $row = $('<tr>');
											$row.append( $('<th>').text(idx) );
											$row.append( $('<td>').text(pageInfo[idx]) );
											// $row.append( $('<td>').text(typeof(pageInfo[idx])) );
											$tbl.append($row);
										}

										px.dialog({
											title: 'ページ情報を表示',
											body: $('<div>')
												.append( $('<p>').text('ページ「'+pagePath+'」の情報を確認できます。'))
												.append( $('<div>')
													.css({'margin': '1em 0'})
													.append($tbl)
												)
										});
										return false;
									})
								)
							)
						;
						$bs3btn.find('ul[role=menu]')
							.append( $('<li class="divider">') )
							.append( $('<li>')
								.append( $('<a>')
									.text( '埋め込みコメントを表示する' )
									.attr({
										'data-path': prop.pageInfo.path ,
										'href':'javascript:;'
									})
									.on('click', function(){
										$bs3btn.find('.dropdown-toggle').click();
										var $this = $(this);
										var bookmarklet = "javascript:(function(){var b=document.body;elm=document.createElement('script');elm.setAttribute('type','text/javascript');elm.src='http://tomk79.github.io/DEC/dec_show.js';b.appendChild(elm);b.removeChild(elm);return;})();";
										$previewIframe.get(0).contentWindow.location = bookmarklet;
										return false;
									})
								)
							)
						;
						$bs3btn.find('ul[role=menu]')
							.append( $('<li>')
								.append( $('<a>')
									.text( '素材フォルダを開く (--)' )
									.addClass('menu-materials')
									.attr({
										'data-path': prop.pageInfo.path ,
										'href':'javascript:;'
									})
									.on('click', function(){
										$bs3btn.find('.dropdown-toggle').click();
										_this.openMaterialsDirectory( $(this).attr('data-path') );
										return false;
									})
								)
							)
						;
						setTimeout(function(){
							var button = $bs3btn.find('a.menu-materials').eq(0);
							var pathFiles = _pj.getContentFilesByPageContent( _pj.findPageContent( prop.pageInfo.path ) );
							var realpathFiles = _pj.get_realpath_controot()+pathFiles;
							var realpath_matDir = realpathFiles + 'materials.ignore/';
							var matCount = 0;
							button.text('素材フォルダを開く ('+matCount+')');
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
										button.text('素材フォルダを開く ('+matCount+')');
									}else if( px.utils.isDirectory(path+'/'+list[idx]) ){
										countFile_r( path+'/'+list[idx] );
									}
								}
							}
							countFile_r(realpath_matDir);

						}, 10);

						$bs3btn.find('ul[role=menu]')
							.append( $('<li>')
								.append( $('<a>')
									.text( 'コンテンツコメントを編集' )
									.attr({
										'data-path': prop.pageInfo.path ,
										'href':'javascript:;'
									})
									.on('click', function(){
										$bs3btn.find('.dropdown-toggle').click();
										contentsComment.editComment();
										return false;
									})
								)
							)
						;

						$bs3btn.find('ul[role=menu]')
							.append( $('<li class="divider">') )
							.append( $('<li>')
								.append( $('<a>')
									.text( '他のページから複製して取り込む' )
									.attr({
										'data-path': prop.pageInfo.path ,
										'data-proc_type': contProcType ,
										'href':'javascript:;'
									})
									.on('click', function(){
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
													.addClass('px2-btn--primary')
													.on('click', function(){
														var val = $body.find('input').val();
														var pageinfo = _this.pj.site.getPageInfo(val);
														if( !pageinfo ){
															alert('存在しないページです。');
															return false;
														}
														_this.pj.copyContentsData(
															pageinfo.path,
															$this.attr('data-path'),
															function(result){
																if( !result[0] ){
																	alert('コンテンツの複製に失敗しました。'+result[1]);
																	return;
																}
																_this.loadPreview( _lastPreviewPath, function(){
																	px.closeDialog();
																}, {"force":true} );
															}
														);
													}),
												$('<button>')
													.text('Cancel')
													.on('click', function(){
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
										.on('click', function(){
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
										.on('click', function(){
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
													$('<button class="px2-btn px2-btn--primary">')
														.text('OK')
														.on('click', function(){
															var val = $body.find('input[name=proc_type]:checked').val();
															_pj.changeContentEditorMode( $this.attr('data-path'), val, function(result){
																if( !result[0] ){
																	alert('編集モードの変更に失敗しました。'+result[1]);
																	return;
																}
																_this.loadPreview( _lastPreviewPath, function(){
																	px.closeDialog();
																}, {"force":true} );
															} )
														}),
													$('<button class="px2-btn">')
														.text('キャンセル')
														.on('click', function(){
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
									.text( 'コンテンツをコミット' )
									.attr({
										'data-path': prop.pageInfo.path ,
										'href':'javascript:;'
									})
									.on('click', function(){
										_this.commitContents( $(this).attr('data-path') );
										$bs3btn.find('.dropdown-toggle').click();
										return false;
									})
								)
							)
						;
						$bs3btn.find('ul[role=menu]')
							.append( $('<li>')
								.append( $('<a>')
									.text( 'コンテンツのコミットログ' )
									.attr({
										'data-path': prop.pageInfo.path ,
										'href':'javascript:;'
									})
									.on('click', function(){
										_this.logContents( $(this).attr('data-path') );
										$bs3btn.find('.dropdown-toggle').click();
										return false;
									})
								)
							)
						;
						$bs3btn.find('ul[role=menu]')
							.append( $('<li>')
								.append( $('<a>')
									.text( 'ページをリロード' )
									.attr({
										'data-path': prop.pageInfo.path ,
										'href':'javascript:;'
									})
									.on('click', function(){
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
				]);

			})
		;

		_this.pj.checkPxCmdVersion(
			{
				apiVersion: '>=2.0.29',
				px2dthelperVersion: '>=2.0.3'
			},
			function(){
				// API設定OK
				_this.pj.site.updateSitemap(function(){
					_config = _this.pj.getConfig();
					_sitemap = _this.pj.site.getSitemap();
					_this.redraw();
					_this.loadPreview( _param.page_path, function(){
						$(window).resize();
					} );
				});
			},
			function( errors ){
				var html = px.utils.bindEjs(
					document.getElementById('template-not-enough-api-version').innerHTML,
					{errors: errors}
				);
				$('.contents').html( html );
			}
		);

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
	 * コンテンツをコミットする
	 */
	this.commitContents = function( page_path ){
		this.gitUi.commit('contents', {'page_path': page_path}, function(result){
			console.log('(コミット完了しました)');
		});
		return this;
	}


	/**
	 * コンテンツのコミットログを表示する
	 */
	this.logContents = function( page_path ){
		this.gitUi.log('contents', {'page_path': page_path}, function(result){
			console.log('(コミットログを表示しました)');
		});
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

		$('.cont_workspace_container')
			.css({
				'height': $(window).innerHeight() - $('.container').outerHeight() - $commentView.outerHeight() - $workspaceFilter.outerHeight() -20,
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

		if( path.match(new RegExp('^alias[0-9]*\\:')) ){
			alert( 'このページはエイリアスです。' );
			return;
		}

		if( _lastPreviewPath == path && !opt.force ){
			// 前回ロードしたpathと同じなら、リロードをスキップ
			cb();
			return this;
		}
		$pageinfo.html('<div style="text-align:center;">now loading ...</div>');

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

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				current = (typeof(current)==typeof('')?current:'');

				$childList.html('').append($ul);

				function isMatchKeywords(target){
					if( typeof(target) != typeof('') ){
						return false;
					}
					if( target.match(_workspaceFilterKeywords) ){
						return true;
					}
					return false;
				}
				it79.ary(
					_sitemap,
					function( it1, row, idx ){
						new Promise(function(rlv){rlv();})
							.then(function(){ return new Promise(function(rlv, rjt){
								// console.log(_sitemap[idx].title);
								if( _workspaceFilterKeywords.length ){
									if(
										!isMatchKeywords(_sitemap[idx].id) &&
										!isMatchKeywords(_sitemap[idx].path) &&
										!isMatchKeywords(_sitemap[idx].content) &&
										!isMatchKeywords(_sitemap[idx].title) &&
										!isMatchKeywords(_sitemap[idx].title_breadcrumb) &&
										!isMatchKeywords(_sitemap[idx].title_h1) &&
										!isMatchKeywords(_sitemap[idx].title_label) &&
										!isMatchKeywords(_sitemap[idx].title_full)
									){
										// console.log('=> skiped.');
										it1.next();
										return;
									}
								}
								$ul.append( $('<li>')
									.append( $('<a>')
										.text( function(){
											return _sitemap[idx][_workspaceFilterListLabel];
										} )
										.attr( 'href', 'javascript:;' )
										.attr( 'data-id', _sitemap[idx].id )
										.attr( 'data-path', _sitemap[idx].path )
										.attr( 'data-content', _sitemap[idx].content )
										.css({
											// ↓暫定だけど、階層の段をつけた。
											'padding-left': (function(pageInfo){
												if( _workspaceFilterListLabel != 'title' ){ return '1em'; }
												if( !_sitemap[idx].id.length ){ return '1em'; }
												if( !_sitemap[idx].logical_path.length ){ return '2em' }
												var rtn = ( (_sitemap[idx].logical_path.split('>').length + 1) * 1.3)+'em';
												return rtn;
											})(_sitemap[idx]),
											'font-size': '12px'
										})
										.click( function(){
											_this.loadPreview( $(this).attr('data-path'), function(){}, {"force":true} );
											// _this.openEditor( $(this).attr('data-path') );
										} )
									)
								);
								it1.next();
							}); })
						;
					},
					function(){
						rlv();
					}
				);
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){

				_this.pj.px2proj.get_page_info(_currentPreviewPath, function(pageInfo){
					$childList.find('a').removeClass('current');
					if( pageInfo !== null ){
						$childList.find('a[data-path="'+pageInfo.path+'"]').addClass('current');
					}
					rlv();
				});
				// $ul.listview();
			}); })
		;
		return;
	} // redraw()

	/**
	 * エディター画面を開く
	 */
	this.openEditor = function( pagePath ){
		var pageInfo = _pj.site.getPageInfo( pagePath );
		if( !pageInfo ){
			alert('ERROR: Undefined page path. - ' + pagePath);
			return this;
		}

		this.closeEditor();//一旦閉じる

		// プログレスモード表示
		px.progress.start({
			'blindness':true,
			'showProgressBar': true
		});

		var contPath = _pj.findPageContent( pagePath );
		var contRealpath = _pj.get('path')+'/'+contPath;
		var pathInfo = px.utils.parsePath(contPath);
		var pagePath = pageInfo.path;
		if( _pj.site.getPathType( pageInfo.path ) == 'dynamic' ){
			var dynamicPathInfo = _pj.site.get_dynamic_path_info(pageInfo.path);
			pagePath = dynamicPathInfo.path;
		}

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
						+'?page_path='+encodeURIComponent( pagePath )
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
						'bottom':5,
						'right':5,
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
	} // openEditor()

	/**
	 * エディター画面を閉じる
	 * 単に閉じるだけです。編集内容の保存などの処理は、editor.html 側に委ねます。
	 */
	this.closeEditor = function(){
		$editor.remove();
		$('body')
			.css({'overflow':'auto'})
		;
		_this.loadPreview( _currentPreviewPath, function(){}, {'force':true} );
		return this;
	}

	$(function(){
		init();
		$(window).resize(function(){
			onWindowResize();
		});

	});


})( window.parent.px );