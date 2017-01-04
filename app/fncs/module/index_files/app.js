window.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }
	var _this = this;
	var pj = this.pj = px.getCurrentProject();
	var it79 = px.it79;

	var pxConf,
		path_controot,
		modules={};

	var $content;

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
					// console.log(pxConf);
					modules = {};
					try {
						modules = pxConf.plugins.px2dt.paths_module_template;
						for(var i in modules){
							modules[i] = px.path.resolve(path_controot, modules[i])+'/';
							modules[i] = px.utils79.normalize_path(modules[i]);
						}
					} catch (e) {
					}
					it1.next(arg);
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

		var tpl = document.getElementById('template-module-list-package').innerHTML;
		var html = px.utils.bindEjs(
			tpl,
			{'modules': modules}
		);
		$content.html('').append(html);

		callback();
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
