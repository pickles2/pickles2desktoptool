window.px = $.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var _pj = px.getCurrentProject();

	var _param = (function(window){
		// URIパラメータをパースする
		var paramsArray = [];
		var url = window.location.href; 
		parameters = url.split("?");
		if( parameters.length > 1 ) {
			var params = parameters[1].split("&");
			for ( var i = 0; i < params.length; i++ ) {
				var paramItem = params[i].split("=");
				for( var i2 in paramItem ){
					paramItem[i2] = decodeURIComponent( paramItem[i2] );
				}
				paramsArray.push( paramItem[0] );
				paramsArray[paramItem[0]] = paramItem[1];
			}
		}
		return paramsArray;
	})(window);

	var _contentsPath = px.fs.realpathSync( _pj.get('path')+'/'+_param.page_content);

	function save(cb){
		cb = cb || function(){};
		var src = $('body textarea').val();

		// 文字化け問題にたいそう苦しめられた。
		// どういうわけか、一旦JSON文字列にしてからデコードすると、
		// ちゃんと保存できた。
		src = JSON.parse( JSON.stringify( src ) );

		px.fs.writeFile( _contentsPath, src, {encoding:'utf8'}, function(err){
			cb( !err );
		} );
		return this;
	}

	function preview(iframe){
		$(iframe)
			.attr('src', 'http://127.0.0.1:8080'+_param.page_path)
		;
		return true;
	}

	function resize(){
		$('textarea')
			.css({
				'height':$(window).height() - $('.cont_btns').height() - 10
			})
		;
		$('iframe.cont_preview')
			.css({
				'height':$(window).height() - 10
			})
		;
	}

	function init(){
		var $html = $( $('#cont_tpl_editor').html() );

		$html
			.find('textarea')
				// .attr('id', 'cont_editor')
				.css({
					'width':'100%' ,
					'border':'none',
					'resize':'none'
				})
				.val( px.fs.readFileSync(_contentsPath) )
		;
		$html
			.find('button.cont_btn_save')
				.click(function(){
					save(function(result){
						if(!result){
							px.message( 'ページの保存に失敗しました。' );
						}else{
							px.message( 'ページを保存しました。' );
						}
						preview('iframe.cont_preview');
						$('textarea').focus();
					});
				})
		;
		$html
			.find('button.cont_btn_save_and_close')
				.click(function(){
					save(function(result){
						if(!result){
							px.message( 'ページの保存に失敗しました。' );
						}else{
							px.message( 'ページを保存しました。' );
						}
						window.parent.contApp.closeEditor();
					});
				})
		;
		$html
			.find('iframe.cont_preview')
				.css({
					'border':'none',
					'width':'100%'
				})
		;
		$('body')
			.html( '' )
			.append($html)
		;
		preview('iframe.cont_preview');
		resize();
	}

	$(function(){
		px.getCurrentProject().serverStandby( function(){
			init();
		} );
	})
	$(window).resize(function(){
		resize();
	});

})( window.parent.px );
