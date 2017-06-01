(function(px, $){
	// get the system clipboard
	var clipboard = nw.Clipboard.get();

	/**
	 * クリップボード管理オブジェクト
	 */
	px.clipboard = new (function(){

		// clipboardに値をセットする
		this.set = function( text ){
			clipboard.set(text, 'text');
			return this;
		}// px.clipboard.set();

		// clipboardから値を取得する
		this.get = function(){
			var rtn = clipboard.get('text');
			return rtn;
		}// px.clipboard.get();

	})();

})(px, jQuery);
