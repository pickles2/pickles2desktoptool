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
				"id":"*home",
				"label":main.lb.get('menu.home'),
				"cond":"projectSelected",
				"area":"mainmenu",
				"app":"fncs/home/index.html",
				"href":"javascript:main.subapp();"
			},
			'*sitemaps': {
				"id":"*sitemaps",
				"label":main.lb.get('menu.sitemaps'),
				"cond":"pxStandby",
				"area":"mainmenu",
				"app":"fncs/sitemaps/index.html",
				"href": "javascript:main.subapp('fncs/sitemaps/index.html');"
			},
			'*themes': {
				"id":"*themes",
				"label":main.lb.get('menu.themes'),
				"cond":"pxStandby",
				"area":"mainmenu",
				"app":"fncs/themes/index.html",
				"href": "javascript:main.subapp('fncs/themes/index.html');"
			},
			'*contents': {
				"id":"*contents",
				"label":main.lb.get('menu.contents'),
				"cond":"pxStandby",
				"area":"mainmenu",
				"app":"fncs/contents/index.html",
				"href": "javascript:main.subapp('fncs/contents/index.html');"
			},
			'*publish': {
				"id":"*publish",
				"label":main.lb.get('menu.publish'),
				"cond":"pxStandby",
				"area":"mainmenu",
				"app":"fncs/publish/index.html",
				"href": "javascript:main.subapp('fncs/publish/index.html');"
			},
			'*composer': {
				"id":"*composer",
				"label":main.lb.get('menu.composer'),
				"cond":"composerJsonExists",
				"area":"shoulder",
				"app":"fncs/composer/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			},
			'*modules': {
				"id":"*modules",
				"label":main.lb.get('menu.modules'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/modules/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			},
			'*git': {
				"id":"*git",
				"label":main.lb.get('menu.git'),
				"cond":"homeDirExists",
				"area":"shoulder",
				"app":"fncs/git/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			},
			'*clearcache': {
				"id":"*clearcache",
				"label":main.lb.get('menu.clearcache'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/clearcache/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			},
		};

		return _overwritableMenuItems;
	}



	/**
	 * グローバルメニューを描画
	 */
	this.drawGlobalMenu = function($shoulderMenu, _current_app){
		var cpj = main.getCurrentProject();
		var cpj_s = null;
		if( cpj !== null ){
			cpj_s = cpj.status();
		}

		var mainMenu = {
			'*home': true,
			'*sitemaps': true,
			'*themes': true,
			'*contents': true,
			'*publish': true,
		};
		if( cpj_s && cpj_s.mainMenu ){
			mainMenu = {};
			for( var idx in cpj_s.mainMenu ){
				mainMenu[cpj_s.mainMenu[idx]] = true;
			}
		}
		var _overwritableMenuItems = getOverwritableMenuDefinition();


		if( cpj_s && cpj_s.customConsoleExtensions ){
			// Custom Console Extensions によるメニューの上書き
			for(var cce_id in cpj_s.customConsoleExtensions){
				if( _overwritableMenuItems[cce_id] ){
					var cceInfo = cpj_s.customConsoleExtensions[cce_id];
					if( !cpj_s.customConsoleExtensions[cce_id].class_name && !cpj_s.customConsoleExtensions[cce_id].client_initialize_function ){
						cpj_s.customConsoleExtensions[cce_id] = false;
						_overwritableMenuItems[cce_id] = false;
						continue;
					}
					var appPath = 'fncs/custom_console_extensions/index.html?cce_id='+encodeURIComponent(cce_id);
					_overwritableMenuItems[cce_id].label = cceInfo.label;
					_overwritableMenuItems[cce_id].app = appPath;
					_overwritableMenuItems[cce_id].attr = {
						"data-app-path": appPath,
					};
					_overwritableMenuItems[cce_id].href = undefined;
					_overwritableMenuItems[cce_id].click = function(){
						var $this = $(this);
						main.subapp( $this.attr('data-app-path') );
					};

					cpj_s.customConsoleExtensions[cce_id] = false;
				}
			}
		}


		function addMenuItem( menuItem, $parent ){
			if( !menuItem ){
				return;
			}
			if( menuItem.cond == 'projectSelected' ){
				if( cpj === null ){
					return;
				}
			}else if( menuItem.cond == 'composerJsonExists' ){
				if( cpj === null || !cpj_s.composerJsonExists ){
					return;
				}
			}else if( menuItem.cond == 'homeDirExists' ){
				if( cpj === null || !cpj_s.homeDirExists ){
					return;
				}
			}else if( menuItem.cond == 'pxStandby' ){
				if( cpj === null || !cpj_s.isPxStandby ){
					return;
				}
			}else if( menuItem.cond == 'customConsoleExtensionsExists' ){
				if( cpj === null || !cpj_s.isPxStandby || !cpj_s.customConsoleExtensions ){
					return;
				}
			}else if( menuItem.cond != 'always' ){
				return;
			}

			var attr = menuItem.attr || {};
			attr['href'] = (menuItem.href || "javascript:;");
			attr['data-name'] = menuItem.app;
			var $tmpMenu = $('<a>')
				.attr(attr)
				.text(menuItem.label)
				.data('app', menuItem.app)
				.addClass( ( _current_app==menuItem.app ? 'current' : '' ) )
			;
			if( menuItem.click ){
				$tmpMenu.on('click', menuItem.click);
			}

			var $li = $('<li>');
			if( $parent ){
				$parent.append( $li.append($tmpMenu) );
			}else{
				if( menuItem.id && mainMenu[menuItem.id] ){
					$('.px2-header__global-menu > ul').append( $li
						.append( $tmpMenu )
					);
				}else{
					$shoulderMenu.find('>ul').append( $li
						.append( $tmpMenu )
					);
				}
			}
			return $li;
		}




		if( cpj !== null ){
			addMenuItem( _overwritableMenuItems['*home'] );
		}

		if( cpj !== null && cpj_s.isPxStandby ){
			addMenuItem( _overwritableMenuItems['*sitemaps'] );
			addMenuItem( _overwritableMenuItems['*themes'] );
			addMenuItem( _overwritableMenuItems['*contents'] );
			addMenuItem( _overwritableMenuItems['*publish'] );
		}

		if( cpj !== null ){
			addMenuItem( {
				"label":main.lb.get('menu.dashboard'),
				"cond":"projectSelected",
				"area":"shoulder",
				"app":"index.html",
				"click": function(){
					main.deselectProject();
					main.subapp();
				}
			});
		}
		if( cpj !== null && cpj_s.homeDirExists ){
			addMenuItem( {
				"label":main.lb.get('menu.openFolder'),
				"cond":"homeDirExists",
				"area":"shoulder",
				"app":null,
				"click": function(){
					main.getCurrentProject().open();
				}
			});
		}

		if( cpj !== null && cpj_s.isPxStandby ){
			addMenuItem( {
				"label":main.lb.get('menu.openInBrowser'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":null,
				"click": function(){
					main.openInBrowser();
				}
			});
			addMenuItem( {
				"label":main.lb.get('menu.openAppInBrowser'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":null,
				"click": function(){
					main.openAppInBrowser();
				}
			});
		}


		if( cpj !== null && cpj_s.isPxStandby ){
			addMenuItem( _overwritableMenuItems['*modules'] );

			var $li = addMenuItem( {
				"label":main.lb.get('menu.config'),
				"cond":"pxStandby",
				"area":"shoulder",
			});
			var $ul = $( '<ul>' );
			$li.append($ul);

			addMenuItem( {
				"label":main.lb.get('menu.projectConfig'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/config/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			}, $ul );
			addMenuItem( {
				"label":main.lb.get('menu.projectIndividualConfig'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":null,
				"click": function(){
					main.getCurrentProject().editProjectIndividualConfig();
				}
			}, $ul );
			addMenuItem( {
				"label":_appName+" "+main.lb.get('menu.desktoptoolConfig'),
				"cond":"always",
				"area":"shoulder",
				"app":null,
				"click": function(){
					main.editPx2DTConfig();
				}
			}, $ul );

		}

		if( cpj !== null && cpj_s.composerJsonExists ){
			addMenuItem( _overwritableMenuItems['*composer'] );
		}

		if( cpj !== null && cpj_s.homeDirExists ){
			addMenuItem( _overwritableMenuItems['*git'] );
		}

		if( cpj !== null && cpj_s.isPxStandby ){
			var $li = addMenuItem( {
				"label":main.lb.get('menu.tool'),
				"cond":"pxStandby",
				"area":"shoulder",
			});
			var $ul = $( '<ul>' );
			$li.append($ul);

			addMenuItem( {
				"label":main.lb.get('menu.styleguideGenerator'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/styleguide_generator/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			}, $ul );
			addMenuItem( {
				"label":main.lb.get('menu.mkContentFilesByList'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/make_content_files_by_list/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			}, $ul );
			addMenuItem( {
				"label":main.lb.get('menu.mkContentFileList'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/make_content_file_list/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			}, $ul );
			addMenuItem( {
				"label":main.lb.get('menu.contentsProcessor'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/contents_processor/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			}, $ul );
			addMenuItem( {
				"label":main.lb.get('menu.moveContents'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/move_contents/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			}, $ul );
			addMenuItem( {
				"label":main.lb.get('menu.mkUnusedModuleList'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/make_unused_module_list/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			}, $ul );
			addMenuItem( {
				"label":main.lb.get('menu.updateGuiContents'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/rebuild_guiedit_contents/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			}, $ul );
			addMenuItem( {
				"label":main.lb.get('menu.preview'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/preview/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			}, $ul );
			addMenuItem( {
				"label":main.lb.get('menu.search'),
				"cond":"pxStandby",
				"area":"shoulder",
				"app":"fncs/search/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			}, $ul );
		}

		if( cpj !== null && cpj_s.isPxStandby && cpj_s.customConsoleExtensions ){
			var $li = addMenuItem( {
				"label":main.lb.get('menu.customConsoleExtensions'),
				"cond":"customConsoleExtensionsExists",
				"area":"shoulder",
				"submenu": [
				]
			});

			var $ul = $( '<ul>' );
			$li.append($ul);

			// Custom Console Extensions サブメニューの処理
			var $cceLi = $('<li>');
			for(var cce_id in cpj_s.customConsoleExtensions){
				var cceInfo = cpj_s.customConsoleExtensions[cce_id];
				if( !cceInfo ){
					 continue;
				}
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

		}

		if( cpj !== null && cpj_s.homeDirExists ){
			var $li = addMenuItem( {
				"label":main.lb.get('menu.externalTools'),
				"cond":"homeDirExists",
				"area":"shoulder",
			});
			var $ul = $( '<ul>' );
			$li.append($ul);
			addMenuItem( {
				"label":main.lb.get('menu.openInTexteditor'),
				"cond":"homeDirExists",
				"area":"shoulder",
				"app":null,
				"click": function(){
					main.openInTextEditor( main.getCurrentProject().get('path') );
				}
			}, $ul );
			addMenuItem( {
				"label":main.lb.get('menu.openInGitClient'),
				"cond":"homeDirExists",
				"area":"shoulder",
				"app":null,
				"click": function(){
					main.openInGitClient( main.getCurrentProject().get('path') );
				}
			}, $ul );
			addMenuItem( {
				"label":main.lb.get('menu.openInTerminal'),
				"cond":"homeDirExists",
				"area":"shoulder",
				"app":null,
				"click": function(){
					main.openInTerminal( main.getCurrentProject().get('path') );
				}
			}, $ul );
		}

		if( cpj !== null && cpj_s.isPxStandby ){
			addMenuItem( _overwritableMenuItems['*clearcache'] );
		}

		if( cpj !== null && cpj_s.homeDirExists ){
			addMenuItem( {
				"label":main.lb.get('menu.filesAndFolders'),
				"cond":"homeDirExists",
				"area":"shoulder",
				"app":"fncs/files_and_folders/index.html",
				"click": function(){
					main.subapp($(this).data('app'));
				}
			} );
		}

		// addMenuItem( {
		// 	"label":"Reload(dev)",
		// 	"cond":"always",
		// 	"click": function(){
		// 		window.location.href='index.html?';
		// 	}
		// });
		var $li = addMenuItem( {
			"label":main.lb.get('menu.system'),
			"cond":"always",
			"area":"shoulder",
		});
		var $ul = $( '<ul>' );
		$li.append($ul);

		addMenuItem( {
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
		}, $ul );
		addMenuItem( {
			"label":main.lb.get('menu.developerTool'),
			"cond":"always",
			"area":"shoulder",
			"app":null,
			"click": function(){
				// ブラウザの DevTools を開く
				nw.Window.get().showDevTools();
				// FYI: nodeJs の DevTools は スクリプト上から開けない
			}
		}, $ul );
		addMenuItem( {
			"label":_appName+" "+main.lb.get('menu.desktoptoolConfig'),
			"cond":"always",
			"area":"shoulder",
			"app":null,
			"click": function(){
				main.editPx2DTConfig();
			}
		}, $ul );
		addMenuItem( {
			"label":main.lb.get('menu.commandlog'),
			"cond":"always",
			"area":"shoulder",
			"app":null,
			"click": function(){
				main.commandQueue.show();
			}
		}, $ul );


		if( main.packageJson.manifestUrl ){
			addMenuItem( {
				"label":main.lb.get('menu.checkForUpdate'),
				"cond":"always",
				"area":"shoulder",
				"app":null,
				"click": function(){
					main.updater.checkNewVersion();
				}
			});
		}

		addMenuItem( {
			"label":main.lb.get('menu.help'),
			"cond":"always",
			"area":"shoulder",
			"app":null,
			"click": function(){
				main.openHelp();
			}
		});

		addMenuItem( {
			"label":main.lb.get('menu.exit'),
			"cond":"always",
			"area":"shoulder",
			"app":null,
			"click": function(){
				main.exit();
			}
		});


		return;
	}

}
