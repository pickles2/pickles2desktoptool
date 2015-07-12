window.px2dtGuiEditor.ui.instanceTreeView = new(function(px, px2dtGuiEditor){
	var _this = this;
	var $treeViewCanvas;

	this.init = function(){
		$treeViewCanvas = $('.cont_instance_tree_view');
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
	}

	this.close = function(){
		$treeViewCanvas.html('').hide();
	}

})(window.px, window.px2dtGuiEditor);
