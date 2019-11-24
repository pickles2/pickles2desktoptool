window.px = window.parent.main;
window.main = window.parent.main;
window.contApp = new (function( main ){
	var _this = this;
	var _pj = main.getCurrentProject();
	var remoteFinder;
	var $elms = {};
	$elms.editor = $('<div>');
	var mkfile = new (require('../../../fncs/files_and_folders/index_files/libs.ignore/mkfile.js'))(this, main, _pj, $);
	var mkdir = new (require('../../../fncs/files_and_folders/index_files/libs.ignore/mkdir.js'))(this, main, _pj, $);
	var open = new (require('../../../fncs/files_and_folders/index_files/libs.ignore/open.js'))(this, main, _pj, $);
	var copy = new (require('../../../fncs/files_and_folders/index_files/libs.ignore/copy.js'))(this, main, _pj, $);
	var rename = new (require('../../../fncs/files_and_folders/index_files/libs.ignore/rename.js'))(this, main, _pj, $);
	var remove = new (require('../../../fncs/files_and_folders/index_files/libs.ignore/remove.js'))(this, main, _pj, $);

	/**
	 * 初期化
	 */
	$(window).on('load', function(){
		remoteFinder = new RemoteFinder(
			document.getElementById('cont_finder'),
			{
				"gpiBridge": function(input, callback){
					// console.log(input);
					_pj.remoteFinder.gpi(input, function(result){
						callback(result);
					});
				},
				"mkfile": mkfile.mkfile,
				"mkdir": mkdir.mkdir,
				"open": open.open,
				"copy": copy.copy,
				"rename": rename.rename,
				"remove": remove.remove
			}
		);
		// console.log(remoteFinder);
		remoteFinder.init('/', {}, function(){
			console.log('ready.');
		});

		$(window).on('resize', function(){
			onWindowResize();
		});
	});

	/**
	 * エディター画面を開く
	 */
	this.openEditor = function( pagePath ){

		this.closeEditor();//一旦閉じる

		// プログレスモード表示
		main.progress.start({
			'blindness':true,
			'showProgressBar': true
		});

		var contPath = _pj.findPageContent( pagePath );
		var contRealpath = _pj.get('path')+'/'+contPath;
		var pathInfo = main.utils.parsePath(contPath);
		if( _pj.site.getPathType( pagePath ) == 'dynamic' ){
			var dynamicPathInfo = _pj.site.get_dynamic_path_info(pagePath);
			pagePath = dynamicPathInfo.path;
		}

		if( main.fs.existsSync( contRealpath ) ){
			contRealpath = main.fs.realpathSync( contRealpath );
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
					.on('click', function(){
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
		_pj.updateGitStatus();
		return this;
	} // closeEditor()

	/**
	 * ウィンドウリサイズイベントハンドラ
	 */
	function onWindowResize(){
		$elms.editor
			.css({
				'height': $(window).innerHeight() - 0
			})
		;
	}

})( window.parent.main );
