(function(exports){

	/**
	 * 移動されたコンテンツのリンクを張り替える
	 */
	exports.relink = function(px, pj, task, targetList, cb){
		cb = cb||function(){};


		/**
		 * パスの置き換え
		 */
		function replacePath( path, currentPath, task ){
			var tmp = px.php.trim(path);
			if( tmp.match( new RegExp('^[a-zA-Z]+\\:') ) ){
				return path;
			}
			if( tmp.match( new RegExp('^\\/\\/') ) ){
				return path;
			}

			var mem = {};
			path.match( new RegExp('^([\\s]*)[\\s\\S]*?([\\s]*)$') );
			mem.whiteSpaceBefore = RegExp.$1;
			mem.whiteSpaceAfter  = RegExp.$2;
			mem.dirname = px.path.dirname( tmp );
			mem.basename = px.path.basename( tmp );

			var is = {};
			is.abs = px.path.isAbsolute(tmp);
			is.slashClosed = tmp.match( new RegExp('\\/$') );
			is.dotSlashStart = tmp.match( new RegExp('^\\.\\/') );

			if( is.slashClosed ){
				mem.dirname = px.path.dirname( tmp+'index.html' );
				mem.basename = '';
			}

			tmp = px.path.resolve('/', px.path.dirname(currentPath), mem.dirname);
			if( is.slashClosed ){
				tmp += '/';
			}else if( mem.basename.length ){
				tmp += '/'+mem.basename;
			}
console.log( tmp, task.from, currentPath );
			if( tmp != task.from ){
				return path;
			}

return path;
			// tmp = task.to;

			// if( !is.abs ){
			// 	tmp = px.path.relative( px.path.dirname(task.to), tmp );
			// 	if( !tmp.length ){
			// 		tmp = '.';
			// 	}
			// 	if( is.dotSlashStart ){
			// 		tmp = './'+tmp;
			// 	}
			// }
			// if( is.slashClosed ){
			// 	tmp += '/';
			// }else if( mem.basename.length ){
			// 	tmp += '/'+mem.basename;
			// }

			// tmp = mem.whiteSpaceBefore + tmp + mem.whiteSpaceAfter;
			// return tmp;
		}// replacePath();


		/**
		 * HTMLフォーマット向けの置換処理
		 */
		function replaceHtml( code, currentPath, task ){
			var tmp = code;
			code = '';
			while( 1 ){
				if( tmp.match( new RegExp( '^([\\s\\S]*?)(href|src)\\=(\\"|\\\')([\\s\\S]*?)(?:\\3)([\\s\\S]*)$','i' ) ) === null ){
					code += tmp;
					break;
				}
				var memo = {}
				memo.before = RegExp.$1 + RegExp.$2 + '=' + RegExp.$3;
				memo.after = RegExp.$3;
				memo.path = RegExp.$4;
				tmp = RegExp.$5;

				memo.path = replacePath( memo.path, currentPath, task );
				code += memo.before + memo.path + memo.after;
				continue;
			}
			return code;
		}// replaceHtml()

		px.utils.iterate(
			targetList ,
			function(it, row, idx){
				px.fs.readFile( pj.get_realpath_controot()+row, {}, function(err, data){
					var code = data.toString();
					code = replaceHtml( code, row, task );

					// px.fs.writeFile( pj.get_realpath_controot()+row, code, {}, function(){
						it.next();
					// } );
				} );
			},
			function(){
				cb( true );
			}
		);

		// for( var idx in targetList ){
		// }

	}


})(exports);