window.contAppBroccoliServer = function(px, page_path, callback){
	callback = callback||function(){};

	var _this = this;
	var data = {};
	var _param = px.utils.parseUriParam( window.location.href );
	// console.log( _param );

	var it79 = require('iterate79');
	var px2te,
		px2all;
	var _pj = px.getCurrentProject();


	/**
	 * broccoli(サーバーサイド)を生成する
	 */
	this.createBroccoliServer = function(theme_id, layout_id, callback){
		callback = callback || function(){};
		var page_path = '/'+layout_id+'.html';
		var Broccoli = require('broccoli-html-editor');
		var path = require('path');
		var _pj = this;

		// broccoli setup.
		var broccoli = new Broccoli();

		// console.log(broccoli);
		broccoli.init(
			{
				'appMode': 'desktop', // 'web' or 'desktop'. default to 'web'
				'paths_module_template': _pj.getConfig().plugins.px2dt.paths_module_template ,
				'documentRoot': px2all.realpath_homedir+'themes/'+theme_id+'/',
				'pathHtml': page_path,
				'pathResourceDir': px2all.realpath_homedir+'themes/'+theme_id+'/theme_files/layouts/'+layout_id+'/',
				'realpathDataDir': px2all.realpath_homedir+'themes/'+theme_id+'/guieditor.ignore/'+layout_id+'/',
				'customFields': _pj.mkBroccoliCustomFieldOptionBackend() ,
				'bindTemplate': function(htmls, callback){
					var fin = '';
					for( var bowlId in htmls ){
						if( bowlId == 'main' ){
							fin += htmls['main'];
						}else{
							fin += "\n";
							fin += "\n";
							fin += '<?php ob_start(); ?>'+"\n";
							fin += htmls[bowlId]+"\n";
							fin += '<?php $px->bowl()->send( ob_get_clean(), '+JSON.stringify(bowlId)+' ); ?>'+"\n";
							fin += "\n";
						}
					}
					callback(fin);
					return;
				} ,
				'log': function(msg){
					px.log(msg);
				}

			},
			function(){
				callback(broccoli);
			}
		);
		return this;
	}

	it79.fnc(data, [
		function(it1, data){
			// --------------------------------------
			// Pickles 2 の各種情報から、
			// テーマプラグインの一覧を取得
			_pj.px2proj.query(
				'/?PX=px2dthelper.get.all',
				{
					"output": "json",
					"complete": function(result, code){
						px2all = JSON.parse(result);
						// console.log(px2all);
						it1.next(data);
						return;
					}
				}
			);
		} ,
		function(it1, data){
			// console.log(data);
			// console.log(_param);
			// console.log(_pj.getConfig().plugins.px2dt);

			_this.createBroccoliServer(
				_param.theme_id ,
				_param.layout_id ,
				function(b){
					px2te = b;
					console.log('px2te callbacked.');
					it1.next(data);
				}
			);

		} ,
		function(it1, data){
			callback(px2te);
			it1.next(data);
		}
	]);


};
