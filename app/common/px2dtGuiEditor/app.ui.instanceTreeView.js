window.px2dtGuiEditor.ui.instanceTreeView = new(function(px, px2dtGuiEditor){
	var _this = this;
	var $treeViewCanvas,
		$preview,
		$previewDoc;

	this.init = function(){
		$treeViewCanvas = $('.cont_instance_tree_view');
		$preview = $('iframe.cont_field-preview');
		$previewDoc = $($preview[0].contentWindow.document);

		$treeViewCanvas
			.html('')
			.append( $('<a href="javascript:;">')
				.text('close')
				.click(function(){
					_this.close();
					return false;
				})
			)
			.show()
		;

		$previewDoc.find('.contents').each(function(){
			$(this).html('');
			var id = $(this).attr('id')||'main';
			px2dtGuiEditor.contentsSourceData.initBowlData(id);

			var $dom = $('<div>')
				.css({
					'border':'1px solid #000',
					'background':'#f9f9f9',
					'color':'#000',
					'padding': '1em'
				})
				.append( $('<h2>')
					.text('bowl: '+id)
				)
			;
			_this.buildModule('/bowl.'+id, $dom);
			$treeViewCanvas
				.append($dom)
			;

			// dataViewTree[id] = new classUiUnit( '/bowl.'+id, data );
			// $(this).html( dataViewTree[id].bind( 'canvas' ) );
			// $(this).html( dataViewTree[id].drawCtrlPanels($(this)) );

		});

	}

	this.buildModule = function(containerInstancePath, $dom){
		var data = px2dtGuiEditor.contentsSourceData.get( containerInstancePath );
		var modTpl = px2dtGuiEditor.moduleTemplates.get(data.modId, data.subModName);

		var $modroot = $('<div>')
			.addClass('cont_instance_tree_view-modroot')
			.addClass('cont_instanceCtrlPanel')
			.addClass( (data.subModName ? 'cont_instanceCtrlPanel-is_submodule' : '') )
			.attr({
				'data-guieditor-cont-data-path': containerInstancePath,
				'data-guieditor-sub-mod-name': data.subModName,
				'draggable': true //←HTML5のAPI http://www.htmq.com/dnd/
			})
			.bind('mouseover', function(e){
				e.stopPropagation();
				$(this).addClass('cont_instanceCtrlPanel-hovered');
			})
			.bind('mouseout', function(e){
				e.stopPropagation();
				$(this).removeClass('cont_instanceCtrlPanel-hovered');
			})
			.on('dragstart', function(e){
				e.stopPropagation();
				event.dataTransfer.setData("method", 'moveTo' );
				event.dataTransfer.setData("data-guieditor-cont-data-path", $(this).attr('data-guieditor-cont-data-path') );
				var subModName = $(this).attr('data-guieditor-sub-mod-name');
				if( typeof(subModName) === typeof('') && subModName.length ){
					event.dataTransfer.setData("data-guieditor-sub-mod-name", subModName );
				}
			})
			.bind('drop', function(e){
				e.stopPropagation();
				var method = event.dataTransfer.getData("method");
				var modId = event.dataTransfer.getData("modId");
				var moveFrom = event.dataTransfer.getData("data-guieditor-cont-data-path");
				var moveTo = $(this).attr('data-guieditor-cont-data-path');
				var subModNameTo = $(this).attr('data-guieditor-sub-mod-name');
				var subModNameFrom = event.dataTransfer.getData('data-guieditor-sub-mod-name');

				// px.message( 'modId "'+modId+'" が "'+method+'" のためにドロップされました。' );
				if( method == 'add' ){
					if( typeof(subModNameTo) === typeof('') ){
						// loopフィールドの配列を追加するエリアの場合
						px.message('ここにモジュールを追加することはできません。');
						return;
					}
					px2dtGuiEditor.contentsSourceData.addInstance( modId, moveTo, function(){
						// px.message('インスタンスを追加しました。');
						// _this.init();
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
						// _this.init();
						px2dtGuiEditor.ui.onEditEnd();
					} );
				}
			})
			.bind('dragenter', function(e){
				e.stopPropagation();
				// $(this).addClass('cont_instanceCtrlPanel-dragentered');
			})
			.bind('dragleave', function(e){
				e.stopPropagation();
				$(this).removeClass('cont_instanceCtrlPanel-dragentered');
			})
			.bind('dragover', function(e){
				e.stopPropagation();
				e.preventDefault();
				$(this).addClass('cont_instanceCtrlPanel-dragentered');
			})
			.bind('click', function(e){
				e.stopPropagation();
				instancePath = $(this).attr('data-guieditor-cont-data-path');
				px2dtGuiEditor.ui.selectInstance( instancePath, function(){
					$treeViewCanvas.find('[data-guieditor-cont-data-path]')
						.removeClass('cont_instanceCtrlPanel-ctrlpanel_selected')
					;
					$treeViewCanvas.find('[data-guieditor-cont-data-path]')
						.filter(function (index) {
							return $(this).attr("data-guieditor-cont-data-path") == instancePath;
						})
						.addClass('cont_instanceCtrlPanel-ctrlpanel_selected')
					;
				} );
			})
			.dblclick(function(e){
				e.stopPropagation();
				px2dtGuiEditor.ui.openEditWindow( $(this).attr('data-guieditor-cont-data-path'), function(){
					_this.init();
				} );
				return false;
			})
			.append( $('<h2>')
				.text((modTpl.subModName ? '@'+modTpl.subModName : modTpl.info.name||modTpl.id))
			)
		;
		var $ul = $('<ul class="cont_instance_tree_view-fields">');
		for( var fieldName in modTpl.fields ){
			var $li = $('<li>');
			$li
				.text(fieldName+' - '+modTpl.fields[fieldName].fieldType+(modTpl.fields[fieldName].fieldType=='input' ? ' - '+modTpl.fields[fieldName].type : ''))
			;
			switch( modTpl.fields[fieldName].fieldType ){
				case 'module':
				case 'loop':
					var $ulChildren = $('<ol>');
					var idx = 0;
					for( idx in data.fields[fieldName] ){
						var label = idx;
						if(modTpl.fields[fieldName].fieldType == 'module'){
							var tmpModTpl = px2dtGuiEditor.moduleTemplates.get(data.fields[fieldName][idx].modId);
							label = tmpModTpl.info.name||tmpModTpl.id
						}
						var $liChild = $('<li>');
						this.buildModule(containerInstancePath+'/fields.'+fieldName+'@'+idx, $liChild);
						$ulChildren.append( $liChild );
					}
					$li.append($ulChildren);
					break;
			}
			switch( modTpl.fields[fieldName].fieldType ){
				case 'module':
					var instancePathNext = containerInstancePath+'/fields.'+fieldName+'@'+( idx+1 );
					$ulChildren.append( $('<li>')
						.append($('<div>')
							.addClass('cont_instance_tree_view-modroot')
							.addClass('cont_instanceCtrlPanel')
							.addClass('cont_instanceCtrlPanel-adding_area_module')
							.attr( "data-guieditor-cont-data-path", instancePathNext )
							.text(
								// instancePathNext +
								'ここに新しいモジュールをドラッグしてください。'
							)
							.css({
							})
							.bind('mouseover', function(e){
								e.stopPropagation();
								$(this).addClass('cont_instanceCtrlPanel-hovered');
							})
							.bind('mouseout', function(e){
								e.stopPropagation();
								$(this).removeClass('cont_instanceCtrlPanel-hovered');
							})
							.bind('drop', function(e){
								e.stopPropagation();
								var method = event.dataTransfer.getData("method");
								if( method === 'moveTo' ){
									var moveFrom = event.dataTransfer.getData("data-guieditor-cont-data-path");
									px2dtGuiEditor.contentsSourceData.moveInstanceTo( moveFrom, $(this).attr('data-guieditor-cont-data-path'), function(){
										// px.message('インスタンスを移動しました。');
										// _this.init();
										px2dtGuiEditor.ui.onEditEnd();
									} );
									return;
								}
								if( method !== 'add' ){
									px.message('追加するモジュールをドラッグしてください。ここに移動することはできません。');
									return;
								}
								var modId = event.dataTransfer.getData("modId");
								px2dtGuiEditor.contentsSourceData.addInstance( modId, $(this).attr('data-guieditor-cont-data-path'), function(){
									// px.message('インスタンスを追加しました。');
									// _this.init();
									px2dtGuiEditor.ui.onEditEnd();
								} );
							})
							.bind('dragenter', function(e){
								e.stopPropagation();
								// $(this).addClass('cont_instanceCtrlPanel-dragentered');
							})
							.bind('dragleave', function(e){
								e.stopPropagation();
								$(this).removeClass('cont_instanceCtrlPanel-dragentered');
							})
							.bind('dragover', function(e){
								e.stopPropagation();
								e.preventDefault();
								$(this).addClass('cont_instanceCtrlPanel-dragentered');
							})
						)
					);

					break;

				case 'loop':
					var instancePathNext = containerInstancePath+'/fields.'+fieldName+'@'+( idx+1 );
					$ulChildren.append( $('<li>')
						.append($('<div>')
							.addClass('cont_instance_tree_view-modroot')
							.addClass('cont_instanceCtrlPanel')
							.addClass('cont_instanceCtrlPanel-adding_area_loop')
							.attr({
								'data-guieditor-mod-id': modTpl.id,
								'data-guieditor-sub-mod-name': fieldName,
								'data-guieditor-cont-data-path': instancePathNext
							})
							.text(
								// instancePathNext +
								'ここをダブルクリックして配列要素を追加してください。'
							)
							.css({
							})
							.bind('mouseover', function(e){
								e.stopPropagation();
								$(this).addClass('cont_instanceCtrlPanel-hovered');
							})
							.bind('mouseout', function(e){
								e.stopPropagation();
								$(this).removeClass('cont_instanceCtrlPanel-hovered');
							})
							.bind('drop', function(e){
								e.stopPropagation();
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
										// _this.init();
										px2dtGuiEditor.ui.onEditEnd();
									} );
									return;
								}
								px.message('ダブルクリックしてください。ドロップできません。');
								return;
							})
							.bind('dragenter', function(e){
								e.stopPropagation();
								// $(this).addClass('cont_instanceCtrlPanel-dragentered');
							})
							.bind('dragleave', function(e){
								e.stopPropagation();
								$(this).removeClass('cont_instanceCtrlPanel-dragentered');
							})
							.bind('dragover', function(e){
								e.stopPropagation();
								e.preventDefault();
								$(this).addClass('cont_instanceCtrlPanel-dragentered');
							})
							.bind('click', function(e){
								// 特に処理なし
							})
							.bind('dblclick', function(e){
								e.stopPropagation();
								var modId = $(this).attr("data-guieditor-mod-id");
								var subModName = $(this).attr("data-guieditor-sub-mod-name");
								px2dtGuiEditor.contentsSourceData.addInstance( modId, $(this).attr('data-guieditor-cont-data-path'), function(){
									// _this.init();
									px2dtGuiEditor.ui.onEditEnd();
								}, subModName );
								e.preventDefault();
							})
						)
					);
					break;
			}
			$ul.append( $li );

		}

		$dom.append( $modroot
			.append($ul)
		);
		return true;
	}

	this.close = function(){
		$treeViewCanvas.hide().html('');
		px2dtGuiEditor.ui.resizeEvent();
	}

})(window.px, window.px2dtGuiEditor);
