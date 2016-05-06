window.contAppPx2CEServer = function(px, input, callback){
	var _this = this;
	var php = require('phpjs');
	var data = {};
	var param = {};

	var path = require('path');
	var it79 = require('iterate79');

	callback = callback||function(){};
	// console.log(data);

	var px2ce,
		px2proj;

	it79.fnc(data, [
		function(it1, data){
			param = px.utils.parseUriParam( window.location.href );
			// console.log( param );

			_pj = px.getCurrentProject();
			px2proj = _pj.px2proj;

			it1.next(data);
		} ,
		function(it1, data){
			// console.log(data);
			// console.log(param);
			// console.log(_pj.getConfig().plugins.px2dt);

			_pj.createPickles2ContentsEditorServer(
				function(b){
					px2ce = b;
					console.log('px2ce callbacked.');
					it1.next(data);
				}
			);

		} ,
		function(it1, data){
			// console.log('--------------------- call GPI ---------------------');
			// console.log(input);
			px2ce.gpi(
				input,
				function(rtn){
					// console.log(rtn);
					// console.log('------------------ / answered GPI ------------------');
					it1.next(rtn);
				}
			);
			return;

		} ,
		function(it1, data){
			callback(data);
			it1.next(data);
		}
	]);


};
