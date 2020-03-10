window.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }
	var _this = this;
	var pj = this.pj = px.getCurrentProject();
	var it79 = px.it79;
	var utils79 = px.utils79;

	var pxConf,
		path_controot,
		path_homedir,
		realpath_datadir;

	var $content;
	var broccoli,
		broccoliStyleGuideGen;

	/**
	 * 初期化
	 */
	function init(){
		it79.fnc({},
			[
				function(it1, arg){
					pj.px2dthelperGetAll('/', {}, function(px2all){
						realpath_datadir = px2all.realpath_homedir+'_sys/ram/data/';
						it1.next(arg);
					});
					// console.log(arg);
				},
				function(it1, arg){
					$content = $('.contents');
					pxConf = pj.getConfig();
					console.log(pxConf);
					pj.px2proj.get_path_homedir(function(_homedir){
						console.log(_homedir);
						path_homedir = _homedir;
						path_controot = pj.get_realpath_controot();
						onWindowResize();
						it1.next(arg);
					});
				},
				function(it1, arg){
					// NodeJS版 broccoli を生成
					if( pj.getGuiEngineName() != 'broccoli-html-editor' ){
						it1.next(arg);
						return;
					}
					pj.createBroccoliServer('/index.html', function(b){
						broccoli = b;
						console.log(broccoli);
						it1.next(arg);
					});
				},
				function(it1, arg){
					// broccoliStyleGuideGen
					broccoliStyleGuideGen = new px.BroccoliStuleGuideGen({
						"siteTitle": pxConf.name,
						'gpiBridge': broccoliGpiBridge
					});
					// console.log(broccoliStyleGuideGen);
					it1.next(arg);
				},
				function(it1, arg){
					$('.contents').html('').append( $('<div>')
						.append( $('<p>')
							.text('この操作は、 登録されているモジュールのリストからスタイルガイドを生成します。')
						)
						.append( $('<p>')
							.text('ホームディレクトリに styleguide フォルダを生成します。')
						)
						.append( $('<button class="px2-btn px2-btn--primary cont-generate-styleguide">')
							.text('スタイルガイドを生成する')
							.on('click', function(e){
								console.log('start generating styleguide...');
								lockUIs(true);
								try {
									px.fs.mkdirSync( path_homedir+'styleguide/' );
								} catch (e) {
								}
								try {
									broccoliStyleGuideGen.generate(path_homedir+'styleguide/', function(result){
										px.message('スタイルガイドを生成しました。');
										lockUIs(false);
									});
								} catch (e) {
									console.error('ERROR: Failed to generate styleguide.', e);
								}
							})
						)
						.append( $('<button class="px2-btn cont-open-dir">')
							.text('出力先を開く')
							.on('click', function(e){
								if( !px.utils79.is_dir(path_homedir+'styleguide/') ){
									alert('スタイルガイドが生成されていません。');
									return false;
								}
								px.utils.openURL( path_homedir+'styleguide/' );
							})
						)
					);
					it1.next(arg);

				},
				function(it1, arg){
					console.info('standby OK.');
					it1.next(arg);
				}
			]
		);
	}// init()

	/**
	 * UIをロックする
	 */
	function lockUIs(toLockOn){
		if(toLockOn){
			px.progress.start({"showProgressBar":true, 'blindness':true});
			$('.cont-generate-styleguide').attr({'disabled': 'disabled'});
			$('.cont-open-dir').attr({'disabled': 'disabled'});
		}else{
			$('.cont-generate-styleguide').removeAttr('disabled');
			$('.cont-open-dir').removeAttr('disabled');
			px.progress.close();
		}
	}

	function broccoliGpiBridge(api, options, callback){
		// GPI(General Purpose Interface) Bridge
		// broccoliは、バックグラウンドで様々なデータ通信を行います。
		// GPIは、これらのデータ通信を行うための汎用的なAPIです。

		if( pj.getGuiEngineName() != 'broccoli-html-editor' ){
			// --------------------------------------
			// PHP版 Broccoli を使用
			var input = {
				api: "broccoliBridge",
				forBroccoli:{
					api: api,
					options: options
				},
				page_path: "/index.html"
			};

			// console.log('=-----=-----=', input);
			// var testTimestamp = (new Date()).getTime();
			var tmpFileName = '__tmp_'+utils79.md5( Date.now() )+'.json';
			px.fs.writeFileSync( realpath_datadir+tmpFileName, JSON.stringify(input) );
			pj.execPx2(
				input.page_path+'?PX=px2dthelper.px2ce.gpi&appMode=desktop&target_mode=&data_filename='+encodeURIComponent( tmpFileName ),
				{
					complete: function(rtn){
						// console.log('--- returned(millisec)', (new Date()).getTime() - testTimestamp);
						try{
							rtn = JSON.parse(rtn);
						}catch(e){
							console.error('Failed to parse JSON String -> ' + rtn);
						}
						px.fs.unlinkSync( realpath_datadir+tmpFileName );
						// pj.updateGitStatus(function(){});
						callback( rtn );
					}
				}
			);
			return;

		}else{
			// --------------------------------------
			// NodeJS版 Broccoli を使用
			broccoli.gpi(api, options, callback);
			callback( false );
			return;
		}

		return;
	}

	/**
	 * ウィンドウリサイズイベントハンドラ
	 */
	function onWindowResize(){
		$content.css({
			'height': $(window).height() - $('.container').eq(0).height() - 10
		});
	}

	$(function(){
		init();
		$(window).resize(function(){
			onWindowResize();
		});

	});

})( window.parent.px );
