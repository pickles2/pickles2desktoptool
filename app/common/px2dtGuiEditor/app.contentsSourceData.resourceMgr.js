window.px2dtGuiEditor.contentsSourceData.resourceMgr = new(function(px, px2dtGuiEditor){
	var _this = this;
	var _contFilesDirPath;
	var _resourcesDirPath;
	var _dataJsonPath;

	var _resourceDb = {};

	/**
	 * initialize resource Manager
	 */
	this.init = function( contFilesDirPath, cb ){
		_contFilesDirPath = contFilesDirPath;
		_resourcesDirPath = _contFilesDirPath + '/guieditor.ignore/resources/';
		_resourcesPublishDirPath = _contFilesDirPath + '/resources/';
		_dataJsonPath = _contFilesDirPath + '/guieditor.ignore/data.json';
		loadResourceList( function(){
			cb();
		} );
		return this;
	}

	/**
	 * Loading resource list
	 */
	function loadResourceList( cb ){
		_resourceDb = {};
		if( !px.utils.isDirectory( _resourcesDirPath ) ){
			px.utils.mkdir( _resourcesDirPath );
		}

		var list = px.fs.readdirSync( _resourcesDirPath );
		for( var idx in list ){
			var resKey = list[idx];
			if( !px.utils.isDirectory( _resourcesDirPath+'/'+resKey ) ){ continue; }
			_resourceDb[resKey] = {};
			if( px.utils.isFile( _resourcesDirPath+'/'+resKey+'/res.json' ) ){
				var jsonStr = px.fs.readFileSync( _resourcesDirPath+'/'+resKey+'/res.json' );
				_resourceDb[resKey] = JSON.parse( jsonStr );
			}
		}
		cb();
		return;
	}

	/**
	 * save resources
	 * @param  {Function} cb Callback function.
	 * @return {boolean}     Always true.
	 */
	this.save = function( cb ){
		cb = cb || function(){};

		if( px.utils.isDirectory( _resourcesPublishDirPath ) ){
			// 公開リソースディレクトリを一旦削除
			px.utils.rmdir_r( _resourcesPublishDirPath );
		}
		if( !px.utils.isDirectory( _resourcesPublishDirPath ) ){
			// 公開リソースディレクトリ作成
			px.utils.mkdir( _resourcesPublishDirPath );
		}

		// 使われていないリソースを削除
		var jsonSrc = px.fs.readFileSync( _dataJsonPath );
		jsonSrc = JSON.parse( JSON.stringify(jsonSrc.toString()) );
		for( var resKey in _resourceDb ){
			if( !jsonSrc.match(resKey) ){// TODO: JSONファイルを文字列として検索しているが、この方法は完全ではない。
				this.removeResource(resKey);
			}
		}

		// リソースデータの保存と公開領域への設置
		for( var resKey in _resourceDb ){
			px.utils.mkdir( _resourcesDirPath+'/'+resKey );
			px.fs.writeFileSync(
				_resourcesDirPath+'/'+resKey+'/res.json',
				JSON.stringify( _resourceDb[resKey], null, 1 )
			);

			if(_resourceDb[resKey].base64){
				var bin = new Buffer(_resourceDb[resKey].base64, 'base64');
				px.fs.writeFileSync(
					_resourcesDirPath+'/'+resKey+'/bin.'+_resourceDb[resKey].ext,
					bin
				);

				// 公開ファイル
				if( !_resourceDb[resKey].isPrivateMaterial ){
					var filename = resKey;
					if( typeof(_resourceDb[resKey].publicFilename) == typeof('') && _resourceDb[resKey].publicFilename.length ){
						filename = _resourceDb[resKey].publicFilename;
					}
					px.fs.writeFileSync(
						_resourcesPublishDirPath+'/'+filename+'.'+_resourceDb[resKey].ext,
						bin
					);
				}
			}
		}
		cb();
		return true;
	}

	/**
	 * add resource
	 * リソースの登録を行い、resKeyを生成して返す。
	 */
	this.addResource = function(){
		var newResKey;
		while(1){
			newResKey = px.utils.md5( (new Date).getTime() );
			if( typeof(_resourceDb[newResKey]) === typeof({}) ){
				// 登録済みの resKey
				continue;
			}
			_resourceDb[newResKey] = {};//予約
			break;
		}
		return newResKey;
	}

	/**
	 * get resource
	 */
	this.getResource = function( resKey ){
		if( typeof(_resourceDb[resKey]) !== typeof({}) ){
			// 未登録の resKey
			return false;
		}
		return _resourceDb[resKey];
	}

	/**
	 * duplicate resource
	 * @return 複製された新しいリソースのキー
	 */
	this.duplicateResource = function( resKey ){
		if( typeof(_resourceDb[resKey]) !== typeof({}) ){
			// 未登録の resKey
			return false;
		}
		var newResKey = this.addResource();
		_resourceDb[newResKey] = JSON.parse( JSON.stringify( _resourceDb[resKey] ) );
		px.fsEx.copySync( _resourcesDirPath+'/'+resKey, _resourcesDirPath+'/'+newResKey );
		return newResKey;
	}

	/**
	 * update resource
	 * @param  {string} resKey  Resource Key
	 * @param  {object} resInfo Resource Information.
	 * <dl>
	 * <dt>ext</dt><dd>ファイル拡張子名。</dd>
	 * <dt>type</dt><dd>mimeタイプ。</dd>
	 * <dt>base64</dt><dd>ファイルのBase64エンコードされた値</dd>
	 * <dt>publicFilename</dt><dd>公開時のファイル名</dd>
	 * <dt>isPrivateMaterial</dt><dd>非公開ファイル。</dd>
	 * </dl>
	 * @param  {string} realpath Resource Realpath. - ファイルが置かれていた絶対パス
	 * @return {boolean}        always true.
	 */
	this.updateResource = function( resKey, resInfo, realpath ){
		if( typeof(_resourceDb[resKey]) !== typeof({}) ){
			// 未登録の resKey
			return false;
		}
		_resourceDb[resKey] = resInfo;

		if(realpath){
			var bin = px.fs.readFileSync( realpath, {} );
			_resourceDb[resKey].base64 = px.utils.base64encode( bin );
		}

		return true;
	}

	/**
	 * Reset bin from base64
	 */
	this.resetBinFromBase64 = function( resKey ){
		if( typeof(_resourceDb[resKey]) !== typeof({}) ){
			// 未登録の resKey
			return false;
		}
		var realpath = this.getResourceOriginalRealpath( resKey );

		var bin = px.utils.base64decode( _resourceDb[resKey].base64 );
		return px.fs.writeFileSync( realpath, bin, {} );
	}

	/**
	 * Reset base64 from bin
	 */
	this.resetBase64FromBin = function( resKey ){
		if( typeof(_resourceDb[resKey]) !== typeof({}) ){
			// 未登録の resKey
			return false;
		}
		var realpath = this.getResourceOriginalRealpath( resKey );

		var bin = px.fs.readFileSync( realpath, {} );
		_resourceDb[resKey].base64 = px.utils.base64encode( bin );

		return true;
	}

	/**
	 * get resource public path
	 */
	this.getResourcePublicPath = function( resKey ){
		var res = this.getResource( resKey );
		var basename = px.utils.basename( px.fs.realpathSync(_contFilesDirPath) );
		var filename = resKey;
		if( typeof(res.publicFilename) == typeof('') && res.publicFilename.length ){
			filename = res.publicFilename;
		}
		var rtn = './'+basename+'/resources/'+filename+'.'+res.ext;
		return rtn;
	}

	/**
	 * get resource public path
	 */
	this.getResourceOriginalRealpath = function( resKey ){
		var res = this.getResource( resKey );
		var basename = px.utils.basename( px.fs.realpathSync(_contFilesDirPath) );
		var rtn = _resourcesDirPath+'/'+resKey+'/bin.'+_resourceDb[resKey].ext;
		// var rtn = './'+basename+'/resources/'+resKey+'.'+res.ext;
		return rtn;
	}

	/**
	 * remove resource
	 */
	this.removeResource = function( resKey ){
		_resourceDb[resKey] = undefined;
		delete( _resourceDb[resKey] );
		if( px.utils.isDirectory(_resourcesDirPath+'/'+resKey+'/') ){
			px.utils.rmdir_r( _resourcesDirPath+'/'+resKey+'/' );
		}
		return true;
	}

})(window.px, window.px2dtGuiEditor);
