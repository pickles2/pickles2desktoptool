window.contApp.contData = new(function(px, contApp){
	var _contentsData;
	var _dataJsonPath;

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
		// px.message('開発中: '+modId+' / '+containerPath);
		cb = cb||function(){};

		var data = {};
		data.modId = modId;
		var modTpl = contApp.modTpl.get( data.modId );
		var fieldList = _.keys( modTpl.fields );
		for( var idx in fieldList ){
			switch( modTpl.fields[fieldList[idx]].type ){
				case 'markdown':
					data['fields'][fieldList[idx]] = '';
					break;
				case 'module':
					data['fields'][fieldList[idx]] = [];
					break;
			}
		}

		var containerPath = this.parseElementPath( containerPath );

		function set_r( aryPath, data, newData ){
			var cur = aryPath.shift();
			var idx = null;
			var tmpSplit = cur.split('@');
			cur = tmpSplit[0];
			if( tmpSplit.length >=2 ){
				idx = Number(tmpSplit[1]);
				// console.log(idx);
			}

			if( !aryPath.length ){
				// ここが最後の要素だったら
				if( !data[cur] ){
					data[cur] = {};
				}
				if( idx === null ){
					data[cur] = newData;
					return true;
				}
				data[cur] = data[cur]||[];
				data[cur][idx] = newData;
				return true;
			}else{
				// もっと深かったら
				if( !data[cur] ){
					return false;
				}
				if( idx === null ){
					data[cur] = newData;
					return set_r( aryPath, data[cur], newData );
				}else{
					return set_r( aryPath, data[cur][idx], newData );
				}
			}

		}

		set_r( containerPath, _contentsData.bowl, data );
		// console.log(_contentsData);

		cb();
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

})(window.px, window.contApp);