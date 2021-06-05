/**
 * globalmenu.js
 *
 * `main.lb` は、多言語対応機能です。
 * `app/common/language/language.csv` にある言語ファイルから、
 * ユーザーが選択した言語コードに対応するテキストを取り出します。
 */
module.exports = function(main){
	var _appName = main.packageJson.window.title;
	var nw = main.nw;
	var $ = main.$;




	/**
	 * 上書き可能なメニューの定義を取得
	 */
	function getOverwritableMenuDefinition(){

		var _overwritableMenuItems = {
			'*home': {
				"label":main.lb.get('menu.home'),
				"cond":"projectSelected",
				"area":"mainmenu",
				"app":"fncs/home/index.html",
				"href":"javascript:main.subapp();"
			},
			'*sitemaps': {
				"label":main.lb.get('menu.sitemaps'),
				"cond":"pxStandby",
				"area":"mainmenu",
				"app":"fncs/sitemaps/index.html",
				"href": "javascript:main.subapp('fncs/sitemaps/index.html');"
			},
			'*themes': {
				"label":main.lb.get('menu.themes'),
				"cond":"pxStandby",
				"area":"mainmenu",
				"app":"fncs/themes/index.html",
				"href": "javascript:main.subapp('fncs/themes/index.html');"
			},
			'*contents': {
				"label":main.lb.get('menu.contents'),
				"cond":"pxStandby",
				"area":"mainmenu",
				"app":"fncs/contents/index.html",
				"href": "javascript:main.subapp('fncs/contents/index.html');"
			},
			'*publish': {
				"label":main.lb.get('menu.publish'),
				"cond":"pxStandby",
				"area":"mainmenu",
				"app":"fncs/publish/index.html",
				"href": "javascript:main.subapp('fncs/publish/index.html');"
			},
			'*composer': {
				"label":main.lb.get('menu.composer'),
				"cond":"composerJsonExists",
				"area":"shoulder",
				"app":"fncs/composer/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			},
			'*modules': {
				"label":main.lb.get('menu.modules'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/modules/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			},
			'*git': {
				"label":main.lb.get('menu.git'),
				"cond":"homeDirExists",
				"area":"shoulder",
				"app":"fncs/git/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			},
			'*clearcache': {
				"label":main.lb.get('menu.clearcache'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/clearcache/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			},
			'*files-and-folders': {
				"label":main.lb.get('menu.filesAndFolders'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/files_and_folders/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			},
		};

		return _overwritableMenuItems;
	}


	/**
	 * グローバルメニューの定義を取得
	 */
	function getGlobalMenuDefinition(){
		let _overwritableMenuItems = getOverwritableMenuDefinition();

		var _menu = [];
		_menu.push( _overwritableMenuItems['*home'] );
		_menu.push( _overwritableMenuItems['*sitemaps'] );
		_menu.push( _overwritableMenuItems['*themes'] );
		_menu.push( _overwritableMenuItems['*contents'] );
		_menu.push( _overwritableMenuItems['*publish'] );
		_menu.push({
			"label":main.lb.get('menu.dashboard'),
			"cond":"projectSelected",
			"area":"shoulder",
			"app":"index.html",
			"click": function(){
				main.deselectProject();
				main.subapp();
			}
		});
		_menu.push({
			"label":main.lb.get('menu.openFolder'),
			"cond":"homeDirExists",
			"area":"shoulder",
			"app":null,
			"click": function(){
				main.getCurrentProject().open();
			}
		});
		_menu.push({
			"label":main.lb.get('menu.openInBrowser'),
			"cond":"pxStandby",
			"area":"shoulder",
			"app":null,
			"click": function(){
				main.openInBrowser();
			}
		});
		_menu.push({
			"label":main.lb.get('menu.openAppInBrowser'),
			"cond":"pxStandby",
			"area":"shoulder",
			"app":null,
			"click": function(){
				main.openAppInBrowser();
			}
		});
		_menu.push( _overwritableMenuItems['*modules'] );
		_menu.push({
			"label":main.lb.get('menu.config'),
			"cond":"pxStandby",
			"area":"shoulder",
			"submenu": [
				{
					"label":main.lb.get('menu.projectConfig'),
					"cond":"pxStandby",
					"area":"shoulder",
					"app":"fncs/config/index.html",
					"click": function(){
						main.subapp($(this).data('app'));
					}
				},
				{
					"label":main.lb.get('menu.projectIndividualConfig'),
					"cond":"pxStandby",
					"area":"shoulder",
					"app":null,
					"click": function(){
						main.getCurrentProject().editProjectIndividualConfig();
					}
				},
				{
					"label":_appName+" "+main.lb.get('menu.desktoptoolConfig'),
					"cond":"always",
					"area":"shoulder",
					"app":null,
					"click": function(){
						main.editPx2DTConfig();
					}
				}
			]
		});

		_menu.push( _overwritableMenuItems['*composer'] );
		_menu.push( _overwritableMenuItems['*git'] );
		_menu.push({
			"label":main.lb.get('menu.tool'),
			"cond":"pxStandby",
			"area":"shoulder",
			"submenu": [
				{
					"label":main.lb.get('menu.styleguideGenerator'),
					"cond":"pxStandby",
					"area":"shoulder",
					"app":"fncs/styleguide_generator/index.html",
					"click": function(){
						main.subapp($(this).data('app'));
					}
				},
				{
					"label":main.lb.get('menu.mkContentFilesByList'),
					"cond":"pxStandby",
					"area":"shoulder",
					"app":"fncs/make_content_files_by_list/index.html",
					"click": function(){
						main.subapp($(this).data('app'));
					}
				},
				{
					"label":main.lb.get('menu.mkContentFileList'),
					"cond":"pxStandby",
					"area":"shoulder",
					"app":"fncs/make_content_file_list/index.html",
					"click": function(){
						main.subapp($(this).data('app'));
					}
				},
				{
					"label":main.lb.get('menu.contentsProcessor'),
					"cond":"pxStandby",
					"area":"shoulder",
					"app":"fncs/contents_processor/index.html",
					"click": function(){
						main.subapp($(this).data('app'));
					}
				},
				{
					"label":main.lb.get('menu.moveContents'),
					"cond":"pxStandby",
					"area":"shoulder",
					"app":"fncs/move_contents/index.html",
					"click": function(){
						main.subapp($(this).data('app'));
					}
				},
				{
					"label":main.lb.get('menu.mkUnusedModuleList'),
					"cond":"pxStandby",
					"area":"shoulder",
					"app":"fncs/make_unused_module_list/index.html",
					"click": function(){
						main.subapp($(this).data('app'));
					}
				},
				{
					"label":main.lb.get('menu.updateGuiContents'),
					"cond":"pxStandby",
					"area":"shoulder",
					"app":"fncs/rebuild_guiedit_contents/index.html",
					"click": function(){
						main.subapp($(this).data('app'));
					}
				},
				{
					"label":main.lb.get('menu.preview'),
					"cond":"pxStandby",
					"area":"shoulder",
					"app":"fncs/preview/index.html",
					"click": function(){
						main.subapp($(this).data('app'));
					}
				},
				{
					"label":main.lb.get('menu.search'),
					"cond":"pxStandby",
					"area":"shoulder",
					"app":"fncs/search/index.html",
					"click": function(){
						main.subapp($(this).data('app'));
					}
				}
			]
		});
		_menu.push({
			"label":main.lb.get('menu.customConsoleExtensions'),
			"cond":"customConsoleExtensionsExists",
			"area":"shoulder",
			"submenu": [
			]
		});
		_menu.push({
			"label":main.lb.get('menu.externalTools'),
			"cond":"homeDirExists",
			"area":"shoulder",
			"submenu": [
				{
					"label":main.lb.get('menu.openInTexteditor'),
					"cond":"homeDirExists",
					"area":"shoulder",
					"app":null,
					"click": function(){
						main.openInTextEditor( main.getCurrentProject().get('path') );
					}
				},
				{
					"label":main.lb.get('menu.openInGitClient'),
					"cond":"homeDirExists",
					"area":"shoulder",
					"app":null,
					"click": function(){
						main.openInGitClient( main.getCurrentProject().get('path') );
					}
				},
				{
					"label":main.lb.get('menu.openInTerminal'),
					"cond":"homeDirExists",
					"area":"shoulder",
					"app":null,
					"click": function(){
						main.openInTerminal( main.getCurrentProject().get('path') );
					}
				}
			]
		});
		_menu.push( _overwritableMenuItems['*clearcache'] );
		_menu.push( _overwritableMenuItems['*files-and-folders'] );
		// _menu.push({
		// 	"label":"Reload(dev)",
		// 	"cond":"always",
		// 	"click": function(){
		// 		window.location.href='index.html?';
		// 	}
		// });
		_menu.push({
			"label":main.lb.get('menu.system'),
			"cond":"always",
			"area":"shoulder",
			"submenu": [
				{
					"label":main.lb.get('menu.systemInfo'),
					"cond":"always",
					"area":"shoulder",
					"app":null,
					"click": function(){
						var $iframe = $('<iframe>')
							.attr({
								'src': 'mods/systeminfo/index.html'
							})
							.css({
								'width':'100%',
								'height':460
							})
						;
						main.dialog({
							'title': main.lb.get('menu.systemInfo'),
							'body': $iframe
						});
					}
				},
				{
					"label":main.lb.get('menu.developerTool'),
					"cond":"always",
					"area":"shoulder",
					"app":null,
					"click": function(){
						// ブラウザの DevTools を開く
						nw.Window.get().showDevTools();
						// FYI: nodeJs の DevTools は スクリプト上から開けない
					}
				},
				{
					"label":_appName+" "+main.lb.get('menu.desktoptoolConfig'),
					"cond":"always",
					"area":"shoulder",
					"app":null,
					"click": function(){
						main.editPx2DTConfig();
					}
				},
				{
					"label":main.lb.get('menu.commandlog'),
					"cond":"always",
					"area":"shoulder",
					"app":null,
					"click": function(){
						main.commandQueue.show();
					}
				}
			]
		});
		if( main.packageJson.manifestUrl ){
			_menu.push({
				"label":main.lb.get('menu.checkForUpdate'),
				"cond":"always",
				"area":"shoulder",
				"app":null,
				"click": function(){
					main.updater.checkNewVersion();
				}
			});
		}
		_menu.push({
			"label":main.lb.get('menu.help'),
			"cond":"always",
			"area":"shoulder",
			"app":null,
			"click": function(){
				main.openHelp();
			}
		});
		_menu.push({
			"label":main.lb.get('menu.exit'),
			"cond":"always",
			"area":"shoulder",
			"app":null,
			"click": function(){
				main.exit();
			}
		});


		return _menu;
	}

	/**
	 * グローバルメニューを描画
	 */
	this.drawGlobalMenu = function($shoulderMenu, _current_app, _menuList, $parent){
		var cpj = main.getCurrentProject();
		var cpj_s = null;
		if( cpj !== null ){
			cpj_s = cpj.status();
		}
		var menuList = [];
		if(_menuList){
			menuList = _menuList;
		}else{
			menuList = getGlobalMenuDefinition();
		}

		for( var i in menuList ){
			if( menuList[i].cond == 'projectSelected' ){
				if( cpj === null ){
					continue;
				}
			}else if( menuList[i].cond == 'composerJsonExists' ){
				if( cpj === null || !cpj_s.composerJsonExists ){
					continue;
				}
			}else if( menuList[i].cond == 'homeDirExists' ){
				if( cpj === null || !cpj_s.homeDirExists ){
					continue;
				}
			}else if( menuList[i].cond == 'pxStandby' ){
				if( cpj === null || !cpj_s.isPxStandby ){
					continue;
				}
			}else if( menuList[i].cond == 'customConsoleExtensionsExists' ){
				if( cpj === null || !cpj_s.isPxStandby || !cpj_s.customConsoleExtensions ){
					continue;
				}
			}else if( menuList[i].cond != 'always' ){
				continue;
			}

			var $tmpMenu = $('<a>')
				.attr({
					"href":(menuList[i].href || "javascript:;"),
					"data-name": menuList[i].app
				})
				.text(menuList[i].label)
				.data('app', menuList[i].app)
				.addClass( ( _current_app==menuList[i].app ? 'current' : '' ) )
			;
			if( menuList[i].click ){
				$tmpMenu.on('click', menuList[i].click);
			}

			var $li = $('<li>');
			if( _menuList && $parent ){
				$parent.append( $li.append($tmpMenu) );
			}else{
				switch( menuList[i].area ){
					case 'shoulder':
						$shoulderMenu.find('>ul').append( $li
							.append( $tmpMenu )
						);
						break;
					default:
						$('.px2-header__global-menu > ul').append( $li
							.append( $tmpMenu )
						);
						break;
				}
			}

			if( menuList[i].submenu ){
				var $ul = $( '<ul>' );
				$li.append( $ul );
				if( menuList[i].cond == 'customConsoleExtensionsExists' && cpj_s.customConsoleExtensions ){
					// Custom Console Extensions サブメニューの処理
					var $cceLi = $('<li>');
					for(var cce_id in cpj_s.customConsoleExtensions){
						var cceInfo = cpj_s.customConsoleExtensions[cce_id];
						var appPath = 'fncs/custom_console_extensions/index.html?cce_id='+encodeURIComponent(cce_id);
						$cceLi.append(
							$('<a>')
								.text(cceInfo.label)
								.attr({
									"href":"javascript:;",
									"data-name": appPath
								})
								.data('app', appPath)
								.addClass( ( _current_app==appPath ? 'current' : '' ) )
								.on('click', function(){
									main.subapp($(this).data('app'));
								})
						);
						$ul.append($cceLi);
					}
				}else{
					// サブメニュー一般の処理
					this.drawGlobalMenu($shoulderMenu, _current_app, menuList[i].submenu, $ul);
				}
			}
		}
		return;
	}

}
