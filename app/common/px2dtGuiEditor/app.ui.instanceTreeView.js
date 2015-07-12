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
				'data-guieditor-cont-data-path': containerInstancePath
			})
			.dblclick(function(e){
				px2dtGuiEditor.ui.openEditWindow( $(this).attr('data-guieditor-cont-data-path') );
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
	}

})(window.px, window.px2dtGuiEditor);
