/**
 * px.project.searcher
 */
module.exports = function( px, pj ) {
	// global.__defineGetter__('__LINE__', function () { return (new Error()).stack.split('\n')[2].split(':').reverse()[1]; }); var var_dump = function(val){ console.log(val); };

	var _this = this;


	/**
	 * GUI編集されているコンテンツを持つページの一覧を取得
	 */
	this.getGuiEditPages = function(cb){
		cb = cb||function(){};

		var rtn = [];
		var sitemap = pj.site.getSitemap();
		for(var idx in sitemap){
			var pageInfo = sitemap[idx];

			var procType = pj.get_path_proc_type( pageInfo.path );
			if( procType == 'html' || procType == 'htm' ){
			}else{
				continue;
			}

			var procType = pj.getPageContentProcType( pageInfo.path );
			if( procType == 'html.gui' ){
			}else{
				continue;
			}

			rtn[idx] = pageInfo;
		}
		cb(rtn);
		return this;

		// opts = opts||function(){};
		// opts.success = opts.success||function(){};
		// opts.complete = opts.complete||function(){};
		// px.utils.iterateFnc([
		// 	function(it, arg){
		// 		arg.sitemap = pj.site.getSitemap();
		// 		// console.log( sitemap );
		// 		it.next(arg);
		// 	} ,
		// 	function(it, arg){
		// 		px.utils.iterate(
		// 			arg.sitemap ,
		// 			function( it1, sitemapRow, idx1 ){
		// 				console.log(sitemapRow);
		// 				opts.success( sitemapRow.path );

		// 				px.utils.iterateFnc([
		// 					function(it2, arg2){
		// 						var procType = pj.get_path_proc_type( arg2.pageInfo.path );
		// 						opts.success( ' -> ' + procType );
		// 						switch( procType ){
		// 							case 'html':
		// 							case 'htm':
		// 								it2.next(arg2);
		// 								break;
		// 							default:
		// 								opts.success( ' -> SKIP' );
		// 								opts.success( "\n" );
		// 								it1.next();
		// 								break;
		// 						}
		// 					} ,
		// 					function(it2, arg2){
		// 						var procType = pj.getPageContentProcType( arg2.pageInfo.path );
		// 						opts.success( ' -> ' + procType );
		// 						switch( procType ){
		// 							case 'html.gui':
		// 								it2.next(arg2);
		// 								break;
		// 							default:
		// 								opts.success( ' -> SKIP' );
		// 								opts.success( "\n" );
		// 								it1.next();
		// 								break;
		// 						}
		// 					} ,
		// 					function(it2, arg2){
		// 						pj.buildGuiEditContent( arg2.pageInfo.path, function(result){
		// 							if(result){
		// 								opts.success( ' -> done' );
		// 							}else{
		// 								opts.success( ' -> ERROR!' );
		// 							}
		// 							opts.success( "\n" );
		// 							it2.next(arg2);
		// 						} );
		// 					} ,
		// 					function(it2, arg2){
		// 						it1.next();
		// 					}
		// 				]).start({"pageInfo": sitemapRow});

		// 			} ,
		// 			function(){
		// 				it.next();
		// 			}
		// 		);
		// 	} ,
		// 	function(it, arg){
		// 		opts.complete(true);
		// 	}
		// ]).start({});
		// return this;
	}

	return this;
};