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
				// --------------------------------------
				// Pickles 2 の各種情報から、
				// テーマプラグインの一覧を取得
				pj.px2proj.query(
					'/?PX=px2dthelper.get.all',
					{
						"output": "json",
						"complete": function(result, code){
							px2all = JSON.parse(result);
							// console.log(px2all);
							themePluginList = px2all.packages.package_list.themes;
							it1.next(arg);
							return;
						}
					}
				);
			},
			function(it1, arg){
				// --------------------------------------
				// テーマコレクションディレクトリのパスを求める
				realpathThemeCollectionDir = px2all.realpath_homedir+'themes/';
				pj.px2proj.query(
					'/?PX=px2dthelper.plugins.get_plugin_options&func_div=processor.html&plugin_name='+encodeURIComponent(multithemePluginFunctionName),
					{
						"output": "json",
						"complete": function(result, code){
							try {
								result = JSON.parse(result);
								// console.log(result);
								if( result[0].options.path_theme_collection ){
									realpathThemeCollectionDir = require('path').resolve( px2all.realpath_docroot + px2all.path_controot, result[0].options.path_theme_collection )+'/';
								}
							} catch (e) {
							}
							// console.log(realpathThemeCollectionDir);
							it1.next(arg);
							return;
						}
					}
				);
			},
			function(it1, arg){
				// --------------------------------------
				// テーマコレクションをリスト化
				themeCollection = [];
				var ls = px.fs.readdirSync(realpathThemeCollectionDir);
				// console.log(ls);
				for( var idx in ls ){
					var isThemeExists = px.utils79.is_file( realpathThemeCollectionDir+ls[idx]+'/default.html' );
					if( isThemeExists ){
						themeCollection.push( ls[idx] );
					}
				}
				it1.next(arg);
			},
			function(it1, arg){
				// --------------------------------------
				// スタンバイ完了
				_this.openHome();
				callback();
			}
		]);
	}

	/**
	 * フォルダを開く
	 */
	this.openInFinder = function(){
		px.utils.openURL( realpathThemeCollectionDir );
	}

	/**
	 * 外部テキストエディタで開く
	 */
	this.openInTextEditor = function(){
		px.openInTextEditor( realpathThemeCollectionDir );
	}

	/**
	 * ホーム画面を開く
	 */
	this.openHome = function(){
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
	this.openThemeHome = function(themeId){
		console.log('Theme: '+themeId);
		it79.fnc({}, [
			function(it1, arg){
				var ls = px.fs.readdirSync(realpathThemeCollectionDir+themeId);
				arg.layouts = [];
				for( var idx in ls ){
					if( px.utils79.is_file( realpathThemeCollectionDir+themeId+'/'+ls[idx] ) ){
						var layoutId = ls[idx];
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
			}
		]);
		return;
	}

	/**
	 * エディター画面を開く
	 */
	this.openEditor = function( themeId, layoutId ){
		alert(themeId + '/' + layoutId + ': 開発中です');

		// var pageInfo = _pj.site.getPageInfo( pagePath );
		// if( !pageInfo ){
		// 	alert('ERROR: Undefined page path. - ' + pagePath);
		// 	return this;
		// }
		//
		// this.closeEditor();//一旦閉じる
		//
		// // プログレスモード表示
		// px.progress.start({
		// 	'blindness':true,
		// 	'showProgressBar': true
		// });
		//
		// var contPath = _pj.findPageContent( pagePath );
		// var contRealpath = _pj.get('path')+'/'+contPath;
		// var pathInfo = px.utils.parsePath(contPath);
		// var pagePath = pageInfo.path;
		// if( _pj.site.getPathType( pageInfo.path ) == 'dynamic' ){
		// 	var dynamicPathInfo = _pj.site.get_dynamic_path_info(pageInfo.path);
		// 	pagePath = dynamicPathInfo.path;
		// }
		//
		// if( px.fs.existsSync( contRealpath ) ){
		// 	contRealpath = px.fs.realpathSync( contRealpath );
		// }
		//
		// $elms.editor = $('<div>')
		// 	.css({
		// 		'position':'fixed',
		// 		'top':0,
		// 		'left':0 ,
		// 		'z-index': '1000',
		// 		'width':'100%',
		// 		'height':$(window).height()
		// 	})
		// 	.append(
		// 		$('<iframe>')
		// 			//↓エディタ自体は別のHTMLで実装
		// 			.attr( 'src', '../../mods/editor/index.html'
		// 				+'?page_path='+encodeURIComponent( pagePath )
		// 			)
		// 			.css({
		// 				'border':'0px none',
		// 				'width':'100%',
		// 				'height':'100%'
		// 			})
		// 	)
		// 	.append(
		// 		$('<a>')
		// 			.html('&times;')
		// 			.attr('href', 'javascript:;')
		// 			.click( function(){
		// 				// if(!confirm('編集中の内容は破棄されます。エディタを閉じますか？')){ return false; }
		// 				_this.closeEditor();
		// 			} )
		// 			.css({
		// 				'position':'absolute',
		// 				'bottom':5,
		// 				'right':5,
		// 				'font-size':'18px',
		// 				'color':'#333',
		// 				'background-color':'#eee',
		// 				'border-radius':'0.5em',
		// 				'border':'1px solid #333',
		// 				'text-align':'center',
		// 				'opacity':0.4,
		// 				'width':'1.5em',
		// 				'height':'1.5em',
		// 				'text-decoration': 'none'
		// 			})
		// 			.hover(function(){
		// 				$(this).animate({
		// 					'opacity':1
		// 				});
		// 			}, function(){
		// 				$(this).animate({
		// 					'opacity':0.4
		// 				});
		// 			})
		// 	)
		// ;
		// $('body')
		// 	.append($elms.editor)
		// 	.css({'overflow':'hidden'})
		// ;

		return;
	} // openEditor()

	/**
	 * イベント
	 */
	$(window).on('load', function(){
		init(function(){
			// console.log(themePluginList);
			// console.log(realpathThemeCollectionDir);
			// console.log(themeCollection);
			console.log('Standby.');
		});
	});

})();
