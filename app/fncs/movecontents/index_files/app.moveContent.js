(function(exports){

	/**
	 * コンテンツを移動する
	 */
	exports.moveContent = function(px, pj, task, cb){
		cb = cb||function(){};

		var path = require('path');
		var mkdirp = require('mkdirp');

		var pathBase = px.fs.realpathSync( pj.get_realpath_controot() )+'/';
		// console.log( pathBase );
		// console.log( task );


		var pageInfo = pj.site.getPageInfo( task.from );
		if( pageInfo !== null ){
			// from をpathとしてサイトマップを検索したら発見した場合

			if( pageInfo.path !== pageInfo.content ){
				// パスとコンテンツパスが一緒じゃないと移動できない。
				// おかしくなっちゃうから。
				cb( false );
				return;
			}

			// console.log( pj.findPageContent( task.from ) );
		}else{
			// from はサイトマップに登録されていないファイルだった場合
		}


		// ----------------------------------
		// 移動を実行
		// console.log( pathBase+task.from );
		// console.log( pathBase+task.to );
		px.utils.iterateFnc([
			function( it, arg ){
				mkdirp( px.utils.dirname(pathBase+task.to), function(){
					it.next( arg );
				} );
			} ,
			function( it, arg ){
				// コンテンツファイル本体を移動
				var fromList = [];
				if( px.utils.isFile( pathBase+task.from ) ){
					fromList.push( task );
				}
				var conf = pj.getConfig();
				for( var idx in conf.funcs.processor ){
					if( px.utils.isFile( pathBase+task.from+'.'+idx ) ){
						fromList.push( {'from':task.from+'.'+idx, 'to':task.to+'.'+idx} );
					}
				}
				var done = 0;
				for( var idx in fromList ){
					px.fs.rename( pathBase+fromList[idx].from, pathBase+fromList[idx].to, function(){
						done ++;
						if( done >= fromList.length ){
							it.next( arg );
						}
					} );
				}
			} ,
			function( it, arg ){
				// コンテンツリソースディレクトリを移動
				var dirFrom = px.utils.trim_extension( pathBase+task.from )+'_files/';
				var dirTo = px.utils.trim_extension( pathBase+task.to )+'_files/';
				if( !px.utils.isDirectory( dirFrom ) ){
					// 存在しない場合はスキップ
					it.next( arg );
					return;
				}
				px.fs.rename( dirFrom, dirTo, function(){
					it.next( arg );
				} );
			} ,
			function( it, arg ){
				cb( true );
			}
		]).start({});
		return;
	}


})(exports);