window.contApp.contentsSourceData.resourceMgr = new(function(px, contApp){
	var _this = this;
	var _contFilesDirPath;
	var _resourcesDirPath;

	var _resourceDb = {};

	/**
	 * initialize resource Manager
	 */
	this.init = function( contFilesDirPath, cb ){
		_contFilesDirPath = contFilesDirPath;
		_resourcesDirPath = _contFilesDirPath + '/guieditor.ignore/resources/';
		_resourcesPublishDirPath = _contFilesDirPath + '/resources/';
		loadResourceList( function(){
			cb();
		} );
		return this;
	}
	function loadResourceList( cb ){
		_resourceDb = {};
		if( !px.utils.isDirectory( _resourcesDirPath ) ){
			px.utils.mkdir( _resourcesDirPath );
		}

		var list = px.fs.readdirSync( _resourcesDirPath );
		for( var idx in list ){
			var resKey = list[idx];
			if( !px.utils.isDirectory( _resourcesDirPath+'/'+resKey ) ){ continue; }
			var jsonStr = px.fs.readFileSync( _resourcesDirPath+'/'+resKey+'/res.json' );
			_resourceDb[resKey] = JSON.parse( jsonStr );
		}
		cb();
		return;
	}

	/**
	 * save content
	 */
	this.save = function( cb ){
		if( !px.utils.isDirectory( _resourcesPublishDirPath ) ){
			// 公開リソースディレクトリ作成
			px.utils.mkdir( _resourcesPublishDirPath );
		}

		for( var resKey in _resourceDb ){
			px.utils.mkdir( _resourcesDirPath+'/'+resKey );
			px.fs.writeFileSync(
				_resourcesDirPath+'/'+resKey+'/res.json',
				JSON.stringify( _resourceDb[resKey] )
			);

			var bin = new Buffer(_resourceDb[resKey].base64, 'base64');
			px.fs.writeFileSync(
				_resourcesDirPath+'/'+resKey+'/bin.'+_resourceDb[resKey].ext,
				bin
			);

			// 公開ファイル
			px.fs.writeFileSync(
				_resourcesPublishDirPath+'/'+resKey+'.'+_resourceDb[resKey].ext,
				bin
			);
		}
		cb();
		return;
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
	 * update resource
	 */
	this.updateResource = function( resKey, resInfo ){
		if( typeof(_resourceDb[resKey]) !== typeof({}) ){
			// 未登録の resKey
			return false;
		}
		_resourceDb[resKey] = resInfo;

		var bin = px.fs.readFileSync( _resourceDb[resKey].realpath, {} );
		_resourceDb[resKey].base64 = px.utils.base64encode( bin );

		return true;
	}

	/**
	 * get resource public path
	 */
	this.getResourcePublicPath = function( resKey ){
		var res = this.getResource( resKey );
		var basename = px.utils.basename( px.fs.realpathSync(_contFilesDirPath) );
		var rtn = './'+basename+'/resources/'+resKey+'.'+res.ext;
		return rtn;
	}

	/**
	 * remove resource
	 */
	this.removeResource = function( resKey ){
		_resourceDb[resKey] = undefined;
		delete( _resourceDb[resKey] );
		return true;
	}

})(window.px, window.contApp);