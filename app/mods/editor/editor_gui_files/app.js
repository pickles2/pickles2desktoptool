window.px = $.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var _pj = px.getCurrentProject();

	var _param = px.utils.parseUriParam( window.location.href );

	var _cont_path = _pj.findPageContent( _param.page_path );
	var _cont_realpath = _pj.get('path')+'/'+_cont_path;
	var _cont_path_info = px.utils.parsePath(_cont_path);
	var _cont_contentsPath = px.fs.realpathSync( _pj.get('path')+'/'+_cont_path);
	var _cont_filesDirPath = _pj.get('path')+'/'+_cont_path_info.dirname+'/'+_cont_path_info.basenameExtless+'_files/data.ignore.json';
	var _cont_pathModTpl = px.fs.realpathSync( _pj.get('path')+'/'+_pj.get('home_dir')+'/resources/document_modules/' );

	var _contentsData = null;


	/**
	 * 変更を保存する。
	 */
	function save(cb){
		px.message( '[開発中]ページ保存は、まだ仕様が固まらないので一旦スタブ状態にしてます。' );

		cb = cb || function(){};
		// var src = $('body textarea').val();
		// src = JSON.parse( JSON.stringify( src ) );

		// px.fs.writeFile( _cont_contentsPath, src, {encoding:'utf8'}, function(err){
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
	 * 初期化
	 */
	function init(){
		var $html = $( $('#cont_tpl_editor').html() );

		px.utils.iterateFnc([
			function(it){
				if( !px.fs.existsSync( _cont_realpath ) ){
					alert('コンテンツファイルが存在しません。');
					window.parent.contApp.closeEditor();
					return this;
				}
				_cont_realpath = px.fs.realpathSync( _cont_realpath );

				if( !px.fs.existsSync( _cont_filesDirPath ) ){
					alert('データファイルが存在しません。');
					window.parent.contApp.closeEditor();
					return this;
				}
				_cont_filesDirPath = px.fs.realpathSync( _cont_filesDirPath );

				// コンテンツデータをロード
				_contentsData = JSON.parse( px.fs.readFileSync( _cont_filesDirPath ) );

				it.next();
			} ,
			function(it){
				// モジュールテンプレートの初期化
				_this.modtpl.init( _cont_pathModTpl, function(){
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
					.find('.cont_field-ctrlpanel')
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
				// モジュールパレットの初期化
				$('.cont_modulelist')
					.html('')
					.append('<ul>')
				;
				var li = d3.select('.cont_modulelist ul').selectAll('li');
				var update = li.data( _this.modtpl.getAll() );
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
				it.next();
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
