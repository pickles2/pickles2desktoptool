window.contAppBroccoliServer = function(px, api, options, callback){
	var _this = this;
	var php = require('phpjs');
	var data = {};
	var param = {};

	var path = require('path');
	var it79 = require('iterate79');

	callback = callback||function(){};
	// console.log(data);

	var broccoli,
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

			_pj.createBroccoliServer(
				param.page_path ,
				function(b){
					broccoli = b;
					console.log('broccoli callbacked.');
					it1.next(data);
				}
			);

		} ,
		function(it1, data){
			// console.log('--------------------- call GPI ---------------------');
			// console.log(api);
			// console.log(options);
			broccoli.gpi(
				api,
				options,
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
