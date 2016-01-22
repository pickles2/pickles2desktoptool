window.BroccoliFieldHref = function(){
	// console.log('broccoli-field-href - client.js');
	// console.log(window.px);

	var php = require('phpjs');
	var utils79 = require('utils79');

	/**
	 * エディタUIを生成
	 */
	this.mkEditor = function( mod, data, elm, callback ){
		var changeTimer;
		var blurTimer;

		function onChange(){
			clearTimeout( changeTimer );
			clearTimeout( blurTimer );
			$palatte.stop().show('fast');
			var $this = $(this);
			changeTimer = setTimeout(function(){
				var pages = $this.data('pages');
				var $html = $('<ul>')
					.css({
						'padding': 20
					})
				;
				for( var idx in pages ){
					if( !pages[idx].path.match( new RegExp('^'+px.utils.escapeRegExp($this.val())) ) ){
						continue;
					}
					$html
						.append( $('<li>')
							.css({
								'list-style-type':'none'
							})
							.append( $('<a>')
								.css({
									'display':'block'
								})
								.attr({
									'href': 'javascript:;',
									'data-path': pages[idx].path
								})
								.text( pages[idx].path +' ('+pages[idx].title+')' )
								.click(function(){
									// console.log('path suggestion: clicked!');
									// console.log($(this).attr('data-path'));
									// console.log($(this).attr('data-path'));
									clearTimeout( blurTimer );
									$input
										.val( $(this).attr('data-path') )
										.focus()
									;
									$palatte.hide();
								})
							)
						)
					;
				}
				$palatte.html('').append( $html );
			}, 100);
		}

		var $palatte = $('<div>')
			.css({
				'height':200,
				'overflow':'auto',
				'position':'absolute',
				'background':'#f9f9f9',
				'opacity':'0.9',
				'width':'100%',
				'z-index': 1000
			})
			.hide()
		;
		var $input = $('<input>')
			.attr({
				"name":mod.name
			})
			.val(data)
			.data( 'pages', px.getCurrentProject().site.getSitemap() )
			.css({'width':'100%','height':'auto'})
			.change( onChange )
			.keyup( onChange )
			.focus(function(){
				clearTimeout( blurTimer );
				$palatte.show('fast');
			})
			.blur(function(){
				clearTimeout( blurTimer );
				blurTimer = setTimeout( function(){
					$palatte.hide();
				}, 200 );
			})
		;
		var rtn = $('<div>')
			.append( $input )
			.append( $('<div>')
				.css({
					'position':'relative'
				})
				.click(function(){
					clearTimeout( blurTimer );
				})
				.append( $palatte )
			)
		;
		$(elm).html(rtn);
		// setTimeout(function(){
			callback();
		// }, 0);
		return;
	}

	/**
	 * エディタUIで編集した内容を保存
	 */
	this.saveEditorContent = function( elm, data, mod, callback ){
		var $dom = $(elm);
		var src = $dom.find('input').val();
		src = JSON.parse( JSON.stringify(src) );
		callback(src);
		return;
	}

}
