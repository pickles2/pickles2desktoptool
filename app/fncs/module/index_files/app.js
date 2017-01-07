window.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }
	var _this = this;
	var pj = this.pj = px.getCurrentProject();
	var it79 = px.it79;

	var pxConf,
		path_controot;

	var $content;
	var broccoli;

	/**
	 * 初期化
	 */
	function init(){
		it79.fnc({},
			[
				function(it1, arg){
					$content = $('.contents');
					pxConf = pj.getConfig();
					path_controot = pj.get_realpath_controot();
					it1.next(arg);
				},
				function(it1, arg){
					// broccoliオブジェクトを生成
					pj.createPickles2ContentsEditorServer(pxConf.path_top||'/', function(px2ce){
						px2ce.createBroccoli(function(_broccoli){
							broccoli = _broccoli;
							// console.log(broccoli);
							it1.next(arg);
						});
					});
				},
				function(it1, arg){
					// モジュールパッケージの一覧を表示する。
					// console.log(modules);
					_this.page_modulePackageList(function(){
						it1.next(arg);
					});
				},
				function(it1, arg){
					console.info('standby OK.');
					it1.next(arg);
				}
			]
		);
	}// init()

	/**
	 * モジュールパッケージ一覧画面を表示する
	 */
	this.page_modulePackageList = function(callback){
		callback = callback || function(){};

		broccoli.getPackageList(function(packageList){
			console.log('getPackageList', packageList);

			var tpl = document.getElementById('template-module-list-package').innerHTML;
			var html = px.utils.bindEjs(
				tpl,
				{'packageList': packageList}
			);
			$content.html('').append(html);

			callback();
		});

		return;
	}

	/**
	 * ウィンドウリサイズイベントハンドラ
	 */
	function onWindowResize(){
	}

	$(function(){
		init();
		$(window).resize(function(){
			onWindowResize();
		});

	});

})( window.parent.px );
