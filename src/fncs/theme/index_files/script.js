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
		var html = px.utils.bindEjs(
			document.getElementById('template-theme-home').innerHTML,
			{
				'themeId': themeId,
				'realpathThemeCollectionDir': realpathThemeCollectionDir
			}
		);
		$('.contents').html( html );
		return;
	}

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
