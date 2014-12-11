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
			_contentsData.bowl["fields.main"] = _contentsData.bowl["fields.main"]||[];

			cb();
		});

		return this;
	}// init()

	/**
	 * 要素を追加する
	 */
	this.addElement = function( modId, containerPath, cb ){
		px.message('開発中: '+modId+' / '+containerPath);

		cb = cb||function(){};
		var data = {};
		data.modId = modId;
		data.val = {};

		var path = this.parseElementPath( containerPath );

		// ↓containerPathの形式に迷い中。一旦コメントアウト。
		// 　"/fields.main@0/fields.{$fielsname}@2/fields.{$fielsname}@1"
		// 　こんな感じだと格納しきれるだろうか。
		// 　ルートはbowlsってことにする。
		// _contentsData.bowl[containerPath].push( data );
console.log(containerPath);
console.log(_contentsData);
		cb();
		return this;
	}

	/**
	 * 要素のパスを解析する
	 */
	this.parseElementPath = function( containerPath ){
		containerPath = containerPath||'';
		if( !containerPath ){ containerPath = '/fields.main'; }
		containerPath = containerPath.replace( new RegExp('^\\/*'), '' );
		containerPath = containerPath.replace( new RegExp('\\/*$'), '' );
		containerPath = containerPath.split('/');
console.log(containerPath);
		return containerPath;
	}

	/**
	 * bowl別のコンテンツデータを取得
	 */
	this.getBowlData = function( bowlName ){
		bowlName = bowlName||'main';
		if( !_contentsData.bowl["fields."+bowlName] ){
			return false;
		}
		return _contentsData.bowl["fields."+bowlName];
	}

	/**
	 * bowl別のコンテンツデータをセット
	 */
	this.setBowlData = function( bowlName, data ){
		bowlName = bowlName||'main';
		_contentsData.bowl["fields."+bowlName] = data;
		return;
	}

})(window.px, window.contApp);