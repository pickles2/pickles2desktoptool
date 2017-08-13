window.px = window.parent.px;
window.contApp = new (function(){
	if( !px ){ alert('px が宣言されていません。'); }
	var it79 = require('iterate79');
	var _this = this;
	var pj = px.getCurrentProject();
	var status = pj.status();
	var multithemePluginFunctionName = 'tomk79\\pickles2\\multitheme\\theme::exec';
	var px2all,
		themePluginList,
		realpathThemeCollectionDir,
		themeCollection;
	var $elms = {'editor': $('<div>')};

	function init( callback ){
		it79.fnc({}, [
			function(it1, arg){
				// --------------------------------------
				// 依存APIのバージョンを確認
				pj.checkPxCmdVersion(
					{
						px2dthelperVersion: '>=2.0.6'
					},
					function(){
						// API設定OK
						it1.next(arg);
					},
					function( errors ){
						// API設定が不十分な場合のエラー処理
						// エラーだったらここで離脱。
						_this.pageNotEnoughApiVersion(errors);
						callback();
						return;
					}
				);
			},
			function(it1, arg){
				// --------------------------------------
				// Pickles 2 の各種情報から、
				// テーマプラグインの一覧を取得
				pj.px2dthelperGetAll('/', {}, function(result){
					px2all = result;
					// console.log(px2all);
					themePluginList = px2all.packages.package_list.themes;
					it1.next(arg);
					return;
				});
			},
			function(it1, arg){
				// --------------------------------------
				// テーマコレクションディレクトリのパスを求める
				pj.px2dthelperGetRealpathThemeCollectionDir(function(result){
					realpathThemeCollectionDir = result;
					it1.next(arg);
				});
			},
			function(it1, arg){
				// --------------------------------------
				// テーマコレクションをリスト化
				if( !px.utils79.is_dir(realpathThemeCollectionDir) ){
					// テーマディレクトリが存在しなければ終了
					var err = 'Theme Collection Dir is NOT exists.';
					console.log(err, realpathThemeCollectionDir);
					_this.pageNotEnoughApiVersion([err]);
					callback();
					return;
				}
				themeCollection = [];
				var ls = px.fs.readdirSync(realpathThemeCollectionDir);
				// console.log(ls);
				for( var idx in ls ){
					var isThemeExists = px.utils79.is_dir( realpathThemeCollectionDir+ls[idx]+'/' );
					if( isThemeExists ){
						themeCollection.push( ls[idx] );
					}
				}
				it1.next(arg);
			},
			function(it1, arg){
				// --------------------------------------
				// スタンバイ完了
				_this.pageHome();
				callback();
			}
		]);
	}

	/**
	 * ホーム画面を開く
	 */
	this.pageHome = function(){
		$('h1').text('テーマ');
		var html = px.utils.bindEjs(
			document.getElementById('template-list').innerHTML,
			{
				'themePluginList': themePluginList,
				'realpathThemeCollectionDir': realpathThemeCollectionDir,
				'themeCollection': themeCollection
			}
		);
		$('.contents').html( html );
	}

	/**
	 * テーマのホーム画面を開く
	 */
	this.pageThemeHome = function(themeId){
		console.log('Theme: '+themeId);
		$('h1').text('テーマ "'+themeId+'"');
		it79.fnc({}, [
			function(it1, arg){
				var ls = px.fs.readdirSync(realpathThemeCollectionDir+themeId);
				arg.layouts = [];
				for( var idx in ls ){
					if( px.utils79.is_file( realpathThemeCollectionDir+themeId+'/'+ls[idx] ) ){
						var layoutId = ls[idx];
						if( !layoutId.match(/\.html$/) ){continue;}
						layoutId = layoutId.replace(/\.[a-zA-Z0-9]+$/i, '');
						arg.layouts.push( layoutId );
					}
				}
				it1.next(arg);
			},
			function(it1, arg){
				var html = px.utils.bindEjs(
					document.getElementById('template-theme-home').innerHTML,
					{
						'themeId': themeId,
						'layouts': arg.layouts,
						'realpathThemeCollectionDir': realpathThemeCollectionDir
					}
				);
				$('.contents').html( html );
				it1.next(arg);
			},
			function(it1, arg){
				$('.contents').find('.cont-layout-list a button').on('click', function(e){
					e.stopPropagation();
				});
				it1.next(arg);
			}
		]);
		return;
	}

	/**
	 * 新規レイアウトを作成する
	 */
	this.addNewLayout = function(theme_id){
		alert('開発中です - '+theme_id);
		// TODO: モーダルダイアログを開き、 レイアウト名と編集モードを選択してもらう。
		return;
	}

	/**
	 * レイアウトを削除する
	 */
	this.deleteLayout = function(theme_id){
		alert('開発中です - '+theme_id);
		// TODO: モーダルダイアログを開き、 本当に削除してもよいという意志を確認してもらう。
		return;
	}

	/**
	 * APIバージョンが不十分(旧画面)
	 */
	this.pageNotEnoughApiVersion = function( errors ){
		var html = px.utils.bindEjs(
			document.getElementById('template-not-enough-api-version').innerHTML,
			{'errors': errors}
		);
		$('.contents').html( html );
	}

	/**
	 * エディター画面を開く
	 */
	this.openEditor = function( themeId, layoutId ){
		var realpathLayout = realpathThemeCollectionDir+themeId+'/'+layoutId+'.html';
		if( !px.utils79.is_file( realpathLayout ) ){
			alert('ERROR: Layout '+themeId + '/' + layoutId + ' is NOT exists.');
			return;
		}

		this.closeEditor();//一旦閉じる

		// プログレスモード表示
		px.progress.start({
			'blindness':true,
			'showProgressBar': true
		});

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
						+'?theme_id='+encodeURIComponent( themeId )
						+'&layout_id='+encodeURIComponent( layoutId )
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
					.on( 'click', function(){
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

		// px.progress.close();
		return;
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
		return;
	} // closeEditor()

	/**
	 * フォルダを開く
	 */
	this.openInFinder = function( theme_id ){
		var url = realpathThemeCollectionDir;
		if(theme_id){
			url += theme_id+'/';
		}
		px.fsEx.mkdirsSync( url );
		px.utils.openURL( url );
	}

	/**
	 * 外部テキストエディタで開く
	 */
	this.openInTextEditor = function( theme_id, layout_id ){
		var url = realpathThemeCollectionDir;
		if(theme_id){
			url += theme_id+'/';
		}
		if(layout_id){
			url += layout_id+'.html';
		}
		px.openInTextEditor( url );
	}

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

	/**
	 * イベント
	 */
	$(window).on('load', function(){
		init(function(){
			$(window).on('resize', function(){
				onWindowResize();
			});
			console.log('Standby.');
		});
	});

})();
