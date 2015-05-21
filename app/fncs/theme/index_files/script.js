window.px = window.parent.px;
window.contApp = new (function(){
	var _this = this;
	var pj = px.getCurrentProject();
	var status = pj.status();

	function init(){
	}

	/**
	 * フォルダを開く
	 */
	this.openInFinder = function(){
		px.utils.openURL( pj.get('path')+'/'+pj.get('home_dir')+'/themes/' );
	}

	/**
	 * イベント
	 */
	$(function(){
		init();
	});

})();
