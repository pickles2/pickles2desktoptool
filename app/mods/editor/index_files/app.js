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
	var _cont_realpath = px.utils.dirname( _pj.get('path')+'/'+_pj.get('entry_script') )+'/'+_cont_path;
	var _cont_path_info = px.utils.parsePath(_cont_path);


	if( window.parent && window.parent.contApp && window.parent.contApp.loadPreview ){
		// 呼び出し元のプレビュー状態を同期する。
		window.parent.contApp.loadPreview(_param.page_path);
	}


	/**
	 * エディターを起動
	 */
	function openEditor(){
		var filename_editor = 'editor_default';
		var parsedPath = px.utils.parsePath(_cont_path);
		if( parsedPath.ext == 'html' || parsedPath.ext == 'htm' ){
			var datajson = px.utils.dirname( _pj.get('path')+'/'+_pj.get('entry_script') )+_pj.getContentFilesByPageContent(_cont_path)+'/guieditor.ignore/data.json';
			if( px.fs.existsSync( datajson ) ){
				filename_editor = 'editor_gui';
			}
		}

		window.location.href = './'+filename_editor+'.html?page_path='+encodeURIComponent( _param.page_path );
		return true;
	}

	/**
	 * エイリアスページのためのリダイレクト処理
	 */
	function redirectEditor( to ){
		// window.parent.contApp.openEditor( to );
		window.location.href = './index.html?page_path='+encodeURIComponent( to );
		return true;
	}

	/**
	 * リロード処理
	 */
	function reloadEditor(){
		// なぜこれだけ相対パスの起点が違うのか？？？ 謎...。
		window.location.href = './mods/editor/index.html?page_path='+encodeURIComponent( _param.page_path );
		return true;
	}

	this.createContent = function(val){
		_pj.initContentFiles( _param.page_path,
			{
				"proc_type": val ,
				success: function(){
					px.message('コンテンツを生成しました。');
					reloadEditor();
				} ,
				error: function(err){
					alert(err);
				}
			}
		);
		return true;
	}


	function resizeEvent(){
	}

	function init(){
		if( _pageInfo.path.match( new RegExp('^alias[0-9]*\\:(.*)$') ) ){
			// エイリアスはリダイレクトする
			var to = RegExp.$1;
			redirectEditor( to );
			return this;
		}

		if( px.fs.existsSync( _cont_realpath ) ){
			openEditor();
			return this;
		}

		$('.contents')
			.html('')
			.append(
				_.template( $('#cont_tpl_create_content').html() )
					({
						'basename': _cont_path_info.basename
					})
			)
		;

		px.cancelDrop( window );
		resizeEvent();

		px.progress.close();
		return this;
	}

	$(function(){
		init();
	})
	$(window).resize(function(){
		resizeEvent();
	});

})( window.parent.px );
