/**
 * utilities
 */
(function(exports){
	var _fs = require('fs');
	var _child_process = require('child_process');

	/**
	 * ディレクトリ名を得る
	 * phpJSから拝借
	 */
	exports.dirname = function(path){
		return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
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

})(exports);
