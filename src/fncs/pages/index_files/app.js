window.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }
	var it79 = require('iterate79');

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
		_currentPreviewPath;

	var contentsComment,
		pageLoader,
		pageFilter;

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

		contentsComment = new (require('./libs.ignore/contentsComment.js'))(_this, px, _pj);
		pageFilter = new (require('./libs.ignore/pageFilter.js'))(_this, px, _pj);

		// bootstrap
		$('*').tooltip();

		$preview
			.css({
				height: 600
			})
		;
		$previewIframe
			.bind('load', function(){
				// console.log('=-=-=-=-=-=-=-= iframe loaded.');
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

						it.next(prop);
					} ,
					function(it, prop){
						// console.log(prop);
						pageLoader.load( _currentPreviewPath, {}, function(){
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

					pageLoader = new (require('./libs.ignore/pageLoader.js'))(_this, px, _pj, contentsComment, $commentView, $previewIframe, $pageinfo, $childList, $workspaceFilter, _sitemap);
					pageLoader.load( _param.page_path||'/index.html', {}, function(){
						$(window).resize();
					} );
				});
			},
			function( errors ){
				// API設定が不十分な場合のエラー処理
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
	this.loadPreview = function( path, callback, opt ){
		callback = callback || function(){};
		if(!opt){ opt = {}; }
		if(!opt.force){ opt.force = false; }

		if( !path ){
			path = _pj.getConfig().path_top;
		}

		if( path.match(new RegExp('^alias[0-9]*\\:')) ){
			alert( 'このページはエイリアスです。' );
			return;
		}

		if( _lastPreviewPath == path && !opt.force ){
			// 前回ロードしたpathと同じなら、リロードをスキップ
			callback();
			return this;
		}
		// $pageinfo.html('<div style="text-align:center;">now loading ...</div>');

		_lastPreviewPath = path;
		px.preview.serverStandby( function(){
			$previewIframe.attr( 'src', px.preview.getUrl(path) );
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

	// 初期化処理開始
	$(function(){
		init();
		$(window).resize(function(){
			onWindowResize();
		});

	});

})( window.parent.px );
