/**
 * Publish: app.js
 */
window.px = window.parent.px;
window.contApp = new (function(px, $){
	var _this = this;
	var _pj, _realpathPublishDir;
	var $cont;
	var _status;

	/**
	 * initialize
	 */
	function init(){
		px.progress.start({
			'blindness':false
		});

		_pj = px.getCurrentProject();
		_realpathPublishDir = px.path.resolve( _pj.get('path')+'/'+_pj.get('home_dir')+'/_sys/ram/publish/' )+'/';
		$cont = $('.contents');
		$cont.html('');

		px.utils.iterateFnc([
			function(it, arg){
				px.fs.exists( _realpathPublishDir+'applock.txt', function(result){
					arg.applockExists = result;
					it.next(arg);
				} );
			} ,
			function(it, arg){
				px.fs.exists( _realpathPublishDir+'publish_log.csv', function(result){
					arg.publishLogExists = result;
					it.next(arg);
				} );
			} ,
			function(it, arg){
				px.fs.exists( _realpathPublishDir+'alert_log.csv', function(result){
					arg.alertLogExists = result;
					it.next(arg);
				} );
			} ,
			function(it, arg){
				px.fs.exists( _realpathPublishDir+'htdocs/', function(result){
					arg.htdocsExists = result;
					it.next(arg);
				} );
			} ,
			function(it, arg){
				_status = arg;
				if( _status.applockExists ){
					// パブリッシュ中だったら
					$cont.append( $('#template-on_publish').html() );
				}else if( _status.publishLogExists && _status.htdocsExists ){
					// パブリッシュが完了していたら
					$cont.append( $('#template-after_publish').html() );
					$cont.find('.cont_canvas')
						.height( $(window).height() - $('.container').eq(0).height() - $cont.find('.cont_buttons').height() - 20 )
					;
					_this.resultReport.init( _this, $cont.find('.cont_canvas') );
				}else{
					// パブリッシュ前だったら
					$cont.append( $('#template-before_publish').html() );
				}
				// console.log(arg);
				it.next(arg);
			} ,
			function(it, arg){
				setTimeout(function(){
					px.progress.close();
					it.next(arg);
				}, 10);
			}
		]).start({});
	}

	/**
	 * パブリッシュを実行する
	 */
	this.publish = function(){
		var $body = $($('#template-dialog_publish_options').html());
		px.dialog({
			'title': 'パブリッシュ範囲',
			'body': $body,
			'buttons':[
				$('<button>')
					.text('パブリッシュを実行')
					.attr({'type':'submit'})
					.addClass('btn btn-primary')
					.click(function(){
						var region = $body.find('input[name=path_region]').val();
						// var region = prompt('パブリッシュ対象のパスを指定してください。スラッシュから始まるパスで指定します。省略時、すべてのファイルが対象になります。','/');
						if( region === null ){
							return true;
						}
						// alert(px.php.urlencode(region));

						var str_paths_ignore_val = $body.find('textarea[name=paths_ignore]').val();
						// alert(str_paths_ignore_val);
						var str_paths_ignore = '';
						var ary_paths_ignore = str_paths_ignore_val.split(new RegExp('\r\n|\r|\n','g'));
						for( var i in ary_paths_ignore ){
							ary_paths_ignore[i] = px.php.trim(ary_paths_ignore[i]);
							if( !px.php.strlen(ary_paths_ignore[i]) ){
								ary_paths_ignore[i] = undefined;
								delete(ary_paths_ignore[i]);
							}
						}
						// console.log(ary_paths_ignore);
						if( typeof(ary_paths_ignore) == typeof('') ){
							ary_paths_ignore = [ary_paths_ignore];
						}
						if( typeof(ary_paths_ignore) == typeof([]) ){
							for( var i in ary_paths_ignore ){
								str_paths_ignore += '&paths_ignore[]='+px.php.urlencode(ary_paths_ignore[i]);
							}
						}
						// alert(str_paths_ignore);

						px.closeDialog();

						_this.progressReport.init(
							_this,
							$cont,
							{
								"spawnCmdOpts": [
									_pj.get('path')+'/'+_pj.get('entry_script') ,
									'/?PX=publish.run&path_region='+px.php.urlencode(region)+str_paths_ignore
								] ,
								"cmdCd": _pj.get('path'),
								"complete": function(){
									px.message( 'パブリッシュを完了しました。' );
									init();
								}
							}
						);
					}),
				$('<button>')
					.text('Cancel')
					.addClass('btn btn-default')
					.click(function(){
						px.closeDialog();
					})
			]
		});

		return true;
	}

	/**
	 * 一時パブリッシュ先ディレクトリを開く
	 */
	this.open_publish_tmp_dir = function(){
		window.px.utils.openURL(_pj.get('path')+'/'+_pj.get('home_dir')+'/_sys/ram/publish/');
	}

	/**
	 * パブリッシュ先ディレクトリを開く
	 */
	this.open_publish_dir = function(){
		var conf = _pj.getConfig();
		if( !conf.path_publish_dir ){
			alert('パブリッシュ先ディレクトリは設定されていません。\nプロジェクト設定(config.php) で $conf->path_publish_dir を設定してください。');
			return;
		}

		var path = '';
		if( typeof(conf.path_publish_dir) == typeof('') ){
			path = px.path.resolve( px.php.dirname(_pj.get('path')+'/'+_pj.get('entry_script')), conf.path_publish_dir );
		}
		if( !px.utils.isDirectory(path) ){
			alert('設定されたパブリッシュ先ディレクトリが存在しません。存在する有効なディレクトリである必要があります。\nプロジェクト設定(config.php) で $conf->path_publish_dir を設定してください。');
			return;
		}
		window.px.utils.openURL(path);
	}

	/**
	 * ステータスを取得
	 */
	this.getStatus = function(){
		return _status;
	}

	/**
	 * パブリッシュディレクトリのパスを取得
	 */
	this.getRealpathPublishDir = function(){
		return _realpathPublishDir;
	}


	$(window).load(function(){
		init();
	});
	$(window).resize(function(){
		$('.cont_canvas')
			.height( $(window).height() - $('.container').eq(0).height() - $cont.find('.cont_buttons').height() - 20 )
		;
	});

	return this;
})(px, $);
