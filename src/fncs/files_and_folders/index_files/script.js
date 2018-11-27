window.px = window.parent.px;
window.contApp = new (function( px ){
	var _this = this;
	var _pj = px.getCurrentProject();
	var remoteFinder;
	var $elms = {};
	$elms.editor = $('<div>');

	/**
	 * 初期化
	 */
	$(window).on('load', function(){
		remoteFinder = new RemoteFinder(
			document.getElementById('cont_finder'),
			{
				"gpiBridge": function(input, callback){
					// console.log(input);
					_pj.remoteFinder.gpi(input, function(result){
						callback(result);
					});
				},
				"mkfile": function(current_dir, callback){
					var $body = $('<div>').html( $('#template-mkfile').html() );
					function submitForm(){
						px2style.closeModal();
						var filename = $body.find('[name=filename]').val();
						if( !filename ){ return; }
						var pageInfoAll;

						px.it79.fnc({}, [
							function(it1){
								_pj.execPx2(
									current_dir+filename+'?PX=px2dthelper.get.all',
									{
										complete: function(resources){
											try{
												resources = JSON.parse(resources);
											}catch(e){
												console.error('Failed to parse JSON "client_resources".', e);
											}
											// console.log(resources);
											pageInfoAll = resources;
											it1.next();
										}
									}
								);

							},
							function(it1){
								if( filename.match(/\.html?$/i) && $body.find('[name=is_guieditor]:checked').val() ){
									// GUI編集モードが有効
									var realpath_data_dir = pageInfoAll.realpath_data_dir;
									px.fsEx.mkdirpSync( realpath_data_dir );
									px.fs.writeFileSync( realpath_data_dir+'data.json', '{}' );
								}
								it1.next();
							},
							function(it1){
								callback( filename );
								it1.next();
							}
						]);

					}
					$body.find('form').on('submit', function(){
						submitForm();
					});
					$body.find('.cont_current_dir').text(current_dir);
					$body.find('[name=filename]').on('change keyup', function(){
						var filename = $body.find('[name=filename]').val();
						if( filename.match(/\.html?$/i) ){
							$body.find('.cont_html_ext_option').show();
						}else{
							$body.find('.cont_html_ext_option').hide();
						}
					})
					px2style.modal({
						'title': 'Create new File',
						'body': $body,
						'buttons': [
							$('<button class="px2-btn">')
								.text('Cancel')
								.on('click', function(e){
									px2style.closeModal();
								}),
							$('<button class="px2-btn px2-btn--primary">')
								.text('OK')
								.on('click', function(e){
									submitForm();
								})
						],
						'width': '460px'
					}, function(){
						$body.find('[name=filename]').focus();
					});
				},
				"open": function(fileinfo, callback){
					// console.log(fileinfo);
					var realpath = require('path').resolve(_pj.get('path'), './'+fileinfo.path);
					// var src = px.fs.readFileSync(realpath);
					switch( fileinfo.ext ){
						case 'html':
						case 'htm':
							px.preview.serverStandby( function(result){
								_this.openEditor( fileinfo.path );
							} );
							break;
						case 'xlsx':
						case 'csv':
							px.utils.openURL( realpath );
							break;
						case 'php':
						case 'inc':
						case 'txt':
						case 'md':
						case 'css':
						case 'scss':
						case 'js':
						case 'json':
						case 'lock':
						case 'gitignore':
						case 'gitkeep':
						case 'htaccess':
						case 'htpasswd':
							px.openInTextEditor( realpath );
							break;
						default:
							px.utils.openURL( realpath );
							break;
					}
					callback(true);
				},
				"remove": function(target_item, callback){
					if(confirm('本当に削除してよろしいですか？'+"\n"+target_item)){
						callback();
					}
				}
			}
		);
		// console.log(remoteFinder);
		remoteFinder.init('/', {}, function(){
			console.log('ready.');
		});

		$(window).on('resize', function(){
			onWindowResize();
		});
	});

	/**
	 * エディター画面を開く
	 */
	this.openEditor = function( pagePath ){

		this.closeEditor();//一旦閉じる

		// プログレスモード表示
		px.progress.start({
			'blindness':true,
			'showProgressBar': true
		});

		var contPath = _pj.findPageContent( pagePath );
		var contRealpath = _pj.get('path')+'/'+contPath;
		var pathInfo = px.utils.parsePath(contPath);
		if( _pj.site.getPathType( pagePath ) == 'dynamic' ){
			var dynamicPathInfo = _pj.site.get_dynamic_path_info(pagePath);
			pagePath = dynamicPathInfo.path;
		}

		if( px.fs.existsSync( contRealpath ) ){
			contRealpath = px.fs.realpathSync( contRealpath );
		}

		$elms.editor = $('<div>')
			.css({
				'position':'fixed',
				'top':0,
				'left':0 ,
				'z-index': '1000',
				'width':'100%',
				'height':$(window).height()
			})
			.append(
				$('<iframe>')
					//↓エディタ自体は別のHTMLで実装
					.attr( 'src', '../../mods/editor/index.html'
						+'?page_path='+encodeURIComponent( pagePath )
					)
					.css({
						'border':'0px none',
						'width':'100%',
						'height':'100%'
					})
			)
			.append(
				$('<a>')
					.html('&times;')
					.attr('href', 'javascript:;')
					.on('click', function(){
						// if(!confirm('編集中の内容は破棄されます。エディタを閉じますか？')){ return false; }
						_this.closeEditor();
					} )
					.css({
						'position':'absolute',
						'bottom':5,
						'right':5,
						'font-size':'18px',
						'color':'#333',
						'background-color':'#eee',
						'border-radius':'0.5em',
						'border':'1px solid #333',
						'text-align':'center',
						'opacity':0.4,
						'width':'1.5em',
						'height':'1.5em',
						'text-decoration': 'none'
					})
					.hover(function(){
						$(this).animate({
							'opacity':1
						});
					}, function(){
						$(this).animate({
							'opacity':0.4
						});
					})
			)
		;
		$('body')
			.append($elms.editor)
			.css({'overflow':'hidden'})
		;

		return this;
	} // openEditor()

	/**
	 * エディター画面を閉じる
	 * 単に閉じるだけです。編集内容の保存などの処理は、editor.html 側に委ねます。
	 */
	this.closeEditor = function(){
		$elms.editor.remove();
		$('body')
			.css({'overflow':'auto'})
		;
		return this;
	} // closeEditor()

	/**
	 * ウィンドウリサイズイベントハンドラ
	 */
	function onWindowResize(){
		$elms.editor
			.css({
				'height': $(window).innerHeight() - 0
			})
		;
	}

})( window.parent.px );
