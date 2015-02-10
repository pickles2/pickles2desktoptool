(function(exports){

	/**
	 * コンテンツファイルのコードを書き換える
	 */
	function replaceContentSrc( px, pj, code, pathBase, task, resourceDir ){

		// ローカルリソースの参照先置き換え
		function getBasenameOfResDir(pathResDir){
			pathResDir = pathResDir.replace( new RegExp('\\/+$'), '' );
			pathResDir = px.utils.basename( pathResDir );
			return pathResDir;
		}
		var replaceStr = {
			before: getBasenameOfResDir(resourceDir.from) ,
			after: getBasenameOfResDir(resourceDir.to)
		}
		code = code.replace( new RegExp( px.utils.escapeRegExp(replaceStr.before), 'g' ), replaceStr.after );

		return code;
	}

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
				arg.fromList = [];
				if( px.utils.isFile( pathBase+task.from ) ){
					arg.fromList.push( task );
				}
				var conf = pj.getConfig();
				for( var idx in conf.funcs.processor ){
					if( px.utils.isFile( pathBase+task.from+'.'+idx ) ){
						arg.fromList.push( {'from':task.from+'.'+idx, 'to':task.to+'.'+idx} );
					}
				}
				var done = 0;
				for( var idx in arg.fromList ){
					px.fs.rename( pathBase+arg.fromList[idx].from, pathBase+arg.fromList[idx].to, function(){
						done ++;
						if( done >= arg.fromList.length ){
							it.next( arg );
						}
					} );
				}
			} ,
			function( it, arg ){
				// コンテンツリソースディレクトリを移動
				var dirFrom = px.utils.trim_extension( task.from )+'_files/';
				var dirTo = px.utils.trim_extension( task.to )+'_files/';
				arg.resourceDir = {
					"from": dirFrom ,
					"to": dirTo
				};
				if( !px.utils.isDirectory( pathBase+arg.resourceDir.from ) ){
					// 存在しない場合はスキップ
					it.next( arg );
					return;
				}
				px.fs.rename( pathBase+arg.resourceDir.from, pathBase+arg.resourceDir.to, function(){
					it.next( arg );
				} );
			} ,
			function( it, arg ){
				// コンテンツリソースへのリンクを置き換え
				var done = 0;
				for( var idx in arg.fromList ){
					(function( idx, fromListRow ){
						px.fs.readFile( pathBase+fromListRow.to, {}, function(err, data){
							var src = new Buffer(data).toString();
							src = replaceContentSrc(px, pj, src, pathBase, fromListRow, arg.resourceDir);
							if( src === data ){
								done ++;
								if( done >= arg.fromList.length ){
									it.next( arg );
								}
							}else{
								px.fs.writeFile( pathBase+fromListRow.to, src, {}, function(err){
									done ++;
									if( done >= arg.fromList.length ){
										it.next( arg );
									}
								});
							}
						});
					})( idx, arg.fromList[idx] );
				}
			} ,
			function( it, arg ){
				cb( true );
			}
		]).start({});
		return;
	}


})(exports);