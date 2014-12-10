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
			cb();
		});

		return this;
	}// init()


})(window.px, window.contApp);