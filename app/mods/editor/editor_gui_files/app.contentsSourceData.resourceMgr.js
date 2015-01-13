window.contApp.contentsSourceData.resourceMgr = new(function(px, contApp){
	var _this = this;
	var _contFilesDirPath;
	var _resourcesDirPath;

	/**
	 * initialize resource Manager
	 */
	this.init = function( contFilesDirPath, cb ){
		_contFilesDirPath = contFilesDirPath;
		_resourcesDirPath = _contFilesDirPath + '/guieditor.ignore/resources/';
		_resourcesPublishDirPath = _contFilesDirPath + '/resources/';

		cb();
		return this;
	}

/*

{
	"resources":{
		
	},
	"bowl":{
		・・・・・・
	}
}


*/

})(window.px, window.contApp);