window.px = $.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var _pj = px.getCurrentProject();

	var _param = px.utils.parseUriParam( window.location.href );

	// var _pageInfo = _pj.site.getPageInfo( _param.page_path );
	// if( !_pageInfo ){ alert('ERROR: Undefined page path.'); return this; }

	var _cont_path = _pj.findPageContent( _param.page_path );
	var _cont_realpath = _pj.get('path')+'/'+_cont_path;
	var _cont_path_info = px.utils.parsePath(_cont_path);

	if( !px.fs.existsSync( _cont_realpath ) ){
		alert(_cont_realpath);
		alert('ファイルが存在しません。');
		window.parent.contApp.closeEditor();
		return this;
	}
	_cont_realpath = px.fs.realpathSync( _cont_realpath );

	var _contentsPath = px.fs.realpathSync( _pj.get('path')+'/'+_cont_path);

	/**
	 * 変更を保存する。
	 */
	function save(cb){
		px.message( '[開発中]ページ保存は、まだ仕様が固まらないので一旦スタブ状態にしてます。' );

		cb = cb || function(){};
		// var src = $('body textarea').val();
		// src = JSON.parse( JSON.stringify( src ) );

		// px.fs.writeFile( _contentsPath, src, {encoding:'utf8'}, function(err){
		// 	cb( !err );
		// } );
		cb( true );
		return this;
	}

	function preview(iframe){
		$(iframe)
			.attr('src', 'http://127.0.0.1:8080'+_param.page_path)
		;
		// ↓どうもこのイベントはとれてなさそう。
		var ifWin = $('iframe.cont_field-preview')[0].contentWindow;
		$(ifWin)
			.load(resizeEvent)
			.resize(resizeEvent)
		;
		// ↓なので、とりあえず、1秒タイマーで凌ぐ。
		setTimeout(resizeEvent, 1000);
		return true;
	}

	var _resizeTimer = null;
	function resizeEvent(){
		if(_resizeTimer){
			clearTimeout(_resizeTimer);
		}
		$('.cont_field')
			.css({
				'height':$(window).height() - 5
			})
		;

		var $iframe = $($('iframe.cont_field-preview')[0].contentWindow.document);
		var fieldheight = $iframe.find('body').height()+20;
		$('iframe.cont_field-preview').height( fieldheight );
		$('.cont_field-ctrlpanel').height( fieldheight );

		_resizeTimer = setTimeout(resizeEvent, 5000);
	}

	function init(){
		var $html = $( $('#cont_tpl_editor').html() );

		$html
			.find('button.cont_btn_save')
				.click(function(){
					save(function(result){
						if(!result){
							px.message( 'ページの保存に失敗しました。' );
						}else{
							px.message( 'ページを保存しました。' );
						}
						preview('iframe.cont_field-preview');
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
			.find('.cont_field')
				.css({
					'border':'none',
					'width':'100%'
				})
		;
		$('body')
			.html( '' )
			.append($html)
		;
		preview('iframe.cont_field-preview');
		resizeEvent();
	}

	$(function(){
		px.getCurrentProject().serverStandby( function(){
			init();
		} );
	})
	$(window).resize(function(){
		resizeEvent();
	});

})( window.parent.px );
