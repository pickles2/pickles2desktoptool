window.px = $.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var _pj = px.getCurrentProject();

	var _param = px.utils.parseUriParam( window.location.href );


	/**
	 * 変更を保存する。
	 */
	function save(cb){
		px.message( '[開発中]ページ保存は、まだ仕様が固まらないので一旦スタブ状態にしてます。' );

		cb = cb || function(){};

		// var contPath = _pj.findPageContent( _param.page_path );
		// var contentsRealpath = px.fs.realpathSync( _pj.get('path')+'/'+contPath);
		// var src = $('body textarea').val();
		// src = JSON.parse( JSON.stringify( src ) );

		// px.fs.writeFile( contentsRealpath, src, {encoding:'utf8'}, function(err){
		// 	cb( !err );
		// } );

		cb( true );
		return this;
	}

	/**
	 * プレビュー画面(=GUI編集画面)を表示
	 */
	function preview(iframe){
		$(iframe)
			.attr('src', 'http://127.0.0.1:8080'+_param.page_path)
		;
		return true;
	}

	/**
	 * ウィンドウ リサイズ イベント ハンドラ
	 */
	function resizeEvent(){
		$('.cont_field')
			.css({
				'height':$(window).height() - 5
			})
		;

		var $iframe = $($('iframe.cont_field-preview')[0].contentWindow.document);
		var fieldheight = $iframe.find('body').height()+20;
		$('iframe.cont_field-preview').height( fieldheight );
		$('.cont_field-ctrlpanel').height( fieldheight );
	}

	/**
	 * フィールド再描画
	 */
	function drawField( cb ){
		// モジュールパレットの初期化
		$('.cont_modulelist')
			.html('')
			.append('<ul>')
		;
		var li = d3.select('.cont_modulelist ul').selectAll('li');
		var update = li.data( _this.modTpl.getAll() );
		update
			.text(function(d, i){
				return d.id;
			})
			.style({'color':'inherit'})
		;
		update.enter()
			.append('li')
			.append('button')
			.text(function(d, i){
				return d.id;
			})
			.style({'color':'inherit'})
			.attr({'draggable': true})//←HTML5のAPI http://www.htmq.com/dnd/
			.on('dragstart', function(){
				px.message( $(this).text() );
				event.dataTransfer.setData("moduleId", $(this).text() );
			})
		;
		update.exit()
			.remove()//消すときはこれ。
		;

		// 編集フィールドの初期化
		$('.cont_field-ctrlpanel')
			.bind('drop', function(e){
				var modId = event.dataTransfer.getData("moduleId");
				px.message( 'modId "'+modId+'" がドロップされました。' );
			})
			.bind('dragover', function(e){
				event.preventDefault();
				// px.message(456);
			})
			.bind('click', function(e){
				px.message('TEST: Clicked');
			})
		;
	} // drawField()

	/**
	 * 初期化
	 */
	function init(){
		var $html = $( $('#cont_tpl_editor').html() );

		px.utils.iterateFnc([
			function(it){
				// モジュールテンプレートのロード・初期化
				var pathModTpl = px.fs.realpathSync( _pj.get('path')+'/'+_pj.get('home_dir')+'/resources/document_modules/' );
				_this.modTpl.init( pathModTpl, function(){
					it.next();
				} );
			} ,
			function(it){
				// コンテンツデータのロード・初期化
				var contPath = _pj.findPageContent( _param.page_path );
				var realpath = _pj.get('path')+'/'+contPath;
				var pathInfo = px.utils.parsePath(contPath);
				var dataJsonPath = _pj.get('path')+'/'+pathInfo.dirname+'/'+pathInfo.basenameExtless+'_files/data.ignore.json';

				_this.contData.init( realpath, dataJsonPath, function(){
					it.next();
				} );
			} ,
			function(it){
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
				$html
					.find('iframe.cont_field-preview')
						.bind('load', function(){
							resizeEvent();
						})
				;
				$('body')
					.html( '' )
					.append($html)
				;

				preview('iframe.cont_field-preview');
				resizeEvent();

				it.next();
			} ,
			function(it){
				// 編集フィールドの再描画
				drawField( function(){
					it.next();
				} );
			}
		]).start();

	}// init()

	$(function(){
		px.getCurrentProject().serverStandby( function(){
			init();
			$(window).resize(function(){
				resizeEvent();
			});
		} );
	})

})( window.parent.px );
