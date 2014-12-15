window.px = $.px = window.parent.px;
window.contApp = new (function(){
	var _this = this;
	var pj = px.getCurrentProject();
	var status = pj.status();

	function init(){
	}



	$(function(){
		init();
	});

})();
