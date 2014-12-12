window.contApp.contData = new(function(px, contApp){
	var _contentsData;
	var _dataJsonPath;

	/**
	 * 初期化
	 */
	this.init = function( contentsDataPath, dataJsonPath, cb ){
		_contentsDataPath = contentsDataPath;
		_dataJsonPath = dataJsonPath;

		if( !px.fs.existsSync( contentsDataPath ) ){
			px.message('コンテンツファイルが存在しません。');
			window.parent.contApp.closeEditor();
			return this;
		}
		contentsDataPath = px.fs.realpathSync( contentsDataPath );

		if( !px.fs.existsSync( dataJsonPath ) ){
			px.message('データファイルが存在しません。');
			window.parent.contApp.closeEditor();
			return this;
		}
		dataJsonPath = px.fs.realpathSync( dataJsonPath );

		px.fs.readFile( dataJsonPath, function(err, data){

			// コンテンツデータをロード
			_contentsData = JSON.parse( data );
			if( typeof(_contentsData) !== typeof({}) ){
				px.message( 'データが破損しています。' );
				_contentsData = {};
			}
			_contentsData.bowl = _contentsData.bowl||{};
			_contentsData.bowl["main"] = _contentsData.bowl["main"]||[];

			cb();
		});

		return this;
	}// init()

	/**
	 * 要素を追加する
	 */
	this.addElement = function( modId, containerPath, cb ){
		console.log( '開発中: '+modId+': '+containerPath );
		cb = cb||function(){};

		var newData = new (function(){
			this.modId = modId ,
			this.fields = {}
		})(modId);
		var modTpl = contApp.modTpl.get( newData.modId );
		var fieldList = _.keys( modTpl.fields );
		for( var idx in fieldList ){
			var fieldName = fieldList[idx];
			switch( modTpl.fields[fieldName].type ){
				case 'module':
					newData.fields[fieldName] = [];
					break;
				default:
					newData.fields[fieldName] = '';
					break;
			}
		}

		var containerPath = this.parseElementPath( containerPath );
		console.log( containerPath );

		function set_r( aryPath, data, newData ){
			console.log( data );
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
			var modTpl = contApp.modTpl.get( data.modId );

			if( container == 'bowl' ){
				return set_r( aryPath, data.bowl[fieldName], newData );
			}

			if( !aryPath.length ){
				// ここが最後の要素だったら
				if( !data.fields ){
					data.fields = {};
				}
				if( !data.fields[fieldName] ){
					data.fields[fieldName] = [];
				}
				switch( modTpl.fields[fieldName].type ){
					case 'module':
						data.fields[fieldName] = data.fields[fieldName]||[];
						data.fields[fieldName][idx] = newData;
						break;
					default:
						data.fields[fieldName] = newData;
						return true;
						break;
				}
				return true;
			}else{
				// もっと深かったら
				switch( modTpl.fields[fieldName].type ){
					case 'module':
						return set_r( aryPath, data.fields[fieldName][idx], newData );
						break;
					default:
						return set_r( aryPath, data.fields[fieldName], newData );
						break;
				}
			}

		}

		set_r( containerPath, _contentsData, newData );

		cb();

		console.log('done...');
		console.log(_contentsData);
		return this;
	}

	/**
	 * 要素のパスを解析する
	 */
	this.parseElementPath = function( containerPath ){
		if( typeof(containerPath) === typeof([]) ){
			return containerPath;
		}

		containerPath = containerPath||'';
		if( !containerPath ){ containerPath = '/fields.main'; }
		containerPath = containerPath.replace( new RegExp('^\\/*'), '' );
		containerPath = containerPath.replace( new RegExp('\\/*$'), '' );
		containerPath = containerPath.split('/');
		// console.log(containerPath);
		return containerPath;
	}

	/**
	 * bowl別のコンテンツデータを取得
	 */
	this.getBowlData = function( bowlName ){
		bowlName = bowlName||'main';
		if( !_contentsData.bowl[bowlName] ){
			return false;
		}
		return _contentsData.bowl[bowlName];
	}

	/**
	 * bowl別のコンテンツデータをセット
	 */
	this.setBowlData = function( bowlName, data ){
		bowlName = bowlName||'main';
		_contentsData.bowl[bowlName] = data;
		return;
	}

	/**
	 * データを保存する
	 */
	this.save = function(cb){
		cb = cb||function(){};
		px.fs.writeFile( _dataJsonPath, JSON.stringify(_contentsData), {encoding:'utf8'}, function(err){
			cb( !err );
		} );
		return this;
	}

})(window.px, window.contApp);