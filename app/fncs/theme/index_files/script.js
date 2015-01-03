window.px = $.px = window.parent.px;
window.contApp = new (function(){
	var _this = this;
	var pj = px.getCurrentProject();
	var status = pj.status();

	function init(){
	}

	/**
	 * Finderで表示する
	 */
	this.openInFinder = function(){
		px.utils.spawn('open', [pj.get('path')+'/'+pj.get('home_dir')+'/themes/'], {});
	}

	/**
	 * イベント
	 */
	$(function(){
		init();
	});

})();
