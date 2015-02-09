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


		if( !px.utils.isFile( pathBase+task.from ) ){
			// 移動元にファイルが存在しない場合は失敗
			cb( false );
			return;
		}

		// ----------------------------------
		// 移動を実行
		// console.log( pathBase+task.from );
		// console.log( pathBase+task.to );
		mkdirp( px.utils.dirname(pathBase+task.to), function(){
			px.fs.rename( pathBase+task.from, pathBase+task.to, function(){
				cb( true );
			} );
		} );
		return;
	}


})(exports);