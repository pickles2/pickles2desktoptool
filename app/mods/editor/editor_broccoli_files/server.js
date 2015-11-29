window.contAppBroccoliServer = function(px, api, options, callback){
	var _this = this;
	var php = require('phpjs');
	var data = {};
	var param = {};

	var path = require('path');
	var it79 = require('iterate79');

	callback = callback||function(){};
	// console.log(data);

	var Broccoli = require('broccoli-html-editor');
	var broccoli,
		px2proj;

	it79.fnc(data, [
		function(it1, data){
			param = px.utils.parseUriParam( window.location.href );
			console.log( param );

			_pj = px.getCurrentProject();
			px2proj = _pj.px2proj;

			it1.next(data);
		} ,
		function(it1, data){
			px2proj.get_path_homedir(function(path_homedir){
				// console.log('message: '+ JSON.stringify(path_homedir));
				data.path_homedir = path_homedir;
				it1.next(data);
			});
		} ,
		function(it1, data){
			data.documentRoot = path.resolve(_pj.get('path'), _pj.get('entry_script'), '..')+'/'
			px2proj.realpath_files(param.page_path, '', function(realpath){
				data.realpathDataDir = path.resolve(realpath, 'guieditor.ignore')+'/';

				px2proj.path_files(param.page_path, '', function(localpath){
					data.pathResourceDir = path.resolve(localpath, 'resources')+'/';
					it1.next(data);
				});

			});
		} ,
		function(it1, data){
			console.log(data);
			console.log(_pj.getConfig().plugins.px2dt);

			// broccoli setup.
			broccoli = new Broccoli();

			// console.log(broccoli);
			broccoli.init(
				{
					'paths_module_template': _pj.getConfig().plugins.px2dt.paths_module_template ,
					'documentRoot': data.documentRoot,
					'pathHtml': param.page_path,
					'pathResourceDir': data.pathResourceDir,
					'realpathDataDir': data.realpathDataDir,
					'customFields': {
						// 'table': require('broccoli-html-editor--table-field'),
						// 'psd': require('broccoli-psd-field')
					} ,
					'bindTemplate': function(htmls, callback){
						var fin = '';
						for( var bowlId in htmls ){
							if( bowlId == 'main' ){
								fin += htmls['main']+"\n";
								fin += "\n";
							}else{
								fin += '<?php ob_start(); ?>'+"\n";
								fin += htmls[bowlId]+"\n";
								fin += '<?php $px->bowl()->send( ob_get_clean(), '+JSON.stringify(bowlId)+' ); ?>'+"\n";
								fin += "\n";
							}
						}
						callback(fin);
						return;
					}

				},
				function(){
					it1.next(data);
				}
			);
		} ,
		function(it1, data){
			broccoli.gpi(
				api,
				options,
				function(rtn){
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
