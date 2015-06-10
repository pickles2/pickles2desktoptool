if(window.parent){ window.px = window.parent.px; }

/**
 * GUIエディタ
 */
window.px2dtGuiEditor = new (function(px){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;
	var _pj = px.getCurrentProject();

	var _path_base = (function() {
		if (document.currentScript) {
			return document.currentScript.src;
		} else {
			var scripts = document.getElementsByTagName('script'),
			script = scripts[scripts.length-1];
			if (script.src) {
				return script.src;
			}
		}
	})().replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');

	var _param = px.utils.parseUriParam( window.location.href );

	var _pageInfo = _pj.site.getPageInfo( _param.page_path );
	if( !_pageInfo ){
		alert('ERROR: Undefined page path.'); return this;
	}
	var _pathContent = _pageInfo.content;
	if( !_pathContent ){
		_pathContent = _pageInfo.path;
	}

	this.fieldDefinitions = {};//フィールドの種類ごとの処理を外部化して、ここに入れる。

	/**
	 * 変更を保存する。
	 */
	function save(cb){
		cb = cb || function(){};

		_this.contentsSourceData.save( function(){
			// px.message( 'データファイルを保存しました。' );

			var contPath = _pj.findPageContent( _param.page_path );
			var contentsRealpath = px.fs.realpathSync( px.utils.dirname( _pj.get('path')+'/'+_pj.get('entry_script') )+'/'+contPath);

			src = _this.ui.finalize();

			// px.message( contentsRealpath );
			px.fs.writeFile( contentsRealpath, src, {encoding:'utf8'}, function(err){
				px.message( 'HTMLファイルを保存しました。' );
				cb( !err );
			} );

		} );

		return this;
	}
	this.save = save;


	/**
	 * common header
	 */
	this.get_header_html = function(){
		var rtn = '';

		// ========== GUI Editor ==========
		rtn += '<link rel="stylesheet" href="'+_path_base+'/style.css" type="text/css" />';
		rtn += '<scri'+'pt src="'+_path_base+'/app.moduleTemplates.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+_path_base+'/app.contentsSourceData.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+_path_base+'/app.contentsSourceData.resourceMgr.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+_path_base+'/app.contentsSourceData.history.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+_path_base+'/app.ui.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+_path_base+'/app.fieldBase.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+_path_base+'/fields/app.fields.html.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+_path_base+'/fields/app.fields.html_attr_text.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+_path_base+'/fields/app.fields.href.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+_path_base+'/fields/app.fields.text.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+_path_base+'/fields/app.fields.markdown.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+_path_base+'/fields/app.fields.image.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+_path_base+'/fields/app.fields.table.js"></scri'+'pt>';
		rtn += '<scri'+'pt src="'+_path_base+'/fields/app.fields.wysiwyg_rte.js"></scri'+'pt>';//← WYSIWYGエディタ
		rtn += '<scri'+'pt src="'+_path_base+'/fields/app.fields.wysiwyg_tinymce.js"></scri'+'pt>';//← WYSIWYGエディタ
		rtn += '<scri'+'pt src="'+_path_base+'/fields/app.fields.select.js"></scri'+'pt>';

		return rtn;
	}

	/**
	 * initialize
	 */
	this.init = function(){

		px.utils.iterateFnc([
			function(it){
				px.preview.serverStandby( function(){
					it.next();
				} );
			} ,
			function(it){
				// モジュールテンプレートのロード・初期化
				var pathsModTpls = {};
				if( _pj.getPx2DTConfig() && _pj.getPx2DTConfig().paths_module_template ){
					pathsModTpls = _pj.getPx2DTConfig().paths_module_template;
				}
				_this.moduleTemplates.init( px.utils.dirname( _pj.get('path')+'/'+_pj.get('entry_script') ), pathsModTpls, function(){
					it.next();
				} );
			} ,
			function(it){
				// コンテンツデータのロード・初期化
				_this.contPath = _pj.findPageContent( _param.page_path );
				var realpath = px.utils.dirname( _pj.get('path')+'/'+_pj.get('entry_script') )+'/'+_this.contPath;
				var pathInfo = px.utils.parsePath( _this.contPath );
				_this.contFilesDirPath = px.utils.dirname( _pj.get('path')+'/'+_pj.get('entry_script') )+'/'+pathInfo.dirname+'/'+pathInfo.basenameExtless+'_files/';

				_this.contentsSourceData.init( realpath, _this.contFilesDirPath, function(){
					it.next();
				} );
			} ,
			function(it){
				var template_editor = '';
				template_editor += '<div class="cont_editorframe">';
				template_editor += '	<div class="cont_editorframe-preview">';
				template_editor += '		<div class="cont_field">';
				template_editor += '			<iframe class="cont_field-preview"></iframe>';
				template_editor += '			<div class="cont_field-ctrlpanel"></div>';
				template_editor += '		</div>';
				template_editor += '	</div><!-- / .cont_editorframe-preview -->';
				template_editor += '	<div class="cont_editorframe-ctrlpanel">';
				template_editor += '		<div class="cont_modulelist">';
				template_editor += '		</div>';
				template_editor += '		<div class="cont_btns">';
				template_editor += '			<ul>';
				template_editor += '				<!-- /* <li><button class="cont_btn_save">保存する</button></li> */ -->';
				template_editor += '				<li><button class="cont_btn_save_and_preview_in_browser">ブラウザでプレビュー</button></li>';
				template_editor += '				<li><button class="cont_btn_save_and_close">閉じる</button></li>';
				template_editor += '			</ul>';
				template_editor += '		</div>';
				template_editor += '	</div><!-- / .cont_editorframe-ctrlpanel -->';
				template_editor += '</div><!-- / .cont_editorframe -->';

				var $html = $( template_editor );// ←テンプレートをロード
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
									window.parent.contApp.closeEditor();
								}
							});
						})
				;
				$html
					.find('button.cont_btn_save_and_preview_in_browser')
						.click(function(){
							save(function(result){
								if(!result){
									px.message( 'ページの保存に失敗しました。' );
								}else{
									px.message( 'ページを保存しました。' );
									px.preview.serverStandby(function(){
										px.utils.openURL( px.preview.getUrl( _param.page_path ) );
									});
								}
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
					_this.ui.resizeEvent(function(){
						it.next();
					});
				} );
				_this.ui.preview( _param.page_path );//プレビュー表示をキック

					// ↑なんかこの辺の処理の順番が交錯してて気持ち悪いが、
					// 　一旦意図したタイミングで次へ送っているので良しとする。
					// 　あとで再整理。
			} ,
			function(it){
				// リサイズイベントを登録
				$(window).resize(function(){
					_this.ui.resizeEvent();
				});
				it.next();
			} ,
			function(it){
				px.progress.close();
				it.next();
			}
		]).start();

	}// init()


})(window.px);