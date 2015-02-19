window.px = window.parent.px;
window.contApp = new (function( px ){
	if( !px ){ alert('px が宣言されていません。'); }

	var _this = this;

	var pj = px.getCurrentProject();
	var configBasePath = pj.get('path')+'/'+pj.get('home_dir');
	var confPath = configBasePath;
	var CodeMirrorInstans = [];

	function cont_init(cb){
		cb = cb||function(){};

		var $tpl = $( $('#template-main').html() );
		$('.contents').html('').append( $tpl );

		$('.cont_config_json_preview pre').text( JSON.stringify( pj.getConfig() ) );
		$('.cont_px2dtconfig_json_preview pre').text( JSON.stringify( pj.getPx2DTConfig() ) );

		var src = '';
		if( px.utils.isFile(configBasePath+'/config.json') ){
			confPath = configBasePath+'/config.json';
		}else if( px.utils.isFile(configBasePath+'/config.php') ){
			confPath = configBasePath+'/config.php';
		}
		src = px.fs.readFileSync(confPath);
		$('.cont_config_edit').html('').append( $('<textarea>').val(src) );
		CodeMirrorInstans['px2config'] = CodeMirror.fromTextArea( $('.cont_config_edit textarea').get(0), {
			lineNumbers: true,
			mode: 'application/x-httpd-php',
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,
			autoCloseBrackets: true,
			matchBrackets: true,
			showCursorWhenSelecting: true,
			viewportMargin: Infinity,

			theme: 'monokai',
			keyMap: "sublime"
		} );
		CodeMirrorInstans['px2config'].on('change',function(){
			CodeMirrorInstans['px2config'].save();
		});


		var src = '';
		if( px.utils.isFile(configBasePath+'/px2dtconfig.json') ){
			src = px.fs.readFileSync( configBasePath+'/px2dtconfig.json' );
		}
		$('.cont_px2dtconfig_edit').html('').append( $('<textarea>').val(src) );
		CodeMirrorInstans['px2dtconfig'] = CodeMirror.fromTextArea( $('.cont_px2dtconfig_edit textarea').get(0), {
			lineNumbers: true,
			mode: {name:'javascript', json: true},
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,
			autoCloseBrackets: true,
			matchBrackets: true,
			showCursorWhenSelecting: true,
			viewportMargin: Infinity,

			theme: 'monokai',
			keyMap: "sublime"
		} );
		CodeMirrorInstans['px2dtconfig'].on('change',function(){
			CodeMirrorInstans['px2dtconfig'].save();
		});

		cb();
	}
	this.save = function( btn ){
		$(btn).attr('disabled', 'disabled');

		var src = $('.cont_config_edit textarea').val();
		src = JSON.parse( JSON.stringify( src ) );

		px.fs.writeFile( confPath, src, {}, function(err){
			pj.updateConfig(function(){
				var srcPx2DT = $('.cont_px2dtconfig_edit textarea').val();
				srcPx2DT = JSON.parse( JSON.stringify( srcPx2DT ) );
				px.fs.writeFile( configBasePath+'/px2dtconfig.json', srcPx2DT, {}, function(err){
					pj.updatePx2DTConfig(function(){
						cont_init(function(){
							$(btn).removeAttr('disabled');
							px.message( 'コンフィグを保存しました。' );
						});
					});
				} );
			});
		} );
	}

	$(function(){
		cont_init();
	});

})( window.parent.px );
