/**
 * statusbar.js
 */
module.exports = function(px, $statusbar){
	var $ = px.$;

	this.set = function( $statusContentsL, $statusContentsR ){
		$statusbar.html('');
		var $L = $('<div class="theme-statusbar__left">');
		var $R = $('<div class="theme-statusbar__right">');
		if( $statusContentsL.length ){
			for( var i in $statusContentsL ){
				var $div = $('<div>');
				$div.append($statusContentsL[i]);
				$L.append($div);
			}
		}
		if( $statusContentsR.length ){
			for( var i in $statusContentsR ){
				var $div = $('<div>');
				$div.append($statusContentsR[i]);
				$R.append($div);
			}
		}
		$statusbar.append($L);
		$statusbar.append($R);
		return;
	}
}
