window.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }
	var it79 = require('iterate79');

	var _this = this;
	var app = this;
	var _sitemap = null;
	var _config = null;
	var $elms = {};

	var _param = px.utils.parseUriParam( window.location.href );
	var _pj = this.pj = px.getCurrentProject();
	var _currentPagePath;

	var contentsComment,
		pageDraw,
		pageFilter;

	this.git = _pj.git();
	this.gitUi = new px2dtGitUi(px, _pj);

	/**
	 * 初期化
	 */
	function init(callback){
		callback = callback || function(){};
		it79.fnc({},[
			function(it1, arg){
				_this.pj.checkPxCmdVersion(
					{
						apiVersion: '>=2.0.29',
						px2dthelperVersion: '>=2.0.3'
					},
					function(){
						// API設定OK
						it1.next(arg);
					},
					function( errors ){
						// API設定が不十分な場合のエラー処理
						var html = px.utils.bindEjs(
							document.getElementById('template-not-enough-api-version').innerHTML,
							{errors: errors}
						);
						$('.contents').html( html );
						// エラーだったらここで離脱。
						callback();
						return;
					}
				);
			},
			function(it1, arg){
				$elms.editor = $('<div>');
				$elms.childList = $('.cont_sitemap_childlist');
				$elms.preview = $('.cont_preview');
				$elms.previewIframe = $elms.preview.find('iframe');
				$elms.pageinfo = $('.cont_page_info');
				$elms.commentView = $('.cont_comment_view');
				$elms.workspaceFilter = $('.cont_workspace_filter');

				// bootstrap
				$('*').tooltip();

				it1.next(arg);
			},
			function(it1, arg){
				_this.pj.site.updateSitemap(function(){
					_config = _this.pj.getConfig();
					_sitemap = _this.pj.site.getSitemap();
					it1.next(arg);
				});
			},
			function(it1, arg){
				$elms.preview
					.css({
						'height': 600
					})
				;
				$elms.previewIframe
					.on('load', function(){
						// console.log('=-=-=-=-=-=-=-= iframe loaded.');
						var contProcType;

						it79.fnc({}, [
							function(it, prop){
								px.cancelDrop( $elms.previewIframe.get(0).contentWindow );

								_currentPagePath = app.extractPagePathFromPreviewLocation();

								it.next(prop);
							} ,
							function(it, prop){
								// console.log(prop);
								pageDraw.redraw( _currentPagePath, {}, function(){
									it.next(prop);
								} );
							} ,
							function(it, prop){
								it.next(prop);
							} ,
							function(it, prop){
								callback();
							}
						]);

					})
				;
				it1.next(arg);
			},
			function(it1, arg){
				contentsComment = new (require('./libs.ignore/contentsComment.js'))(_this, px, _pj);
				pageDraw = new (require('./libs.ignore/pageDraw.js'))(_this, px, _pj, $elms, contentsComment, _sitemap);
				pageFilter = new (require('./libs.ignore/pageFilter.js'))(_this, px, _pj, $elms, _sitemap);
				it1.next(arg);
			},
			function(it1, arg){
				// フィルター機能を初期化
				pageFilter.init( function(){
					pageFilter.filter( function(){
						it1.next(arg);
					} );
				} );
			},
			function(it1, arg){
				// ページ情報を初期化
				pageDraw.init( function(){
					it1.next(arg);
				} );
			},
			function(it1, arg){
				// ページ情報を描画
				_this.goto( _param.page_path||'/index.html', {}, function(){
					it1.next(arg);
				} );
			},
			function(it1, arg){
				$(window).resize();
				it1.next(arg);
			},
			function(it1, arg){
				callback();
			}
		]);

	} // init()

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
	 * プレビューのURL から ページパスを抽出する
	 */
	this.extractPagePathFromPreviewLocation = function(previewLocation){
		if( !previewLocation ){
			previewLocation = $elms.previewIframe.get(0).contentWindow.location;
		}
		switch( previewLocation.href ){
			case 'blank':
			case 'about:blank':
				return;
		}
		var to = previewLocation.pathname;
		var pathControot = _pj.getConfig().path_controot;
		to = to.replace( new RegExp( '^'+px.utils.escapeRegExp( pathControot ) ), '' );
		to = to.replace( new RegExp( '^\\/*' ), '/' );

		var page_path = to;
		return page_path;
	}

	/**
	 * ウィンドウリサイズイベントハンドラ
	 */
	function onWindowResize(){
		$elms.editor
			.css({
				'height': $(window).innerHeight() -0
			})
		;

		$('.cont_workspace_container')
			.css({
				'height': $(window).innerHeight() - $('.container').outerHeight() - $elms.commentView.outerHeight() - $elms.workspaceFilter.outerHeight() -20,
				'margin-top': 10
			})
		;
		$elms.preview
			.css({
				'height': $('.cont_workspace_container').parent().outerHeight() - $elms.pageinfo.outerHeight() - 3
			})
		;

	}

	/**
	 * 指定ページへ移動する
	 */
	this.goto = function( page_path, options, callback ){
		callback = callback || function(){};
		console.log(_currentPagePath, page_path);
		if( _currentPagePath === page_path ){
			// 遷移先がカレントページを同じければ処理しない。
			callback();
			return;
		}

		_currentPagePath = page_path;
		pageDraw.redraw( page_path, options, function(){
			app.loadPreview( page_path, {}, function(){
				callback();
			} );
		} );
		return;
	}

	/**
	 * プレビューウィンドウにページを表示する
	 */
	this.loadPreview = function( page_path, options, callback ){
		callback = callback || function(){};
		if(!options){ options = {}; }
		if(!options.force){ options.force = false; }

		if( !page_path ){
			page_path = _pj.getConfig().path_top;
		}

		if( page_path.match(new RegExp('^alias[0-9]*\\:')) ){
			alert( 'このページはエイリアスです。' );
			return;
		}

		var currentPreviewPagePath = this.extractPagePathFromPreviewLocation();

		if( currentPreviewPagePath == page_path && !options.force ){
			// 現在表示中の `page_path` と同じなら、リロードをスキップ
			callback();
			return this;
		}
		// $elms.pageinfo.html('<div style="text-align:center;">now loading ...</div>');

		px.preview.serverStandby( function(){
			$elms.previewIframe.attr( 'src', px.preview.getUrl(page_path) );
			callback();
		} );
		return this;
	}

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

		$elms.editor = $('<div>')
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
			.append($elms.editor)
			.css({'overflow':'hidden'})
		;

		return this;
	} // openEditor()

	/**
	 * エディター画面を閉じる
	 * 単に閉じるだけです。編集内容の保存などの処理は、editor.html 側に委ねます。
	 */
	this.closeEditor = function(){
		$elms.editor.remove();
		$('body')
			.css({'overflow':'auto'})
		;
		_this.loadPreview( _currentPagePath, {'force':true}, function(){} );
		return this;
	}

	// 初期化処理開始
	$(function(){
		init();
		$(window).resize(function(){
			onWindowResize();
		});

	});

})( window.parent.px );
