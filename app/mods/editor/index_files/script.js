window.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var it79 = px.it79;
	var php = px.php;
	var _pj = px.getCurrentProject();
	var pickles2ContentsEditor = new Pickles2ContentsEditor();

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
				// console.log(_pj.getGuiEngineName());
				if(_pj.getGuiEngineName() == 'broccoli-html-editor'){
					// broccoli-html-editor
					filename_editor = 'editor_broccoli';
				}else{
					// 旧GUI編集
					filename_editor = 'editor_gui';
				}
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

		// if( px.fs.existsSync( _cont_realpath ) ){
		// 	openEditor();
		// 	return this;
		// }

		var _page_url = px.preview.getUrl( _param.page_path );
		var elmA = document.createElement('a');
		elmA.href = _page_url;

		pickles2ContentsEditor.init(
			{
				'page_path': _param.page_path , // <- 編集対象ページのパス
				'elmCanvas': document.getElementById('canvas'), // <- 編集画面を描画するための器となる要素
				'preview':{ // プレビュー用サーバーの情報を設定します。
					'origin': elmA.origin
				},
				'gpiBridge': function(input, callback){
					// GPI(General Purpose Interface) Bridge
					// broccoliは、バックグラウンドで様々なデータ通信を行います。
					// GPIは、これらのデータ通信を行うための汎用的なAPIです。
					window.contAppPx2CEServer(px, input, function(rtn){
						// console.log(rtn);
						callback(rtn);
					});
					return;
				},
				'complete': function(){
					window.parent.contApp.closeEditor();
				},
				'onClickContentsLink': function( uri, data ){
					// console.log(url);
					// console.log(data);
					// function preg_quote(str, delimiter){
					// 	return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
					// }
					_page_url.match(new RegExp('^([a-zA-Z0-9]+\\:\\/\\/[^\\/]+\\/)'));
					var currentDomain = RegExp.$1;

					if( url.match( new RegExp(px.utils.escapeRegExp( currentDomain )) ) ){
						// プレビューサーバーのドメインと一致したら、通す。
					}else if( url.match( new RegExp('^(?:[a-zA-Z0-9]+\\:|\\/\\/)') ) ){
						alert('リンク先('+url+')は管理外のURLです。');
						return;
					}
					var to = url;
					var pathControot = px.preview.getUrl();
					to = to.replace( new RegExp( '^'+px.utils.escapeRegExp( pathControot ) ), '/' );
					to = to.replace( new RegExp( '^\\/+' ), '/' );

					if( to != _param.page_path ){
						if( !confirm( '"'+to+'" へ遷移しますか?' ) ){
							return;
						}
						window.parent.contApp.openEditor( to );
					}
				},
				'onMessage': function( message ){
					px.message(message);
				}
			},
			function(){
				// スタンバイ完了したら呼び出されるコールバックメソッドです。
				console.info('standby!!');
			}
		);
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
