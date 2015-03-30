window.contApp.contentsSourceData = new(function(px, contApp){
	var _contentsSourceData;
	var _contentsRealPath;
	var _contFilesDirPath;
	var _contentsSourceDataJsonPath;

	/**
	 * 初期化
	 */
	this.init = function( contentsRealPath, contFilesDirPath, cb ){
		var _this = this;
		_contentsRealPath = contentsRealPath;
		_contFilesDirPath = contFilesDirPath;
		_contentsSourceDataJsonPath = _contFilesDirPath+'/guieditor.ignore/data.json';

		if( !px.fs.existsSync( _contentsRealPath ) ){
			px.message('コンテンツファイルが存在しません。');
			window.parent.contApp.closeEditor();
			return this;
		}
		_contentsRealPath = px.fs.realpathSync( _contentsRealPath );

		if( !px.utils.isDirectory( _contFilesDirPath ) ){
			px.utils.mkdir( _contFilesDirPath );
		}
		if( !px.utils.isDirectory( _contFilesDirPath+'/guieditor.ignore/' ) ){
			px.utils.mkdir( _contFilesDirPath+'/guieditor.ignore/' );
		}
		if( !px.fs.existsSync( _contentsSourceDataJsonPath ) ){
			px.message('コンテンツデータファイル(JSON)が存在しません。');
			window.parent.contApp.closeEditor();
			return this;
		}
		_contentsSourceDataJsonPath = px.fs.realpathSync( _contentsSourceDataJsonPath );

		px.fs.readFile( _contentsSourceDataJsonPath, function(err, data){

			// コンテンツデータをロード
			_contentsSourceData = JSON.parse( data );
			if( typeof(_contentsSourceData) !== typeof({}) ){
				px.message( 'コンテンツデータファイル(JSON)が破損しています。' );
				_contentsSourceData = {};
			}
			_contentsSourceData.bowl = _contentsSourceData.bowl||{};
			_contentsSourceData.bowl.main = _contentsSourceData.bowl.main||{
				'modId':'_sys/root',
				'fields':{}
			};

			// リソースマネージャーの初期化
			_this.resourceMgr.init(
				_contFilesDirPath,
				function(){
					// ヒストリーマネージャーの初期化
					_this.history.init( _contentsSourceData, function(){
						cb();
					} );
				}
			);
		});

		return this;
	}// init()

	/**
	 * データを取得する
	 */
	this.get = function( containerInstancePath, data ){
		data = data || _contentsSourceData;

		var aryPath = this.parseInstancePath( containerInstancePath );
		if( !aryPath.length ){
			return data;
		}

		var cur = aryPath.shift();
		var idx = null;
		var tmpSplit = cur.split('@');
		cur = tmpSplit[0];
		if( tmpSplit.length >=2 ){
			idx = Number(tmpSplit[1]);
		}
		var tmpCur = cur.split('.');
		var container = tmpCur[0];
		var fieldName = tmpCur[1];
		var modTpl = contApp.moduleTemplates.get( data.modId, data.subModName );

		if( container == 'bowl' ){
			return this.get( aryPath, data.bowl[fieldName] );
		}

		if( !aryPath.length ){
			// ここが最後のインスタンスだったら
			if( !data.fields ){
				data.fields = {};
			}
			if( !data.fields[fieldName] ){
				data.fields[fieldName] = [];
			}
			if( modTpl.fields[fieldName].fieldType == 'input'){
				return data.fields[fieldName];
			}else if( modTpl.fields[fieldName].fieldType == 'module'){
				data.fields[fieldName] = data.fields[fieldName]||[];
				return data.fields[fieldName][idx];
			}else if( modTpl.fields[fieldName].fieldType == 'loop'){
				data.fields[fieldName] = data.fields[fieldName]||[];
				return data.fields[fieldName][idx];
			}else if( modTpl.fields[fieldName].fieldType == 'if'){
			}else if( modTpl.fields[fieldName].fieldType == 'echo'){
			}
		}else{
			// もっと深かったら
			if( modTpl.fields[fieldName].fieldType == 'input'){
				return this.get( aryPath, data.fields[fieldName] );
			}else if( modTpl.fields[fieldName].fieldType == 'module'){
				return this.get( aryPath, data.fields[fieldName][idx] );
			}else if( modTpl.fields[fieldName].fieldType == 'loop'){
				return this.get( aryPath, data.fields[fieldName][idx] );
			}else if( modTpl.fields[fieldName].fieldType == 'if'){
			}else if( modTpl.fields[fieldName].fieldType == 'echo'){
			}
		}
		return false;
	}

	/**
	 * インスタンスを追加する
	 */
	this.addInstance = function( modId, containerInstancePath, cb, subModName ){
		// console.log( '開発中: '+modId+': '+containerInstancePath );
		cb = cb||function(){};

		var newData = new (function(){
			this.modId = modId ,
			this.fields = {}
			if( typeof(subModName) === typeof('') ){
				this.subModName = subModName;
			}
		})(modId, subModName);
		var modTpl = contApp.moduleTemplates.get( newData.modId, subModName );

		// 初期データ追加
		var fieldList = _.keys( modTpl.fields );
		for( var idx in fieldList ){
			var fieldName = fieldList[idx];
			if( modTpl.fields[fieldName].fieldType == 'input' ){
				newData.fields[fieldName] = '';
			}else if( modTpl.fields[fieldName].fieldType == 'module' ){
				newData.fields[fieldName] = [];
			}else if( modTpl.fields[fieldName].fieldType == 'loop' ){
				newData.fields[fieldName] = [];
			}else if( modTpl.fields[fieldName].fieldType == 'if' ){
			}else if( modTpl.fields[fieldName].fieldType == 'echo' ){
			}
		}

		var containerInstancePath = this.parseInstancePath( containerInstancePath );
		// console.log( containerInstancePath );

		function set_r( aryPath, data, newData ){
			// console.log( data );
			var cur = aryPath.shift();
			var idx = null;
			var tmpSplit = cur.split('@');
			cur = tmpSplit[0];
			if( tmpSplit.length >=2 ){
				idx = Number(tmpSplit[1]);
				// console.log(idx);
			}
			var tmpCur = cur.split('.');
			var container = tmpCur[0];
			var fieldName = tmpCur[1];
			var modTpl = contApp.moduleTemplates.get( data.modId, data.subModName );

			if( container == 'bowl' ){
				return set_r( aryPath, data.bowl[fieldName], newData );
			}

			if( !aryPath.length ){
				// ここが最後のインスタンスだったら
				if( !data.fields ){
					data.fields = {};
				}
				if( !data.fields[fieldName] ){
					data.fields[fieldName] = [];
				}
				if( modTpl.fields[fieldName].fieldType == 'input'){
					data.fields[fieldName] = newData;
				}else if( modTpl.fields[fieldName].fieldType == 'module'){
					data.fields[fieldName] = data.fields[fieldName]||[];
					data.fields[fieldName].splice( idx, 0, newData);
				}else if( modTpl.fields[fieldName].fieldType == 'loop'){
					data.fields[fieldName] = data.fields[fieldName]||[];
					data.fields[fieldName].splice( idx, 0, newData);
				}else if( modTpl.fields[fieldName].fieldType == 'if'){
				}else if( modTpl.fields[fieldName].fieldType == 'echo'){
				}
				return true;
			}else{
				// もっと深かったら
				if( modTpl.fields[fieldName].fieldType == 'input'){
					return set_r( aryPath, data.fields[fieldName], newData );
				}else if( modTpl.fields[fieldName].fieldType == 'module'){
					return set_r( aryPath, data.fields[fieldName][idx], newData );
				}else if( modTpl.fields[fieldName].fieldType == 'loop'){
					return set_r( aryPath, data.fields[fieldName][idx], newData );
				}else if( modTpl.fields[fieldName].fieldType == 'if'){
				}else if( modTpl.fields[fieldName].fieldType == 'echo'){
				}
			}

		} // set_r()

		set_r( containerInstancePath, _contentsSourceData, newData );

		cb();

		return this;
	}// addInstance()

	/**
	 * インスタンスを更新する
	 */
	this.updateInstance = function( newData, containerInstancePath, cb ){
		// console.log( '開発中: '+modId+': '+containerInstancePath );
		cb = cb||function(){};

		var containerInstancePath = this.parseInstancePath( containerInstancePath );
		// console.log( containerInstancePath );

		function set_r( aryPath, data, newData ){
			// console.log( data );
			var cur = aryPath.shift();
			var idx = null;
			var tmpSplit = cur.split('@');
			cur = tmpSplit[0];
			if( tmpSplit.length >=2 ){
				idx = Number(tmpSplit[1]);
				// console.log(idx);
			}
			var tmpCur = cur.split('.');
			var container = tmpCur[0];
			var fieldName = tmpCur[1];
			var modTpl = contApp.moduleTemplates.get( data.modId, data.subModName );

			if( container == 'bowl' ){
				return set_r( aryPath, data.bowl[fieldName], newData );
			}

			if( !aryPath.length ){
				// ここが最後のインスタンスだったら
				if( !data.fields ){
					data.fields = {};
				}
				if( !data.fields[fieldName] ){
					data.fields[fieldName] = [];
				}
				if( modTpl.fields[fieldName].fieldType == 'input'){
					data.fields[fieldName] = newData;
				}else if( modTpl.fields[fieldName].fieldType == 'module'){
					data.fields[fieldName] = data.fields[fieldName]||[];
					data.fields[fieldName][idx] = newData;
				}else if( modTpl.fields[fieldName].fieldType == 'loop'){
					data.fields[fieldName] = data.fields[fieldName]||[];
					data.fields[fieldName][idx] = newData;
				}else if( modTpl.fields[fieldName].fieldType == 'if'){
				}else if( modTpl.fields[fieldName].fieldType == 'echo'){
				}
				return true;
			}else{
				// もっと深かったら
				if( modTpl.fields[fieldName].fieldType == 'input'){
					return set_r( aryPath, data.fields[fieldName], newData );
				}else if( modTpl.fields[fieldName].fieldType == 'module'){
					return set_r( aryPath, data.fields[fieldName][idx], newData );
				}else if( modTpl.fields[fieldName].fieldType == 'loop'){
					return set_r( aryPath, data.fields[fieldName][idx], newData );
				}else if( modTpl.fields[fieldName].fieldType == 'if'){
				}else if( modTpl.fields[fieldName].fieldType == 'echo'){
				}
			}

		}

		set_r( containerInstancePath, _contentsSourceData, newData );

		cb();

		return this;
	}// updateInstance()

	/**
	 * インスタンスを移動する
	 */
	this.moveInstanceTo = function( fromContainerInstancePath, toContainerInstancePath, cb ){
		cb = cb||function(){};

		function parseInstancePath(path){
			var rtn = {};
			rtn = px.utils.parsePath( path );
			var basenameParse = rtn.basename.split('@');
			rtn.container = rtn.dirname+'/'+basenameParse[0];
			rtn.num = Number(basenameParse[1]);
			return rtn;
		}

		var fromParsed = parseInstancePath(fromContainerInstancePath);
		var toParsed = parseInstancePath(toContainerInstancePath);

		var dataFrom = this.get( fromContainerInstancePath );
		dataFrom = JSON.parse(JSON.stringify( dataFrom ));//←オブジェクトのdeepcopy

		if( fromParsed.container == toParsed.container ){
			// 同じ箱の中での並び替え
			if( fromParsed.num < toParsed.num ){
				// 上から下へ
				if( !this.get(toContainerInstancePath) ){
					toContainerInstancePath = toParsed.container + '@' + ( toParsed.num-1 );
				}
				this.removeInstance(fromContainerInstancePath);
				this.addInstance( dataFrom.modId, toContainerInstancePath );
				this.updateInstance( dataFrom, toContainerInstancePath );

			}else if( fromParsed.num > toParsed.num ){
				// 下から上へ
				this.addInstance( dataFrom.modId, toContainerInstancePath );
				this.updateInstance( dataFrom, toContainerInstancePath );
				this.removeInstance(fromParsed.container+'@'+(fromParsed.num+1));
			}
			cb();
		}else if( toParsed.path.indexOf(fromParsed.path) === 0 ){
			px.message('自分の子階層へ移動することはできません。');
			cb();
		}else if( fromParsed.path.indexOf(toParsed.container) === 0 ){
			// var tmp = fromParsed.path.replace( new RegExp('^'+px.utils.escapeRegExp(toParsed.container)), '' );
			this.removeInstance(fromParsed.path);
			this.addInstance( dataFrom.modId, toContainerInstancePath );
			this.updateInstance( dataFrom, toContainerInstancePath );
			cb();
		}else{
			// まったく関連しない箱への移動
			this.addInstance( dataFrom.modId, toContainerInstancePath );
			this.updateInstance( dataFrom, toContainerInstancePath );
			this.removeInstance(fromContainerInstancePath);
			cb();
		}

		return this;
	}

	/**
	 * インスタンスを削除する
	 */
	this.removeInstance = function( containerInstancePath, cb ){
		cb = cb||function(){};

		var containerInstancePath = this.parseInstancePath( containerInstancePath );

		function remove_r( aryPath, data ){
			if( !aryPath.length ){
				return false;
			}
			var cur = aryPath.shift();
			var idx = null;
			var tmpSplit = cur.split('@');
			cur = tmpSplit[0];
			if( tmpSplit.length >=2 ){
				idx = Number(tmpSplit[1]);
			}
			var tmpCur = cur.split('.');
			var container = tmpCur[0];
			var fieldName = tmpCur[1];
			var modTpl = contApp.moduleTemplates.get( data.modId, data.subModName );

			if( container == 'bowl' ){
				return remove_r( aryPath, data.bowl[fieldName] );
			}

			if( !aryPath.length ){
				// ここが最後のインスタンスだったら
				if( !data.fields ){
					data.fields = {};
				}
				if( !data.fields[fieldName] ){
					data.fields[fieldName] = [];
				}
				if( modTpl.fields[fieldName].fieldType == 'input'){
					delete data.fields[fieldName];
				}else if( modTpl.fields[fieldName].fieldType == 'module'){
					data.fields[fieldName].splice(idx, 1);
				}else if( modTpl.fields[fieldName].fieldType == 'loop'){
					data.fields[fieldName].splice(idx, 1);
				}else if( modTpl.fields[fieldName].fieldType == 'if'){
				}else if( modTpl.fields[fieldName].fieldType == 'echo'){
				}
				return true;
			}else{
				// もっと深かったら
				if( modTpl.fields[fieldName].fieldType == 'input'){
					return remove_r( aryPath, data.fields[fieldName] );
				}else if( modTpl.fields[fieldName].fieldType == 'module'){
					return remove_r( aryPath, data.fields[fieldName][idx] );
				}else if( modTpl.fields[fieldName].fieldType == 'loop'){
					return remove_r( aryPath, data.fields[fieldName][idx] );
				}else if( modTpl.fields[fieldName].fieldType == 'if'){
				}else if( modTpl.fields[fieldName].fieldType == 'echo'){
				}
			}
			return true;
		}

		remove_r( containerInstancePath, _contentsSourceData );

		cb();

		return this;
	}// removeInstance()

	/**
	 * インスタンスのパスを解析する
	 */
	this.parseInstancePath = function( containerInstancePath ){
		if( typeof(containerInstancePath) === typeof([]) ){
			return containerInstancePath;
		}

		containerInstancePath = containerInstancePath||'';
		if( !containerInstancePath ){ containerInstancePath = '/fields.main'; }
		containerInstancePath = containerInstancePath.replace( new RegExp('^\\/*'), '' );
		containerInstancePath = containerInstancePath.replace( new RegExp('\\/*$'), '' );
		containerInstancePath = containerInstancePath.split('/');
		// console.log(containerInstancePath);
		return containerInstancePath;
	}

	/**
	 * bowl別のコンテンツデータを取得
	 */
	this.getBowlData = function( bowlName ){
		bowlName = bowlName||'main';
		if( !_contentsSourceData.bowl[bowlName] ){
			return false;
		}
		return _contentsSourceData.bowl[bowlName];
	}

	/**
	 * bowl別のコンテンツデータをセット
	 */
	this.setBowlData = function( bowlName, data ){
		bowlName = bowlName||'main';
		_contentsSourceData.bowl[bowlName] = data;
		return;
	}

	/**
	 * データを保存する
	 */
	this.save = function(cb){
		var _this = this;
		cb = cb||function(){};
		px.fs.writeFile( _contentsSourceDataJsonPath, JSON.stringify(_contentsSourceData, null, 1), {encoding:'utf8'}, function(err){

			// リソースマネージャーの保存処理
			_this.resourceMgr.save(
				function(){
					_this.history.put( _contentsSourceData, function(){
						cb( !err );
					} );
				}
			);

		} );
		return this;
	}

})(window.px, window.contApp);