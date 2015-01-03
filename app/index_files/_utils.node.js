/**
 * node utilities
 */
(function(exports){
	var _fs = require('fs');
	var _path = require('path'); // see: http://nodejs.jp/nodejs.org_ja/docs/v0.4/api/path.html
	var _pathCurrentDir = process.cwd();

	/**
	 * システムコマンドを実行する(exec)
	 */
	exports.exec = function(cmd, fnc, opts){
		opts = opts||{};
		if( opts.cd ){
			process.chdir( opts.cd );
		}
		var proc = require('child_process').exec(cmd, fnc);
		if( opts.cd ){
			process.chdir( _pathCurrentDir );
		}
		return proc;
	}

	/**
	 * システムコマンドを実行する(spawn)
	 */
	exports.spawn = function(cmd, cliOpts, opts){
		opts = opts||{};
		if( opts.cd ){
			process.chdir( opts.cd );
		}
		// console.log( opts.cd );
		// console.log( process.cwd() );

		var proc = require('child_process').spawn(cmd, cliOpts);
		if( opts.success ){ proc.stdout.on('data', opts.success); }
		if( opts.error ){ proc.stderr.on('data', opts.error); }
		if( opts.complete ){ proc.on('close', opts.complete); }

		if( opts.cd ){
			process.chdir( _pathCurrentDir );
		}
		// console.log( process.cwd() );

		return proc;
	}

	/**
	 * URLを開く
	 */
	exports.openURL = function( url ){
		this.spawn( 'open', [url], {} );
	}

	/**
	 * ディレクトリ名を得る
	 * phpJSから拝借
	 */
	exports.dirname = function(path){
		return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
	}

	exports.escapeRegExp = function(str) {
		return str.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
	}

	exports.parsePath = function( path ){
		var rtn = {};
		rtn.path = path;
		rtn.basename = this.basename( rtn.path );
		rtn.dirname = this.dirname( rtn.path );
		rtn.ext = rtn.basename.replace( new RegExp('^.*\\.'), '' );
		rtn.basenameExtless = rtn.basename.replace( new RegExp('\\.'+this.escapeRegExp(rtn.ext)+'$'), '' );
		return rtn;
	}

	exports.basename = function( path ){
		var rtn = '';
		rtn = path.replace( new RegExp('^.*\\/'), '' );
		return rtn;
	}

	exports.mkdir = function(path){
		if( _fs.existsSync(path) ){
			return true;
		}
		_fs.mkdirSync(path, 0777);
		return true;
	}

	exports.fileExists = function(path){
		if( !_fs.existsSync(path) ){
			return false;
		}
		return true;
	}

	exports.isFile = function(path){
		if( !this.fileExists(path) ){
			return false;
		}
		if( !_fs.statSync(path).isFile() ){
			return false;
		}
		return true;
	}

	exports.isDirectory = function(path){
		if( !this.fileExists(path) ){
			return false;
		}
		if( !_fs.statSync(path).isDirectory() ){
			return false;
		}
		return true;
	}

	exports.mkdirAll = function(path){
		if( this.fileExists(path) ){
			return true;
		}
		this.mkdirAll(this.dirname(path));
		this.mkdir(path, 0777);
		return true;
	}

	/**
	 * パスから拡張子を取り出して返す
	 */
	exports.getExtension = function(path){
		var ext = path.replace( new RegExp('^.*?\.([a-zA-Z0-9\_\-]+)$'), '$1' );
		return ext;
	}

	/**
	 * 致命的エラーを発生させる。
	 * エラーメッセージを出力して終了する。
	 */
	exports.fatalError = function( message ){
		console.log('[ERROR] ' + message);
		process.exit();
		return;
	}

	/**
	 * 配列を文字列に連結する
	 * phpJSから拝借
	 */
	exports.implode = function(glue, pieces){
		var i = '',
		retVal = '',
		tGlue = '';
		if (arguments.length === 1) {
			pieces = glue;
			glue = '';
		}
		if (typeof pieces === 'object') {
			if (Object.prototype.toString.call(pieces) === '[object Array]') {
				return pieces.join(glue);
			}
			for (i in pieces) {
				retVal += tGlue + pieces[i];
				tGlue = glue;
			}
			return retVal;
		}
		return pieces;
	}

	/**
	 * 配列をCSV形式に変換する
	 */
	exports.mkCsv = function(ary){
		var rtn = '';
		for( var i1 in ary ){
			for( var i2 in ary[i1] ){
				if(typeof(ary[i1][i2])!==typeof('')){
					ary[i1][i2]='';
					continue;
				}
				ary[i1][i2] = ary[i1][i2].replace(new RegExp('\"', 'g'), '""');
				if( ary[i1][i2].length ){
					ary[i1][i2] = '"'+ary[i1][i2]+'"';
				}
				continue;
			}
			rtn += this.implode(',', ary[i1]) + "\n";
		}
		return rtn;
	}

	/**
	 * ファイルを削除する
	 */
	exports.rm = function(path){
		if( !this.isFile(path) ){ return true; }
		return _fs.unlinkSync(path);
	}

	/**
	 * ファイルに行を追加する
	 */
	exports.fileAppend = function(path, contents){
		if( !this.isFile(path) ){
			return _fs.writeFileSync( path , contents );
		}

		var stat = _fs.statSync(path);
		var fd = _fs.openSync(path, "a");
		var rtn = _fs.writeSync(fd, contents.toString(), stat.size);
		_fs.closeSync(fd);

		return rtn;
	}


	/**
	 * 直列処理
	 */
	exports.iterate = function(ary, fnc, fncComplete){
		new (function( ary, fnc ){
			this.idx = -1;
			this.idxs = [];
			for( var i in ary ){
				this.idxs.push(i);
			}
			this.ary = ary||[];
			this.fnc = fnc||function(){};
			this.fncComplete = fncComplete||function(){};

			this.next = function(){
				if( this.idx+1 >= this.idxs.length ){
					this.fncComplete();
					return this;
				}
				this.idx ++;
				this.fnc( this, this.ary[this.idxs[this.idx]], this.idxs[this.idx] );
				return this;
			}
			this.next();
		})(ary, fnc);
	}

	/**
	 * 関数の直列処理
	 */
	exports.iterateFnc = function(aryFuncs){
		function iterator( aryFuncs ){
			aryFuncs = aryFuncs||[];

			var idx = 0;
			var funcs = aryFuncs;

			this.start = function(arg){
				arg = arg||{};
				if(funcs.length <= idx){return this;}
				(funcs[idx++])(this, arg);
				return this;
			}

			this.next = this.start;
		}
		return new iterator(aryFuncs);
	}

	/**
	 * URIパラメータをパースする
	 */
	exports.parseUriParam = function(url){
		var paramsArray = [];
		parameters = url.split("?");
		if( parameters.length > 1 ) {
			var params = parameters[1].split("&");
			for ( var i = 0; i < params.length; i++ ) {
				var paramItem = params[i].split("=");
				for( var i2 in paramItem ){
					paramItem[i2] = decodeURIComponent( paramItem[i2] );
				}
				paramsArray.push( paramItem[0] );
				paramsArray[paramItem[0]] = paramItem[1];
			}
		}
		return paramsArray;
	}

	/**
	 * Markdown形式のテキストをHTMLに変換
	 */
	exports.markdown = function( src ){
		var markdown = require( "markdown" ).markdown;
		var rtn = markdown.toHTML( src );
		return rtn;
	}

})(exports);
