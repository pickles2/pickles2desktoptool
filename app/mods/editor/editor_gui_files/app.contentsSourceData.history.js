window.contApp.contentsSourceData.history = new(function(px, contApp){

	var historyDataArray = [];
	var historyIdx = 0;

	/**
	 * ヒストリーを初期化する
	 */
	this.init = function( data, cb ){
		cb = cb||function(){};

		historyDataArray = [];
		historyIdx = 0;
		this.put(data, function(){
			setTimeout( cb, 0 );
		});
		return this;
	}

	/**
	 * ヒストリーに歴史を追加する
	 */
	this.put = function( data, cb ){
		cb = cb||function(){};

		historyDataArray.splice(0, historyIdx, JSON.stringify(data));
		historyIdx = 0;

		// console.log(historyDataArray);
		setTimeout( cb, 0 );
		return this;
	}

	/**
	 * 1つ前のデータを得る
	 */
	this.back = function(){
		historyIdx ++;
		if( historyIdx >= historyDataArray.length || historyIdx < 0 ){
			historyIdx --;
			return false;
		}
		return JSON.parse( historyDataArray[historyIdx] );
	}

	/**
	 * 1つ次のデータを得る
	 */
	this.go = function(){
		historyIdx --;
		if( historyIdx >= historyDataArray.length || historyIdx < 0 ){
			historyIdx ++;
			return false;
		}
		return JSON.parse( historyDataArray[historyIdx] );
	}


})(window.px, window.contApp);