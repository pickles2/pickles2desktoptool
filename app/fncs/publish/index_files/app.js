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
		_this.progressReport.init(
			_this,
			$cont,
			{
				"spawnCmd": 'php',
				"spawnCmdOpts": [
					_pj.get('path')+'/'+_pj.get('entry_script') ,
					'/?PX=publish.run'
				] ,
				"cmdCd": _pj.get('path'),
				"complete": function(){
					px.message( 'パブリッシュを完了しました。' );
					init();
				}
			}
		);

		// var $msg = $('<div>');
		// px.progress.start();
		// px.spawnDialog(
		// 	'php',
		// 	[
		// 		_pj.get('path')+'/'+_pj.get('entry_script') ,
		// 		'/?PX=publish.run'
		// 	] ,
		// 	{
		// 		cd: _pj.get('path'),
		// 		title: 'パブリッシュ',
		// 		description: $msg.text('静的なHTMLをパブリッシュしています。'),
		// 		success: function(data){
		// 		} ,
		// 		error: function(data){
		// 		} ,
		// 		cmdComplete: function(code){
		// 			$msg.text( 'パブリッシュを完了しました。' );
		// 			px.progress.close();
		// 		} ,
		// 		complete: function(dataFin){
		// 			px.message( 'パブリッシュを完了しました。' );
		// 			init();
		// 		}
		// 	}
		// );
	}

	/**
	 * パブリッシュ先ディレクトリを開く
	 */
	this.open_publish_dir = function(){
		window.px.utils.spawn('open',
			[
				_pj.get('path')+'/'+_pj.get('home_dir')+'/_sys/ram/publish/'
			],
			{
				cd: _pj.get('path') ,
				complete: function(code){
				}
			}
		);
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
