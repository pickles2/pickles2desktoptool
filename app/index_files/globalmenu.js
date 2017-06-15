/**
 * globamenu.js
 */
module.exports = function(px){
	var _appName = px.packageJson.window.title;
	var nw = px.nw;
	var _menu = [
		{"label":px.lb.get('menu.home'),                 "cond":"projectSelected",    "area":"mainmenu", "app":"fncs/home/index.html", "cb": function(){px.subapp();}} ,
		{"label":px.lb.get('menu.sitemap'),         "cond":"pxStandby",          "area":"mainmenu", "app":"fncs/sitemap/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":px.lb.get('menu.theme'),               "cond":"pxStandby",          "area":"mainmenu", "app":"fncs/theme/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":px.lb.get('menu.pages'),           "cond":"pxStandby",          "area":"mainmenu", "app":"fncs/pages/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":px.lb.get('menu.publish'),         "cond":"pxStandby",          "area":"mainmenu", "app":"fncs/publish/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":px.lb.get('menu.dashboard'),      "cond":"projectSelected",    "area":"shoulder", "app":"index.html", "cb": function(){px.deselectProject();px.subapp();}} ,
		{"label":px.lb.get('menu.openFolder'),       "cond":"homeDirExists",      "area":"shoulder", "app":null, "cb": function(){px.getCurrentProject().open();}},
		{"label":px.lb.get('menu.openInBrowser'),       "cond":"pxStandby",          "area":"shoulder", "app":null, "cb": function(){px.openInBrowser();}},
		{"label":px.lb.get('menu.openInTexteditor'), "cond":"homeDirExists",      "area":"shoulder", "app":null, "cb": function(){px.openInTextEditor( px.getCurrentProject().get('path') );}},
		{"label":px.lb.get('menu.openInTerminal'), "cond":"homeDirExists",      "area":"shoulder", "app":null, "cb": function(){px.openInTerminal( px.getCurrentProject().get('path') );}},
		{"label":px.lb.get('menu.projectConfig'),     "cond":"pxStandby",          "area":"shoulder", "app":"fncs/config/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":px.lb.get('menu.composer'),             "cond":"composerJsonExists", "area":"shoulder", "app":"fncs/composer/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":px.lb.get('menu.git'),                  "cond":"homeDirExists",      "area":"shoulder", "app":"fncs/git/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":px.lb.get('menu.preview'),           "cond":"pxStandby",          "area":"shoulder", "app":"fncs/preview/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":px.lb.get('menu.moveContents'), "cond":"pxStandby",          "area":"shoulder", "app":"fncs/movecontents/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":px.lb.get('menu.search'),               "cond":"pxStandby",          "area":"shoulder", "app":"fncs/search/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":px.lb.get('menu.module'),               "cond":"pxStandby",          "area":"shoulder", "app":"fncs/module/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":px.lb.get('menu.styleguideGenerator'),  "cond":"pxStandby",          "area":"shoulder", "app":"fncs/styleguide_generator/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":px.lb.get('menu.contentsProcessor'),"cond":"pxStandby",          "area":"shoulder", "app":"fncs/contents_processor/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":px.lb.get('menu.updateGuiContents'),"cond":"pxStandby",          "area":"shoulder", "app":"fncs/rebuild_guiedit_contents/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		{"label":px.lb.get('menu.clearcache'),     "cond":"pxStandby",          "area":"shoulder", "app":"fncs/clearcache/index.html", "cb": function(){px.subapp($(this).data('app'));}} ,
		// {"label":"Reload(dev)",          "cond":"always", "cb": function(){window.location.href='index.html?';}} ,
		{"label":px.lb.get('menu.systemInfo'),         "cond":"always",             "area":"shoulder", "app":null, "cb": function(){px.dialog({
			title: px.lb.get('menu.systemInfo'),
			body: $('<iframe>').attr('src', 'mods/systeminfo/index.html').css({'width':'100%','height':460})
		});}} ,
		{"label":_appName+" "+px.lb.get('menu.desktoptoolConfig'), "cond":"always",        "area":"shoulder", "app":null, "cb": function(){px.editPx2DTConfig();}} ,
		{"label":px.lb.get('menu.help'), "cond":"always", "area":"shoulder", "app":null, "cb": function(){px.openHelp();} },
		{"label":px.lb.get('menu.developerTool'), "cond":"always", "area":"shoulder", "app":null, "cb": function(){
			// ブラウザの DevTools を開く
			nw.Window.get().showDevTools();
			// TODO: nodeJs の DevTools は スクリプト上から開けない？
		} },
		{"label":px.lb.get('menu.exit'),                 "cond":"always",             "area":"shoulder", "app":null, "cb": function(){px.exit();}}
	];

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
				.click(_menu[i].cb)
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
