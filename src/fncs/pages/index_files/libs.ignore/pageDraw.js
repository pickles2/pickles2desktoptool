/**
 * pageDraw.js
 */
module.exports = function(app, px, pj, $elms, contentsComment, _sitemap){
	var it79 = require('iterate79');
	var _this = this;
	var _last_page_path;
	var _workspaceFilterKeywords='',
		_workspaceFilterListLabel='title';

	/**
	 * ページを描画する
	 */
	this.draw = function(page_path, options, callback){
		callback = callback || function(){};

		if(_last_page_path == page_path){
			callback();
			return;
		}

		_last_page_path = page_path;

		var contProcType;

		it79.fnc({}, [
			function(it, prop){
				px.cancelDrop( $elms.previewIframe.get(0).contentWindow );

				pj.px2dthelperGetAll(page_path, {filter: false}, function(pjInfo){
					// console.log(pjInfo);
					prop.pageInfo = pjInfo.page_info;
					prop.navigationInfo = pjInfo.navigation_info;

					if( prop.pageInfo === null ){
						pj.px2dthelperGetAll('/', {filter: false}, function(pjInfo){
							prop.pageInfo = pjInfo.page_info;
							prop.navigationInfo = pjInfo.navigation_info;
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
				// --------------------
				// エディターモードを取得
				pj.getPageContentEditorMode( prop.pageInfo.path, function(editorMode){
					contProcType = editorMode;
					it.next(prop);
				} );
			} ,
			function(it, prop){

				// --------------------
				// ボタンアクションを設定
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
				contentsComment.init( prop.pageInfo, $elms.commentView );

				// --------------------------------------
				// ページフィルター機能
				var fileterTimer;
				$elms.workspaceFilter.find('input[type=text]')
					.val(_workspaceFilterKeywords)
					.off('keyup')
					.on('keyup', function(e){
						_workspaceFilterKeywords = $elms.workspaceFilter.find('input[type=text]').val();
						// console.log(_workspaceFilterKeywords);
						clearTimeout(fileterTimer);
						fileterTimer = setTimeout(function(){
							_this.draw(page_path, {}, function(){});
						}, (e.keyCode==13 ? 0 : 1000)); // EnterKey(=13)なら、即座に再描画を開始
					})
				;
				$elms.workspaceFilter.find('input[type=radio][name=list-label]')
					.off('change')
					.on('change', function(){
						_workspaceFilterListLabel = $elms.workspaceFilter.find('input[type=radio][name=list-label]:checked').val();
						// console.log(_workspaceFilterListLabel);
						clearTimeout(fileterTimer);
						fileterTimer = setTimeout(function(){
							_this.draw(page_path, {}, function(){});
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
						app.openEditor( $(this).attr('data-path') );
						return false;
					})
				;
				$bs3btn.find('button.btn--resources').eq(0)
					.attr({'data-path': prop.pageInfo.path})
					// .text('リソース')
					.on('click', function(){
						app.openResourcesDirectory( $(this).attr('data-path') );
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
									px.utils.openURL( px.utils.dirname( pj.get_realpath_controot()+$(this).attr('data-content') ) );
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
									var pathCont = pj.findPageContent( $(this).attr('data-path') );
									px.openInTextEditor( pj.get_realpath_controot()+pathCont );
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
								var pathCont = pj.findPageContent( $(this).attr('data-path') );
								var src = px.fs.readFileSync( pj.get_realpath_controot()+pathCont );
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
								$elms.previewIframe.get(0).contentWindow.location = bookmarklet;
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
								app.openMaterialsDirectory( $(this).attr('data-path') );
								return false;
							})
						)
					)
				;

				setTimeout(function(){
					var button = $bs3btn.find('a.menu-materials').eq(0);
					var pathFiles = pj.getContentFilesByPageContent( pj.findPageContent( prop.pageInfo.path ) );
					var realpathFiles = pj.get_realpath_controot()+pathFiles;
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
												var pageinfo = pj.site.getPageInfo(val);
												if( !pageinfo ){
													alert('存在しないページです。');
													return false;
												}
												pj.copyContentsData(
													pageinfo.path,
													$this.attr('data-path'),
													function(result){
														if( !result[0] ){
															alert('コンテンツの複製に失敗しました。'+result[1]);
															return;
														}
														app.loadPreview( _lastPreviewPath, function(){
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
									pj.buildGuiEditContent( pagePath, function(result){
										app.loadPreview( pagePath, function(){}, {'force':true} );
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
													pj.changeContentEditorMode( $this.attr('data-path'), val, function(result){
														if( !result[0] ){
															alert('編集モードの変更に失敗しました。'+result[1]);
															return;
														}
														app.loadPreview( _lastPreviewPath, function(){
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
								app.commitContents( $(this).attr('data-path') );
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
								app.logContents( $(this).attr('data-path') );
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
								app.loadPreview( pagePath, function(){}, {'force':true} );
								return false;
							})
						)
					)
				;

				$elms.pageinfo.html( $html );

				$bs3btn.find('li').css(
					{
						"max-width": $bs3btn.width(),
						"overflow": "hidden"
					}
				);

				// ページ一覧の表示更新
				$elms.childList.find('a').removeClass('current');
				$elms.childList.find('a[data-path="'+prop.pageInfo.path+'"]').addClass('current');

				$(window).resize();

				it.next(prop);
			} ,
			function(it, prop){

				if( _sitemap === null ){
					px.message('[ERROR] サイトマップが正常に読み込まれていません。');
					it.next(prop);
					return;
				}
				var $ul = $('<ul class="listview">');
				// $elms.childList.text( JSON.stringify(_sitemap) );

				new Promise(function(rlv){rlv();})
					.then(function(){ return new Promise(function(rlv, rjt){
						current = (typeof(current)==typeof('')?current:'');

						$elms.childList.html('').append($ul);

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
												.on('click', function(){
													app.loadPreview( $(this).attr('data-path'), function(){}, {"force":true} );
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

						pj.px2proj.get_page_info(page_path, function(pageInfo){
							$elms.childList.find('a').removeClass('current');
							if( pageInfo !== null ){
								$elms.childList.find('a[data-path="'+pageInfo.path+'"]').addClass('current');
							}
							rlv();
						});
						// $ul.listview();
					}); })
					.then(function(){ return new Promise(function(rlv, rjt){
						it.next(prop);
					}); })
				;
			} ,
			function(it, prop){
				app.loadPreview( page_path, function(){
					it.next(prop);
				} );
			} ,
			function(it, prop){
				callback();
			}
		]);
		return;
	}
}
