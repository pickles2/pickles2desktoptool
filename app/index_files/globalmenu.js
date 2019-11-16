/**
 * globamenu.js
 *
 * `px.lb` は、多言語対応機能です。
 * `app/common/language/language.csv` にある言語ファイルから、
 * ユーザーが選択した言語コードに対応するテキストを取り出します。
 */
module.exports = function(px){
	var _appName = px.packageJson.window.title;
	var nw = px.nw;
	var $ = px.$;

	var _menu = [];
	_menu.push({
		"label":px.lb.get('menu.home'),
		"cond":"projectSelected",
		"area":"mainmenu",
		"app":"fncs/home/index.html",
		"href":"javascript:px.subapp();"
	});
	_menu.push({
		"label":px.lb.get('menu.sitemap'),
		"cond":"pxStandby",
		"area":"mainmenu",
		"app":"fncs/sitemap/index.html",
		"href": "javascript:px.subapp('fncs/sitemap/index.html');"
	});
	_menu.push({
		"label":px.lb.get('menu.theme'),
		"cond":"pxStandby",
		"area":"mainmenu",
		"app":"fncs/theme/index.html",
		"href": "javascript:px.subapp('fncs/theme/index.html');"
	});
	_menu.push({
		"label":px.lb.get('menu.pages'),
		"cond":"pxStandby",
		"area":"mainmenu",
		"app":"fncs/pages/index.html",
		"href": "javascript:px.subapp('fncs/pages/index.html');"
	});
	_menu.push({
		"label":px.lb.get('menu.publish'),
		"cond":"pxStandby",
		"area":"mainmenu",
		"app":"fncs/publish/index.html",
		"href": "javascript:px.subapp('fncs/publish/index.html');"
	});
	_menu.push({
		"label":px.lb.get('menu.dashboard'),
		"cond":"projectSelected",
		"area":"shoulder",
		"app":"index.html",
		"click": function(){
			px.deselectProject();
			px.subapp();
		}
	});
	_menu.push({
		"label":px.lb.get('menu.externalTools'),
		"cond":"homeDirExists",
		"area":"shoulder",
		"submenu": [
			{
				"label":px.lb.get('menu.openFolder'),
				"cond":"homeDirExists",
				"area":"shoulder",
				"app":null,
				"click": function(){
					px.getCurrentProject().open();
				}
			},
			{
				"label":px.lb.get('menu.openInBrowser'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":null,
				"click": function(){
					px.openInBrowser();
				}
			},
			{
				"label":px.lb.get('menu.openAppInBrowser'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":null,
				"click": function(){
					px.openAppInBrowser();
				}
			},
			{
				"label":px.lb.get('menu.openInTexteditor'),
				"cond":"homeDirExists",
				"area":"shoulder",
				"app":null,
				"click": function(){
					px.openInTextEditor( px.getCurrentProject().get('path') );
				}
			},
			{
				"label":px.lb.get('menu.openInGitClient'),
				"cond":"homeDirExists",
				"area":"shoulder",
				"app":null,
				"click": function(){
					px.openInGitClient( px.getCurrentProject().get('path') );
				}
			},
			{
				"label":px.lb.get('menu.openInTerminal'),
				"cond":"homeDirExists",
				"area":"shoulder",
				"app":null,
				"click": function(){
					px.openInTerminal( px.getCurrentProject().get('path') );
				}
			}
		]
	});
	_menu.push({
		"label":px.lb.get('menu.config'),
		"cond":"pxStandby",
		"area":"shoulder",
		"submenu": [
			{
				"label":px.lb.get('menu.projectConfig'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/config/index.html",
				"click": function(){
					px.subapp($(this).data('app'));
				}
			},
			{
				"label":_appName+" "+px.lb.get('menu.desktoptoolConfig'),
				"cond":"always",
				"area":"shoulder",
				"app":null,
				"click": function(){
					px.editPx2DTConfig();
				}
			}
		]
	});

	_menu.push({
		"label":px.lb.get('menu.composer'),
		"cond":"composerJsonExists",
		"area":"shoulder",
		"app":"fncs/composer/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.git'),
		"cond":"homeDirExists",
		"area":"shoulder",
		"app":"fncs/git/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.module'),
		"cond":"pxStandby",
		"area":"shoulder",
		"app":"fncs/module/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.tool'),
		"cond":"pxStandby",
		"area":"shoulder",
		"submenu": [
			{
				"label":px.lb.get('menu.styleguideGenerator'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/styleguide_generator/index.html",
				"click": function(){
					px.subapp($(this).data('app'));
				}
			},
			{
				"label":px.lb.get('menu.mkContentFilesByList'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/make_content_files_by_list/index.html",
				"click": function(){
					px.subapp($(this).data('app'));
				}
			},
			{
				"label":px.lb.get('menu.mkContentFileList'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/make_content_file_list/index.html",
				"click": function(){
					px.subapp($(this).data('app'));
				}
			},
			{
				"label":px.lb.get('menu.contentsProcessor'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/contents_processor/index.html",
				"click": function(){
					px.subapp($(this).data('app'));
				}
			},
			{
				"label":px.lb.get('menu.moveContents'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/move_contents/index.html",
				"click": function(){
					px.subapp($(this).data('app'));
				}
			},
			{
				"label":px.lb.get('menu.updateGuiContents'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/rebuild_guiedit_contents/index.html",
				"click": function(){
					px.subapp($(this).data('app'));
				}
			}
		]
	});
	_menu.push({
		"label":px.lb.get('menu.clearcache'),
		"cond":"pxStandby",
		"area":"shoulder",
		"app":"fncs/clearcache/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.filesAndFolders'),
		"cond":"pxStandby",
		"area":"shoulder",
		"app":"fncs/files_and_folders/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	// _menu.push({
	// 	"label":"Reload(dev)",
	// 	"cond":"always",
	// 	"click": function(){
	// 		window.location.href='index.html?';
	// 	}
	// });
	_menu.push({
		"label":px.lb.get('menu.preview'),
		"cond":"pxStandby",
		"area":"shoulder",
		"app":"fncs/preview/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.search'),
		"cond":"pxStandby",
		"area":"shoulder",
		"app":"fncs/search/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.system'),
		"cond":"always",
		"area":"shoulder",
		"submenu": [
			{
				"label":px.lb.get('menu.systemInfo'),
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
					px.dialog({
						'title': px.lb.get('menu.systemInfo'),
						'body': $iframe
					});
				}
			},
			{
				"label":px.lb.get('menu.developerTool'),
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
				"label":_appName+" "+px.lb.get('menu.desktoptoolConfig'),
				"cond":"always",
				"area":"shoulder",
				"app":null,
				"click": function(){
					px.editPx2DTConfig();
				}
			},
			{
				"label":px.lb.get('menu.commandlog'),
				"cond":"always",
				"area":"shoulder",
				"app":null,
				"click": function(){
					px.commandQueue.show();
				}
			}
		]
	});
	if( px.packageJson.manifestUrl ){
		_menu.push({
			"label":px.lb.get('menu.checkForUpdate'),
			"cond":"always",
			"area":"shoulder",
			"app":null,
			"click": function(){
				px.updater.checkNewVersion();
			}
		});
	}
	_menu.push({
		"label":px.lb.get('menu.help'),
		"cond":"always",
		"area":"shoulder",
		"app":null,
		"click": function(){
			px.openHelp();
		}
	});
	_menu.push({
		"label":px.lb.get('menu.exit'),
		"cond":"always",
		"area":"shoulder",
		"app":null,
		"click": function(){
			px.exit();
		}
	});

	/**
	 * グローバルメニューの定義を取得
	 */
	this.getGlobalMenuDefinition = function(){
		return _menu;
	}

	/**
	 * グローバルメニューを描画
	 */
	this.drawGlobalMenu = function($shoulderMenu, _current_app, _menuList, $parent){
		var cpj = px.getCurrentProject();
		var cpj_s = null;
		if( cpj !== null ){
			cpj_s = cpj.status()
		}
		var menuList = [];
		if(_menuList){
			menuList = _menuList;
		}else{
			menuList = _menu;
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
				this.drawGlobalMenu($shoulderMenu, _current_app, menuList[i].submenu, $ul);
			}
		}
		return;
	}

}
