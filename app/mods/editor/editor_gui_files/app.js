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
		// px.message( '[開発中]ページ保存は、まだ仕様が固まらないので一旦スタブ状態にしてます。' );

		cb = cb || function(){};

		_this.contentsSourceData.save( function(){
			px.message( 'データファイルを保存しました。' );

			var contPath = _pj.findPageContent( _param.page_path );
			var contentsRealpath = px.fs.realpathSync( _pj.get('path')+'/'+contPath);

			src = _this.ui.finalize();

			px.fs.writeFile( contentsRealpath, src, {encoding:'utf8'}, function(err){
				px.message( 'HTMLファイルを保存しました。' );
				cb( !err );
			} );

		} );

		return this;
	}


	/**
	 * 初期化
	 */
	function init(){

		px.utils.iterateFnc([
			function(it){
				// モジュールテンプレートのロード・初期化
				var pathModTpl = px.fs.realpathSync( _pj.get('path')+'/'+_pj.get('home_dir')+'/resources/document_modules/' );
				_this.moduleTemplates.init( pathModTpl, function(){
					it.next();
				} );
			} ,
			function(it){
				// コンテンツデータのロード・初期化
				var contPath = _pj.findPageContent( _param.page_path );
				var realpath = _pj.get('path')+'/'+contPath;
				var pathInfo = px.utils.parsePath(contPath);
				var dataJsonPath = _pj.get('path')+'/'+pathInfo.dirname+'/'+pathInfo.basenameExtless+'_files/data.ignore.json';

				_this.contentsSourceData.init( realpath, dataJsonPath, function(){
					it.next();
				} );
			} ,
			function(it){
				var $html = $( $('#cont_tpl_editor').html() );// ←テンプレートをロード
				$html
					.find('button.cont_btn_save')
						.click(function(){
							save(function(result){
								if(!result){
									px.message( 'ページの保存に失敗しました。' );
								}else{
									px.message( 'ページを保存しました。' );
								}
								_this.ui.preview( _param.page_path );
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

				// ↓本来、app.ui.js でonloadイベントをセットしたいのだが、
				// 　ここにこれが書かれていないと何故かイベントが起きない。
				$html
					.find('iframe.cont_field-preview')
				;

				$('body')
					.html( '' )
					.append($html)
				;

				it.next();
			} ,
			function(it){
				// 編集フィールドの再描画
				_this.ui.initField( function(){
					_this.ui.preview( _param.page_path );
					_this.ui.resizeEvent();
					it.next();
				} );
			}
		]).start();

	}// init()

	$(function(){
		px.getCurrentProject().serverStandby( function(){
			init();
			$(window).resize(function(){
				_this.ui.resizeEvent();
			});
		} );
	})

})( window.parent.px );
