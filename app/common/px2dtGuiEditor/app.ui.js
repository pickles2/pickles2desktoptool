window.px2dtGuiEditor.ui = new(function(px, px2dtGuiEditor){
	var _this = this;
	var $preview;
	var $previewDoc;
	var $ctrlPanel;
	var $palette;
	var $editWindow;

	var selectedInstance = null;

	var dataViewTree = {};

	var _Keypress = {};
	this.Keypress = _Keypress;

	/**
	 * フィールド初期化
	 */
	this.initField = function( cb ){

		$preview = $('iframe.cont_field-preview');
		$previewDoc = $($preview[0].contentWindow.document);
		$ctrlPanel = $('.cont_field-ctrlpanel');
		$palette = $('.cont_modulelist');

		// モジュールパレットの初期化
		$palette
			.html('')
			.append('<ul>')
		;
		(function(){
			var modPackages = px2dtGuiEditor.moduleTemplates.getPackages();
			px.utils.iterate(
				modPackages,
				function( it, row, idx ){
					var $liPackage = $('<li>');
					$palette.find('>ul')
						.append( $liPackage )
					;

					var modGroups = px2dtGuiEditor.moduleTemplates.getGroups( modPackages[idx].id );
					var $ulGroups = $('<ul>')
					$liPackage
						.append( $('<a>')
							.text( row.name )
							.attr({'href':'javascript:;'})
							.click(function(){
								$ulGroups.toggle()
							})
						)
						.append($ulGroups)
					;

					px.utils.iterate(
						modGroups,
						function( it2, group, groupId ){
							var $liGroup = $('<li>');
							$ulGroups.append( $liGroup );
							var $ulMods = $('<ul>');
							$liGroup
								.append( $('<a>')
									.text( group.name )
									.attr({'href':'javascript:;'})
									.click(function(){
										$ulMods.toggle()
									})
								)
								.append( $ulMods )
							;
							px.utils.iterate(
								group.contents,
								function( it3, modId, idx3 ){
									var mod = px2dtGuiEditor.moduleTemplates.get( modId );
									var $liMod = $('<li>')
										.append( $('<button>')
											.text( modId )
											.html((function(d){
												var rtn = '';
												var label = (d.info&&d.info.name ? d.info.name : d.id);
												var thumb = 'data:image/png;base64,'+px.utils.base64encode( px.fs.readFileSync( './app/common/images/guieditor_module_thumb.png' ) );
												if(d.thumb){
													thumb = d.thumb;
												}
												rtn += '<img src="'+px.php.htmlspecialchars( thumb )+'" alt="'+px.php.htmlspecialchars( label )+'" style="max-height:100%; max-width:100%; margin-right:5px;" />';
												rtn += label;
												return rtn;
											})(mod))
											.css({
												'padding':0,
												'border':0,
												'height':'50px',
												'text-align':'left',
												'color':'inherit'
											})
											.attr({
												'title': (function(d){ return (d.info&&d.info.name ? d.info.name + ' - ' : '')+d.id; })(mod),
												'data-id': mod.id,
												'draggable': true //←HTML5のAPI http://www.htmq.com/dnd/
											})
											.on('dragstart', function(){
												// px.message( $(this).data('id') );
												event.dataTransfer.setData('method', 'add' );
												event.dataTransfer.setData('modId', $(this).attr('data-id') );
											})
										)
									;
									$ulMods.append( $liMod );

									it3.next();
								},
								function(){
									it2.next();
								}
							);

						},
						function(){
							it.next();
						}
					);
				},
				function(){
					// キーボードイベントセット
					_Keypress = new window.keypress.Listener();
					this.Keypress = _Keypress;
					var deleteModuleInstance = function(){
						if( selectedInstance !== null ){
							px2dtGuiEditor.contentsSourceData.removeInstance( selectedInstance );
							_this.unselectInstance();
							px2dtGuiEditor.ui.onEditEnd();
							px.message("インスタンスを削除しました。");
						}
						return;
					}
					_Keypress.simple_combo("backspace", function(e) {
						deleteModuleInstance();
						e.preventDefault();
					});
					_Keypress.simple_combo("delete", function(e) {
						deleteModuleInstance();
						e.preventDefault();
					});
					_Keypress.simple_combo("escape", function(e) {
						_this.unselectInstance();
						e.preventDefault();
					});
					_Keypress.simple_combo("cmd c", function(e) {
						var data = _this.getSelectedInstanceData();
						data = JSON.stringify( data );
						px.clipboard.set( data );
						px.message('インスタンスをコピーしました。');
						e.preventDefault();
					});
					_Keypress.simple_combo("cmd v", function(e) {
						var data = px.clipboard.get();
						// alert(data);
						data = JSON.parse( data );
						px2dtGuiEditor.contentsSourceData.addInstance( data, _this.getSelectedInstance(), function(){
							px.message('インスタンスをペーストしました。');
							px2dtGuiEditor.ui.onEditEnd();
						} );
						e.preventDefault();
					});
					_Keypress.simple_combo("cmd z", function(e) {
						px2dtGuiEditor.contentsSourceData.historyBack( function(){
							px2dtGuiEditor.save(function(result){
								if( !result ){
									px.message('保存に失敗しました。');
								}
								_this.resizeEvent( function(){
									px.message('取り消しました。');
								} );
							});
						} );
						e.preventDefault();
					});
					_Keypress.simple_combo("cmd y", function(e) {
						px2dtGuiEditor.contentsSourceData.historyGo( function(){
							px2dtGuiEditor.save(function(result){
								if( !result ){
									px.message('保存に失敗しました。');
								}
								_this.resizeEvent( function(){
									px.message('やり直しました。');
								} );
							});
						} );
						e.preventDefault();
					});
					// _Keypress.simple_combo("cmd x", function(e) {
					// 	px.message('cmd x');
					// 	e.preventDefault();
					// });

					// 関係ないとこクリックで選択解除
					$ctrlPanel.on('click', function(){
						_this.unselectInstance();
					});
				}
			);

		})();


		$preview
			.bind('load', function(){
				var callback = cb;
				_this.onPreviewLoad( callback );
			})
		;

		// cb();
		return;
	} // initField()

	/**
	 * プレビュー画面(=GUI編集画面)を表示
	 */
	this.preview = function( path ){

		// 編集フィールドの初期化
		$ctrlPanel.html('');
		_this.unselectInstance();

		$preview
			.attr('src', px.preview.getUrl(path) )
		;
		return true;
	} // preview()

	/**
	 * プレビューのロード完了イベント
	 * px2dtGuiEditor.contentsSourceData のデータをもとに、コンテンツと編集ツール描画のリセットも行います。
	 */
	this.onPreviewLoad = function( cb ){
		cb = cb || function(){};

		// alert('onPreviewLoad');
		if( !$preview || !$preview[0] || !$preview[0].contentWindow ){
			cb();
			return;
		}

		$previewDoc = $($preview[0].contentWindow.document);

		this.resizeEvent( cb );
		return;
	}

	/**
	 * コンテンツデータに対応するUIのひな形
	 */
	function classUiUnit( instancePath, data ){
		instancePath = instancePath.replace( new RegExp('^\\/*'), '/' );
		this.instancePath = instancePath;
		this.moduleTemplates = px2dtGuiEditor.moduleTemplates.get( data.modId, data.subModName );
		if( this.moduleTemplates === false ){
			this.moduleTemplates = px2dtGuiEditor.moduleTemplates.get( '_sys/unknown' );
		}
		this.fieldList = _.keys( this.moduleTemplates.fields );

		this.fields = {};
		for( var idx in this.fieldList ){
			var fieldName = this.fieldList[idx];
			if( this.moduleTemplates.fields[fieldName].fieldType == 'input' ){
				this.fields[fieldName] = data.fields[fieldName];
			}else if( this.moduleTemplates.fields[fieldName].fieldType == 'module' ){
				this.fields[fieldName] = [];
				for( var idx2 in data.fields[fieldName] ){
					this.fields[fieldName][idx2] = new classUiUnit(
						instancePath+'/fields.'+fieldName+'@'+idx2,
						data.fields[fieldName][idx2]
					);
				}
			}else if( this.moduleTemplates.fields[fieldName].fieldType == 'loop' ){
				this.fields[fieldName] = [];
				for( var idx2 in data.fields[fieldName] ){
					this.fields[fieldName][idx2] = new classUiUnit(
						instancePath+'/fields.'+fieldName+'@'+idx2,
						data.fields[fieldName][idx2]
					);
				}
			}
		}

		/**
		 * UI/出力時のHTMLコードを生成する
		 */
		this.bind = function( mode ){
			mode = mode||"finalize";
				// mode =
				//    canvas (編集用レイアウト)
				//    finalize (デフォルト/最終書き出し)

			var fieldData = {};
			for( var idx in this.fieldList ){
				var fieldName = this.fieldList[idx];
				if( this.moduleTemplates.fields[fieldName].fieldType == 'input' ){
					if( px2dtGuiEditor.fieldDefinitions[this.moduleTemplates.fields[fieldName].type] ){
						fieldData[fieldName] = px2dtGuiEditor.fieldDefinitions[this.moduleTemplates.fields[fieldName].type].normalizeData( this.fields[fieldName], mode );
					}else{
						fieldData[fieldName] = px2dtGuiEditor.fieldBase.normalizeData( this.fields[fieldName], mode );
					}
				}else if( this.moduleTemplates.fields[fieldName].fieldType == 'module' ){
					fieldData[fieldName] = (function( fieldData, mode, opt ){
						var rtn = [];
						for( var idx2 in fieldData ){
							rtn[idx2] = fieldData[idx2].bind( mode );
						}
						if( mode == 'canvas' ){
							var instancePathNext = opt.instancePath+'/fields.'+opt.fieldName+'@'+( fieldData.length );
							rtn.push( $('<div>')
								.attr( "data-guieditor-cont-data-path", instancePathNext )
								.append( $('<div>')
									.text(
										// instancePathNext +
										'ここに新しいモジュールをドラッグしてください。'
									)
									.css({
										'overflow':'hidden',
										"padding": 15,
										"background-color":"#eef",
										"border-radius":5,
										"font-size":9,
										"color":"#000",
										'text-align':'center',
										'box-sizing': 'content-box'
									})
								)
								.css({
									"padding":'5px 0'
								})
								.get(0).outerHTML
							);
						}
						return rtn;
					})( this.fields[fieldName], mode, {
						"instancePath": this.instancePath ,
						"fieldName": fieldName
					} );
				}else if( this.moduleTemplates.fields[fieldName].fieldType == 'loop' ){
					fieldData[fieldName] = [];
					for( var idx2 in this.fields[fieldName] ){
						fieldData[fieldName][idx2] = this.fields[fieldName][idx2].bind( mode );
					}

					if( mode == 'canvas' ){
						var instancePathNext = this.instancePath+'/fields.'+fieldName+'@'+( this.fields[fieldName].length );
						fieldData[fieldName].push( $('<div>')
							.attr( "data-guieditor-cont-data-path", instancePathNext )
							.append( $('<div>')
								.text(
									// instancePathNext +
									'ここをダブルクリックして配列要素を追加してください。'
								)
								.css({
									'overflow':'hidden',
									"padding": '5px 15px',
									"background-color":"#dfe",
									"border-radius":5,
									"font-size":9,
									'text-align':'center',
									'box-sizing': 'content-box'
								})
							)
							.css({
								"padding":'5px 0'
							})
							.get(0).outerHTML
						);
					}
				}
			}// for

			var tmpSrc = this.moduleTemplates.bind( fieldData, mode );
			var rtn = $('<div>');

			var isRootElement = this.moduleTemplates.isRootElement;

			if( mode == 'finalize' ){
				// rtn = $('<div>');
				// rtn.append( tmpSrc );
				// rtn = rtn.get(0).innerHTML;
				rtn = tmpSrc;
			}else{
				rtn = $('<div>');
				rtn.append( tmpSrc );
				if( isRootElement ){
					// 要素が1つだったら、追加した<div>ではなくて、
					// 最初の要素にマークする。
					// li要素とか、display:blockではない場合にレイアウトを壊さない目的。
					// 要素が複数の場合、または存在しないテキストノードのみの場合、
					// 要素がテキストノードで囲われている場合、なども考えられる。
					// これらの場合は、divで囲ってあげないとハンドルできないので、しかたなし。
					rtn = $(tmpSrc);
				}
				rtn
					.attr("data-guieditor-cont-data-path", this.instancePath)
					.css({
						'margin-top':5,
						'margin-bottom':5
					})
				;
				rtn = rtn.get(0).outerHTML;
			}
			return rtn;
		} // this.bind();

		/**
		 * コントロールパネルを描画する
		 */
		this.drawCtrlPanels = function( $content ){
			var $elm = $content.find('[data-guieditor-cont-data-path='+JSON.stringify(this.instancePath)+']');
			var $ctrlElm = $('<div>')
				.addClass('cont_instanceCtrlPanel')
				.css({
					'width': $elm.outerWidth(),
					'height': $elm.outerHeight()
				})
				.width($elm.outerWidth())
				.height($elm.outerHeight())
				.offset($elm.offset())
				.attr({
					'data-guieditor-cont-data-path': this.instancePath ,
					'data-guieditor-sub-mod-name': this.moduleTemplates.subModName
				})
				.bind('mouseover', function(e){
					// $(this).css({
					// 	"border":"3px dotted #000"
					// });
				})
				.bind('mouseout', function(e){
					// $(this).css({
					// 	"border":"0px dotted #99d"
					// });
				})
				.attr({'draggable': true})//←HTML5のAPI http://www.htmq.com/dnd/
				.on('dragstart', function(){
					event.dataTransfer.setData("method", 'moveTo' );
					event.dataTransfer.setData("data-guieditor-cont-data-path", $(this).attr('data-guieditor-cont-data-path') );
					var subModName = $(this).attr('data-guieditor-sub-mod-name');
					if( typeof(subModName) === typeof('') && subModName.length ){
						event.dataTransfer.setData("data-guieditor-sub-mod-name", subModName );
					}
				})
				.bind('drop', function(){
					var method = event.dataTransfer.getData("method");
					var modId = event.dataTransfer.getData("modId");
					var moveFrom = event.dataTransfer.getData("data-guieditor-cont-data-path");
					var moveTo = $(this).attr('data-guieditor-cont-data-path');
					var subModNameTo = $(this).attr('data-guieditor-sub-mod-name');
					var subModNameFrom = event.dataTransfer.getData('data-guieditor-sub-mod-name');

					// px.message( 'modId "'+modId+'" が "'+method+'" のためにドロップされました。' );
					if( method == 'add' ){
						if( typeof(subModNameTo) === typeof('') ){
							px.message('ここにモジュールを追加することはできません。');
							return;
						}
						px2dtGuiEditor.contentsSourceData.addInstance( modId, moveTo, function(){
							// px.message('インスタンスを追加しました。');
							px2dtGuiEditor.ui.onEditEnd();
						} );
					}else if( method == 'moveTo' ){
						function isSubMod( subModName ){
							if( typeof(subModName) === typeof('') && subModName.length ){
								return true;
							}
							return false;
						}
						function removeNum(str){
							return str.replace(new RegExp('[0-9]+$'),'');
						}
						if( (isSubMod(subModNameFrom) || isSubMod(subModNameTo)) && removeNum(moveFrom) !== removeNum(moveTo) ){
							px.message('並べ替え以外の移動操作はできません。');
							return;
						}
						px2dtGuiEditor.contentsSourceData.moveInstanceTo( moveFrom, moveTo, function(){
							// px.message('インスタンスを移動しました。');
							px2dtGuiEditor.ui.onEditEnd();
						} );
					}
				})
				.bind('dragenter', function(e){
					$(this).addClass('cont_instanceCtrlPanel-ctrlpanel_dragentered');
				})
				.bind('dragleave', function(e){
					$(this).removeClass('cont_instanceCtrlPanel-ctrlpanel_dragentered');
				})
				.bind('dragover', function(e){
					e.preventDefault();
				})
				.bind('click', function(e){
					// _this.openEditWindow( $(this).attr('data-guieditor-cont-data-path') );
					_this.selectInstance( $(this).attr('data-guieditor-cont-data-path') );
					e.stopPropagation();
				})
				.bind('dblclick', function(e){
					_this.openEditWindow( $(this).attr('data-guieditor-cont-data-path') );
				})
			;
			if( !this.instancePath.match(new RegExp('^\\/bowl\\.[a-zA-Z0-9\_\-]+$')) ){
				// ルートインスタンスは編集できないようにする。
				$ctrlPanel.append( $ctrlElm );
			}


			for( var idx in this.fieldList ){
				var fieldName = this.fieldList[idx];
				if( this.moduleTemplates.fields[fieldName].fieldType == 'input'){
				}else if( this.moduleTemplates.fields[fieldName].fieldType == 'module'){
					for( var idx2 in this.fields[fieldName] ){
						this.fields[fieldName][idx2].drawCtrlPanels( $content );
					}

					var instancePath = this.instancePath+'/fields.'+fieldName+'@'+(this.fields[fieldName].length);
					var $elm = $content.find('[data-guieditor-cont-data-path='+JSON.stringify(instancePath)+']');
					var $ctrlElm = $('<div>')
						.css({
							'border':0,
							'font-size':'11px',
							'overflow':'hidden',
							'text-align':'center',
							'background-color': 'transparent',
							'display':'block',
							'position':'absolute',
							'top': $elm.offset().top + 5,
							'left': $elm.offset().left,
							"z-index":0,
							'width': $elm.width(),
							'height': $elm.height()
						})
						.attr({'data-guieditor-cont-data-path': instancePath})
						.bind('mouseover', function(e){
							$(this).css({
								"border-radius":5,
								"border":"1px solid #000"
							});
						})
						.bind('mouseout', function(e){
							$(this).css({
								"border":0
							});
						})
						.bind('drop', function(e){
							var method = event.dataTransfer.getData("method");
							if( method === 'moveTo' ){
								var moveFrom = event.dataTransfer.getData("data-guieditor-cont-data-path");
								px2dtGuiEditor.contentsSourceData.moveInstanceTo( moveFrom, $(this).attr('data-guieditor-cont-data-path'), function(){
									// px.message('インスタンスを移動しました。');
									px2dtGuiEditor.ui.onEditEnd();
								} );
								return;
							}
							if( method !== 'add' ){
								px.message('追加するモジュールをドロップしてください。ここに移動することはできません。');
								return;
							}
							var modId = event.dataTransfer.getData("modId");
							px2dtGuiEditor.contentsSourceData.addInstance( modId, $(this).attr('data-guieditor-cont-data-path'), function(){
								// px.message('インスタンスを追加しました。');
								px2dtGuiEditor.ui.onEditEnd();
							} );
						})
						.bind('dragenter', function(e){
							$(this).css({
								"border-radius":0,
								"border":"3px dotted #99f"
							});
						})
						.bind('dragleave', function(e){
							$(this).css({
								"border":0
							});
						})
						.bind('dragover', function(e){
							e.preventDefault();
						})
						.bind('click', function(e){
							// 特に処理なし
						})
						.bind('dblclick', function(e){
							px.message( 'ここに追加したいモジュールをドロップしてください。' );
							e.preventDefault();
						})
					;
					$ctrlPanel.append( $ctrlElm );

				}else if( this.moduleTemplates.fields[fieldName].fieldType == 'loop'){
					for( var idx2 in this.fields[fieldName] ){
						this.fields[fieldName][idx2].drawCtrlPanels( $content );
					}

					var instancePath = this.instancePath+'/fields.'+fieldName+'@'+(this.fields[fieldName].length);
					var $elm = $content.find('[data-guieditor-cont-data-path='+JSON.stringify(instancePath)+']');
					// if( !$elm.size() ){
					// 	// memo: loopの下層にあるmarkdownに値が入ってない場合に 0 になった。
					// 	console.log('unmatched content element.');
					// 	console.log(JSON.stringify(instancePath));
					// }
					var $ctrlElm = $('<div>')
						.css({
							'border':0,
							'font-size':'11px',
							'overflow':'hidden',
							'text-align':'center',
							'background-color': 'transparent',
							'display':'block',
							'position':'absolute',
							'top':  (function($elm){if($elm.size()){return $elm.offset().top  + 5;}return 0;})($elm),
							'left': (function($elm){if($elm.size()){return $elm.offset().left + 0;}return 0;})($elm),
							'z-index':0,
							'width': $elm.width(),
							'height': $elm.height()
						})
						.attr({
							'data-guieditor-mod-id': this.moduleTemplates.id,
							'data-guieditor-sub-mod-name': fieldName,
							'data-guieditor-cont-data-path': instancePath
						})
						.bind('mouseover', function(e){
							$(this).css({
								"border-radius":5,
								"border":"2px solid #666"
							});
						})
						.bind('mouseout', function(e){
							$(this).css({
								"border":0
							});
						})
						.bind('drop', function(e){
							var method = event.dataTransfer.getData("method");
							if( method === 'moveTo' ){
								// これはloop要素を並べ替えるための moveTo です。
								// その他のインスタンスをここに移動したり、作成することはできません。
								var moveFrom = event.dataTransfer.getData("data-guieditor-cont-data-path");
								var moveTo = $(this).attr('data-guieditor-cont-data-path');
								function removeNum(str){
									return str.replace(new RegExp('[0-9]+$'),'');
								}
								if( removeNum(moveFrom) !== removeNum(moveTo) ){
									px.message('並べ替え以外の移動操作はできません。');
									return;
								}

								px2dtGuiEditor.contentsSourceData.moveInstanceTo( moveFrom, moveTo, function(){
									// px.message('インスタンスを移動しました。');
									px2dtGuiEditor.ui.onEditEnd();
								} );
								return;
							}
							px.message('ダブルクリックしてください。ドロップできません。');
							return;
						})
						.bind('dragenter', function(e){
							$(this).css({
								"border-radius":0,
								"border":"3px dotted #99f"
							});
						})
						.bind('dragleave', function(e){
							$(this).css({
								"border":0
							});
						})
						.bind('dragover', function(e){
							e.preventDefault();
						})
						.bind('click', function(e){
							// 特に処理なし
						})
						.bind('dblclick', function(e){
							var modId = $(this).attr("data-guieditor-mod-id");
							var subModName = $(this).attr("data-guieditor-sub-mod-name");
							px2dtGuiEditor.contentsSourceData.addInstance( modId, $(this).attr('data-guieditor-cont-data-path'), function(){
								px2dtGuiEditor.ui.onEditEnd();
							}, subModName );
							e.preventDefault();
						})
					;
					$ctrlPanel.append( $ctrlElm );
				}
			} // for
		} // this.drawCtrlPanels()

	} // function classUiUnit()

	/**
	 * 編集操作終了イベント
	 */
	this.onEditEnd = function( cb ){
		cb = cb||function(){};
		px2dtGuiEditor.save();
		this.resizeEvent();
		cb();
		return;
	}

	/**
	 * モジュールインスタンスを選択状態にする
	 */
	this.selectInstance = function( instancePath ){
		this.unselectInstance();//一旦選択解除
		selectedInstance = instancePath;
		$ctrlPanel.find('[data-guieditor-cont-data-path]')
			.filter(function (index) {
				return $(this).attr("data-guieditor-cont-data-path") == instancePath;
			})
			.addClass('cont_instanceCtrlPanel-ctrlpanel_selected')
		;
		return this;
	}

	/**
	 * モジュールインスタンスの選択状態を解除する
	 */
	this.unselectInstance = function(){
		selectedInstance = null;
		$ctrlPanel.find('[data-guieditor-cont-data-path]')
			.removeClass('cont_instanceCtrlPanel-ctrlpanel_selected')
		;
		return this;
	}

	/**
	 * 選択されたインスタンスのパスを取得する
	 */
	this.getSelectedInstance = function(){
		return selectedInstance;
	}

	/**
	 * 選択されたインスタンスのデータを取得する
	 */
	this.getSelectedInstanceData = function(){
		return px2dtGuiEditor.contentsSourceData.get( selectedInstance );
	}

	/**
	 * モジュールの編集ウィンドウを開く
	 */
	this.openEditWindow = function( instancePath ){
		// px.message( '開発中: このモジュールを選択して、編集できるようになる予定です。' );
		// px.message( instancePath );
		var data = px2dtGuiEditor.contentsSourceData.get( instancePath );
		var modTpl = px2dtGuiEditor.moduleTemplates.get( data.modId, data.subModName );

		// モジュール別編集画面
		var template_module_editor = '';
		template_module_editor += '<form action="javascript:;" method="get">';
		template_module_editor += '	<div class="cont_tpl_module_editor-canvas">';
		template_module_editor += '	</div>';
		template_module_editor += '	<p style="text-align:center;">';
		template_module_editor += '		<button class="cont_tpl_module_editor-submit">保存する</button>';
		template_module_editor += '	</p>';
		template_module_editor += '	<p style="text-align:right;">';
		template_module_editor += '		<button class="cont_tpl_module_editor-cancel">キャンセル</button>';
		template_module_editor += '		<button class="cont_tpl_module_editor-remove">このモジュールを削除</button>';
		template_module_editor += '	</p>';
		template_module_editor += '</form>';

		if( $editWindow ){ $editWindow.remove(); }
		$editWindow = $('<div>')
			.append( template_module_editor )
		;
		$editWindow.find('form')
			.attr({
				'action': 'javascript:;',
				'data-guieditor-cont-data-path':instancePath
			})
			.submit(function(){
				for( var idx in modTpl.fields ){
					var field = modTpl.fields[idx];
					if( field.fieldType == 'input' ){
						if( px2dtGuiEditor.fieldDefinitions[field.type] ){
							data.fields[field.name] = px2dtGuiEditor.fieldDefinitions[field.type].saveEditorContent( $editWindow.find('form [data-field-unit='+JSON.stringify( modTpl.fields[idx].name )+']'), data.fields[field.name], field );
						}else{
							data.fields[field.name] = px2dtGuiEditor.fieldBase.saveEditorContent( $editWindow.find('form [data-field-unit='+JSON.stringify( modTpl.fields[idx].name )+']'), data.fields[field.name], field );
						}
					}else if( field.fieldType == 'module' ){
						// module: 特に処理なし
					}else if( field.fieldType == 'loop' ){
						// loop: 特に処理なし
					}
				}
				$editWindow.remove();
				px.closeDialog();
				px2dtGuiEditor.ui.onEditEnd();
				return false;
			})
		;
		$editWindow.find('form .cont_tpl_module_editor-cancel')
			.click(function(){
				$editWindow.remove();
				px.closeDialog();
				return false;
			})
		;
		$editWindow.find('form .cont_tpl_module_editor-remove')
			.attr({'data-guieditor-cont-data-path':instancePath})
			.click(function(){
				px2dtGuiEditor.contentsSourceData.removeInstance( $(this).attr('data-guieditor-cont-data-path') );
				delete data;
				$editWindow.remove();
				px.closeDialog();
				px2dtGuiEditor.ui.onEditEnd();
				return false;
			})
		;

		function mkEditFieldLabel(field){
			var rtn = '';
			var name = field.name;
			if( field.label ){
				name = field.label;
			}
			switch( field.fieldType ){
				case 'input':
					rtn = name+' <span class="small"> - '+field.type+'</small>';
					break;
				default:
					rtn = name+' <span class="small"> - '+field.fieldType+'</span>';
					break;
			}
			return rtn;
		}

		for( var idx in modTpl.fields ){
			var field = modTpl.fields[idx];
			if( field.fieldType == 'input' ){
				$editWindow.find('div.cont_tpl_module_editor-canvas')
					.append($('<div>')
						.attr( 'data-field-unit', modTpl.fields[idx].name )
						.append($('<h2>')
							.html( mkEditFieldLabel( modTpl.fields[idx] ) )
						)
						.append( ((function( field, mod, data ){
							if( px2dtGuiEditor.fieldDefinitions[field.type] ){
								return px2dtGuiEditor.fieldDefinitions[field.type].mkEditor( mod, data );
							}
							return $('<div>')
								.append( $('<textarea>')
									.attr({"name":mod.name})
									.val(data)
									.css({'width':'100%','height':'6em'})
								)
							;
						})( field, modTpl.fields[idx], data.fields[modTpl.fields[idx].name] ) ) )
					)
				;
			}else if( field.fieldType == 'module' ){
				$editWindow.find('div.cont_tpl_module_editor-canvas')
					.append($('<div>')
						.attr( 'data-field-unit', modTpl.fields[idx].name )
						.append($('<h2>')
							// .text(field.fieldType+' ('+modTpl.fields[idx].name+')')
							.html( mkEditFieldLabel( modTpl.fields[idx] ) )
						)
						.append($('<p>')
							.text('ネストされたモジュールがあります。')
						)
					)
				;
			}else if( field.fieldType == 'loop' ){
				$editWindow.find('div.cont_tpl_module_editor-canvas')
					.append($('<div>')
						.append($('<h2>')
							// .text(field.fieldType+' ('+modTpl.fields[idx].name+')')
							.html( mkEditFieldLabel( modTpl.fields[idx] ) )
						)
						.append($('<p>')
							.text('ネストされたサブモジュールがあります。')
						)
					)
				;

			}
		}

		px.dialog({
			"title": "編集" ,
			"body": $editWindow ,
			"buttons":[]
		});

		// DOMに配置後にコールバックを呼ぶ
		// UI系のライブラリを使う場合に不都合がある場合があるので追加した機能。
		for( var idx in modTpl.fields ){
			var field = modTpl.fields[idx];
			if( field.fieldType == 'input' ){
				if( px2dtGuiEditor.fieldDefinitions[field.type] ){
					return px2dtGuiEditor.fieldDefinitions[field.type].onEditorUiDrawn( $editWindow.find('div[data-field-unit="'+modTpl.fields[idx].name+'"]'), field, data.fields[modTpl.fields[idx].name] );
				}
			}
		}

		return this;
	}// openEditWindow()

	/**
	 * ウィンドウ リサイズ イベント ハンドラ
	 */
	this.resizeEvent = function( cb ){
		cb = cb || function(){};

		$('.cont_field')
			.css({
				'height':$(window).height() - 5
			})
		;

		$palette
			.css({
				'height':$(window).height() - $('.cont_btns').outerHeight() - 10
			})
		;

		$previewDoc = $($preview[0].contentWindow.document);

		var fieldheight = $previewDoc.find('body').height()*1.5; // ←座標を上手く合わせられないので、余裕を持って長めにしとく。
		$preview.height( fieldheight );
		$ctrlPanel.height( fieldheight );
		if( $editWindow ){
			$editWindow.height( fieldheight );
		}

		$ctrlPanel.html('');
		_this.unselectInstance();
		$previewDoc.find('.contents').each(function(){
			$(this).html('');
			var id = $(this).attr('id')||'main';
			px2dtGuiEditor.contentsSourceData.initBowlData(id);
			var data = px2dtGuiEditor.contentsSourceData.getBowlData( id );

			dataViewTree[id] = new classUiUnit( '/bowl.'+id, data );
			$(this).html( dataViewTree[id].bind( 'canvas' ) );
			$(this).html( dataViewTree[id].drawCtrlPanels($(this)) );

		});

		// setTimeout(function(){
			// 高さ合わせ処理のタイミングがずれることがあったので、
			// 根本的な解決にはなってないが、一旦 setTimeout() で逃げといた。
			// 初期化の処理を見なおしたら解決したので、setTimeout() ははずした。
			// UTODO: 画像が含まれている & レスポンシブの場合(？)に、ずれる現象はまだ起きている。
			//        仮説：ctrlPanelを配置したあとでスクロールバーがでて、画像の幅が変わる(→同時に高さも変わる)ことが原因？
			//        しかし、画像が含まれない場合にも起こる場合がある。ブレークポイントをまたぐと起きる、とか？
			var fieldheight = $previewDoc.find('body').height();
			$preview.height( fieldheight );
			$ctrlPanel.height( fieldheight );
			if( $editWindow ){
				$editWindow.height( fieldheight );
			}
		// }, 200);

		setTimeout(function(){
			cb();
		}, 10);

		return;
	} // resizeEvent()

	/**
	 * 最終書き出しHTMLのソースを取得
	 */
	this.finalize = function(){
		var src = '';
		var bowlList = px2dtGuiEditor.contentsSourceData.getBowlList();
		for( var bowlIdx in bowlList ){
			var bowlName = bowlList[bowlIdx];
			// console.log(bowlName);
			var data = px2dtGuiEditor.contentsSourceData.getBowlData(bowlName);
			var BowlTree = new classUiUnit( '/bowl.'+bowlName, data );
			var tmpSrc = BowlTree.bind( 'finalize' );
			tmpSrc = JSON.parse( JSON.stringify( tmpSrc ) );

			if( bowlName == 'main' ){
				src += tmpSrc;
			}else{
				src += "\n";
				src += "\n";
				src += '<?php ob_start(); ?>'+"\n";
				src += tmpSrc;
				src += '<?php $px->bowl()->send( ob_get_clean(), '+JSON.stringify(bowlName)+' ); ?>'+"\n";
				src += "\n";
			}
		}
		return src;
	}

})(window.px, window.px2dtGuiEditor);