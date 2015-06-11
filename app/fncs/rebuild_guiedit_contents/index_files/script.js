window.px = window.parent.px;
window.contApp = new (function(px){
	var _this = this;
	var pj = px.getCurrentProject();
	this.pj = pj;
	var $cont, $btn, $pre;

	/**
	 * initialize
	 */
	function init(){
		$cont = $('.contents').html('');
		$btn = $('<button class="btn btn-default btn-block">');
		$pre = $('<pre>');

		$cont
			.append( $btn
				.click( function(){ rebuild(this); } )
				.text('GUI編集コンテンツを更新する')
			)
			.append( $pre
				.addClass( 'cont_console' )
				.css({
					'max-height': 360,
					'height': 360
				})
			)
		;
	}


	var rebuild = function(btn){
		$(btn).attr('disabled', 'disabled');
		$pre.text('');

		pj.createSearcher().getGuiEditPages( {
			success: function(msg){
				// console.log(msg);
				$pre.text( $pre.text() + msg );
			} ,
			complete: function(result){
				$pre.text( $pre.text() + 'completed!' );
				$(btn).removeAttr('disabled').focus();
				px.message( '完了しました。' );
			}
		} );
	}

	/**
	 * イベント
	 */
	$(function(){
		init();
	});

})(window.px);
