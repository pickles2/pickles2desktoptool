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
		"click": function(){
			px.subapp();
		}
	});
	_menu.push({
		"label":px.lb.get('menu.sitemap'),
		"cond":"pxStandby",
		"area":"mainmenu",
		"app":"fncs/sitemap/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.theme'),
		"cond":"pxStandby",
		"area":"mainmenu",
		"app":"fncs/theme/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.pages'),
		"cond":"pxStandby",
		"area":"mainmenu",
		"app":"fncs/pages/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.publish'),
		"cond":"pxStandby",
		"area":"mainmenu",
		"app":"fncs/publish/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
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
		"label":px.lb.get('menu.openFolder'),
		"cond":"homeDirExists",
		"area":"shoulder",
		"app":null,
		"click": function(){
			px.getCurrentProject().open();
		}
	});
	_menu.push({
		"label":px.lb.get('menu.openInBrowser'),
		"cond":"pxStandby",
		"area":"shoulder",
		"app":null,
		"click": function(){
			px.openInBrowser();
		}
	});
	_menu.push({
		"label":px.lb.get('menu.openInTexteditor'),
		"cond":"homeDirExists",
		"area":"shoulder",
		"app":null,
		"click": function(){
			px.openInTextEditor( px.getCurrentProject().get('path') );
		}
	});
	_menu.push({
		"label":px.lb.get('menu.openInGitClient'),
		"cond":"homeDirExists",
		"area":"shoulder",
		"app":null,
		"click": function(){
			px.openInGitClient( px.getCurrentProject().get('path') );
		}
	});
	_menu.push({
		"label":px.lb.get('menu.openInTerminal'),
		"cond":"homeDirExists",
		"area":"shoulder",
		"app":null,
		"click": function(){
			px.openInTerminal( px.getCurrentProject().get('path') );
		}
	});
	_menu.push({
		"label":px.lb.get('menu.projectConfig'),
		"cond":"pxStandby",
		"area":"shoulder",
		"app":"fncs/config/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
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
		"label":px.lb.get('menu.module'),
		"cond":"pxStandby",
		"area":"shoulder",
		"app":"fncs/module/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.styleguideGenerator'),
		"cond":"pxStandby",
		"area":"shoulder",
		"app":"fncs/styleguide_generator/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.mkContentFilesByList'),
		"cond":"pxStandby",
		"area":"shoulder",
		"app":"fncs/make_content_files_by_list/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.mkContentFileList'),
		"cond":"pxStandby",
		"area":"shoulder",
		"app":"fncs/make_content_file_list/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.contentsProcessor'),
		"cond":"pxStandby",
		"area":"shoulder",
		"app":"fncs/contents_processor/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.moveContents'),
		"cond":"pxStandby",
		"area":"shoulder",
		"app":"fncs/move_contents/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
	});
	_menu.push({
		"label":px.lb.get('menu.updateGuiContents'),
		"cond":"pxStandby",
		"area":"shoulder",
		"app":"fncs/rebuild_guiedit_contents/index.html",
		"click": function(){
			px.subapp($(this).data('app'));
		}
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
	});
	_menu.push({
		"label":_appName+" "+px.lb.get('menu.desktoptoolConfig'),
		"cond":"always",
		"area":"shoulder",
		"app":null,
		"click": function(){
			px.editPx2DTConfig();
		}
	});
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
		"label":px.lb.get('menu.developerTool'),
		"cond":"always",
		"area":"shoulder",
		"app":null,
		"click": function(){
			// ブラウザの DevTools を開く
			nw.Window.get().showDevTools();
			// FYI: nodeJs の DevTools は スクリプト上から開けない
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
	this.drawGlobalMenu = function($shoulderMenu, _current_app){
		var cpj = px.getCurrentProject();
		var cpj_s = null;
		if( cpj !== null ){
			cpj_s = cpj.status()
		}

		for( var i in _menu ){
			if( _menu[i].cond == 'projectSelected' ){
				if( cpj === null ){
					continue;
				}
			}else if( _menu[i].cond == 'composerJsonExists' ){
				if( cpj === null || !cpj_s.composerJsonExists ){
					continue;
				}
			}else if( _menu[i].cond == 'homeDirExists' ){
				if( cpj === null || !cpj_s.homeDirExists ){
					continue;
				}
			}else if( _menu[i].cond == 'pxStandby' ){
				if( cpj === null || !cpj_s.isPxStandby ){
					continue;
				}
			}else if( _menu[i].cond != 'always' ){
				continue;
			}

			var $tmpMenu = $('<a>')
				.attr({"href":"javascript:;"})
				.on('click', _menu[i].click)
				.text(_menu[i].label)
				.data('app', _menu[i].app)
				.addClass( ( _current_app==_menu[i].app ? 'current' : '' ) )
			;

			switch( _menu[i].area ){
				case 'shoulder':
					$shoulderMenu.find('ul').append( $('<li>')
						.append( $tmpMenu )
					);
					break;
				default:
					$('.theme-header__gmenu ul').append( $('<li>')
						.append( $tmpMenu )
					);
					break;
			}
		}
		return;
	}

}
