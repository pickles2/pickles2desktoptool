window.px2dtGuiEditor.ui.instanceTreeView = new(function(px, px2dtGuiEditor){
	var _this = this;
	var $treeViewCanvas,
		$preview,
		$previewDoc;

	this.init = function(){
		$treeViewCanvas = $('.cont_instance_tree_view')
			.unbind('click')
			.bind(
				'click',
				function(){ _this.unselectInstance(); }
			)
		;
		$preview = $('iframe.cont_field-preview');
		$previewDoc = $($preview[0].contentWindow.document);

		var scrollTop = $treeViewCanvas.scrollTop();

		$treeViewCanvas
			.html('')
			.append( $('<ul class="horizontal"><li class="horizontal-li"><a href="javascript:;" class="icon">GUI編集に戻る</a></li></ul>')
				.click(function(){
					_this.close();
					return false;
				})
				.css({
					'position':'fixed',
					'left': 5,
					'top': 5
				})
			)
			.show()
		;

		var _px2DtConfig = px.getCurrentProject().getPx2DTConfig();
		var _contentsAreaSelector = '.contents';
		var _contentsBowlNameBy = 'id';
		if( _px2DtConfig.contents_area_selector ){
			_contentsAreaSelector = _px2DtConfig.contents_area_selector;
		}
		if( _px2DtConfig.contents_bowl_name_by ){
			_contentsBowlNameBy = _px2DtConfig.contents_bowl_name_by;
		}

		$previewDoc.find( _contentsAreaSelector ).each(function(){
			$(this).html('');
			var id = $(this).attr( _contentsBowlNameBy )||'main';
			px2dtGuiEditor.contentsSourceData.initBowlData(id);

			var $dom = $('<div>')
				.css({
					'border':'1px solid #000',
					'background':'#f9f9f9',
					'color':'#000',
					'padding': '1em',
					'margin': '2em auto',
					'width': '94%'
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

		$treeViewCanvas.scrollTop(scrollTop);
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
					if( moveFrom === moveTo ){
						// 移動元と移動先が同一の場合、キャンセルとみなす
						$(this).removeClass('cont_instanceCtrlPanel-dragentered');
						return;
					}
					px2dtGuiEditor.contentsSourceData.moveInstanceTo( moveFrom, moveTo, function(){
						// px.message('インスタンスを移動しました。');
						// _this.init();
						px2dtGuiEditor.ui.onEditEnd();
					} );
					return;
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
				_this.selectInstance( instancePath, function(){} );
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
		if( containerInstancePath.match(new RegExp('^\\/bowl\\.[^/]*$')) ){
			$modroot.unbind();
		}

		var $ul = $('<ul class="cont_instance_tree_view-fields">');
		for( var fieldName in modTpl.fields ){
			var $li = $('<li>');
			$li
				.text(fieldName+' - '+modTpl.fields[fieldName].fieldType+(modTpl.fields[fieldName].fieldType=='input' ? ' - '+modTpl.fields[fieldName].type : ''))
			;
			switch( modTpl.fields[fieldName].fieldType ){
				case 'input':
					var $preview = $('<div>').addClass('cont_instance_tree_view-field_preview');
					$preview.append(
						(function(type, fieldData, mod){
							var rtn = '';
							if( px2dtGuiEditor.fieldDefinitions[type] ){
								rtn = px2dtGuiEditor.fieldDefinitions[type].mkPreviewHtml( fieldData, mod );
							}else{
								rtn = px2dtGuiEditor.fieldBase.mkPreviewHtml( fieldData, mod );
							}
							return rtn;
						})(modTpl.fields[fieldName].type, data.fields[fieldName], modTpl.fields[fieldName])
					);
					$li.append( $preview );
					break;
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
					var instancePathNext = containerInstancePath+'/fields.'+fieldName+'@'+( data.fields[fieldName].length );
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
									var moveTo = $(this).attr('data-guieditor-cont-data-path');
									if( moveFrom === moveTo ){
										// 移動元と移動先が同一の場合、キャンセルとみなす
										$(this).removeClass('cont_instanceCtrlPanel-dragentered');
										return;
									}
									px2dtGuiEditor.contentsSourceData.moveInstanceTo( moveFrom, moveTo, function(){
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
					var instancePathNext = containerInstancePath+'/fields.'+fieldName+'@'+( data.fields[fieldName].length );
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
									if( moveFrom === moveTo ){
										// 移動元と移動先が同一の場合、キャンセルとみなす
										$(this).removeClass('cont_instanceCtrlPanel-dragentered');
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

		if( $ul.find('>*').size() ){
			$modroot.append($ul);
		}

		$dom.append( $modroot );
		return true;
	}

	this.selectInstance = function( instancePath, callback ){
		callback = callback || function(){};
		this.unselectInstance(function(){
			px2dtGuiEditor.ui.selectInstance( instancePath, function(){
				if( instancePath.match(new RegExp('^\\/bowl\\.[^/]*$')) ){
					callback();
					return;
				}
				$treeViewCanvas.find('[data-guieditor-cont-data-path]')
					.filter(function (index) {
						return $(this).attr("data-guieditor-cont-data-path") == instancePath;
					})
					.addClass('cont_instanceCtrlPanel-ctrlpanel_selected')
				;
				callback();
			} );
		});
		return this;
	}

	this.unselectInstance = function(callback){
		px2dtGuiEditor.ui.unselectInstance( function(){
			$treeViewCanvas.find('[data-guieditor-cont-data-path]')
				.removeClass('cont_instanceCtrlPanel-ctrlpanel_selected')
			;
			callback();
		} );
		return this;
	}

	this.close = function(){
		$treeViewCanvas.hide().html('');
		px2dtGuiEditor.ui.resizeEvent();
	}

})(window.px, window.px2dtGuiEditor);
