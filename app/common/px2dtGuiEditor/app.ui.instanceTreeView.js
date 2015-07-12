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

		var $modroot = $('<div class="cont_instance_tree_view-modroot">')
			.attr({
				'data-guieditor-cont-data-path': containerInstancePath,
				'data-guieditor-sub-mod-name': data.subModName,
				'draggable': true //←HTML5のAPI http://www.htmq.com/dnd/
			})
			.on('dragstart', function(e){
				event.dataTransfer.setData("method", 'moveTo' );
				event.dataTransfer.setData("data-guieditor-cont-data-path", $(this).attr('data-guieditor-cont-data-path') );
				var subModName = $(this).attr('data-guieditor-sub-mod-name');
				if( typeof(subModName) === typeof('') && subModName.length ){
					event.dataTransfer.setData("data-guieditor-sub-mod-name", subModName );
				}
				e.stopPropagation();
			})
			.bind('drop', function(e){
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
						_this.init();
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
						_this.init();
						px2dtGuiEditor.ui.onEditEnd();
					} );
				}
				e.stopPropagation();
			})
			.bind('dragenter', function(e){
				$(this).addClass('cont_instanceCtrlPanel-ctrlpanel_dragentered');
				e.stopPropagation();
			})
			.bind('dragleave', function(e){
				$(this).removeClass('cont_instanceCtrlPanel-ctrlpanel_dragentered');
				e.stopPropagation();
			})
			.bind('dragover', function(e){
				e.preventDefault();
				e.stopPropagation();
			})
			.bind('click', function(e){
				_this.selectInstance( $(this).attr('data-guieditor-cont-data-path') );
				e.stopPropagation();
			})
			.dblclick(function(e){
				px2dtGuiEditor.ui.openEditWindow( $(this).attr('data-guieditor-cont-data-path'), function(){
					_this.init();
				} );
				e.stopPropagation();
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
					for( var idx in data.fields[fieldName] ){
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
			$ul.append( $li );
		}

		$dom.append( $modroot
			.append($ul)
		);
		return true;
	}

	this.close = function(){
		$treeViewCanvas.html('').hide();
		px2dtGuiEditor.ui.resizeEvent();
	}

})(window.px, window.px2dtGuiEditor);
