(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Publish: app.js
 */
window.px = window.parent.px;
window.contApp = new (function(px, $){
	var _this = this;
	var _pj, _realpathPublishDir;
	var $cont;
	var _status;
	var _patterns;

	this.resultReport = new(require('../../../fncs/publish/index_files/libs.ignore/resultReport.js'))(this, px, $);
	this.progressReport = new(require('../../../fncs/publish/index_files/libs.ignore/progressReport.js'))(this, px, $);

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

		try {
			// パブリッシュパターンの設定を読み込む。
			_patterns = _pj.getConfig().plugins.px2dt.publish_patterns;
		} catch (e) {
		}

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
				px.commandQueue.client.createTerminal(null, {
					"tags": [
						'pj-'+_pj.get('id'),
						'pickles2-publish'
					],
					"write": function(message){
						console.log('terminal message', message);
					}
				});
				it.next(arg);
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
					_this.resultReport.init( $cont.find('.cont_canvas') );
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
		var $body = $( $('#template-dialog_publish_options').html() );
		try {
			if(_pj.appdata.get().publishOption.last){
				var path_region = [_pj.appdata.get().publishOption.last.path_region];
				path_region = path_region.concat(_pj.appdata.get().publishOption.last.paths_region);
				try {
					$body.find('textarea[name=path_region]').val( path_region.join("\n") );
				} catch (e) {
					$body.find('textarea[name=path_region]').val( '/' );
				}
				try {
					$body.find('textarea[name=paths_ignore]').val( _pj.appdata.get().publishOption.last.paths_ignore.join("\n") );
				} catch (e) {
					$body.find('textarea[name=paths_ignore]').val( '' );
				}
				try {
					$body.find('input[name=keep_cache]').prop("checked", !!(_pj.appdata.get().publishOption.last.keep_cache));
				} catch (e) {
					$body.find('input[name=keep_cache]').prop("checked", false);
				}
			}
		} catch (e) {
		}

		(function(){
			// パブリッシュパターンの選択UIを作る
			var $pattern = $body.find('.cont_form_pattern');
			$pattern.css({
				'margin':'1em auto'
			});
			try {
				// console.log(patterns);
				if( typeof(_patterns) !== typeof([]) || !_patterns.length){
					$pattern.remove();
				}else{
					var $select = $pattern.find('select');
					$select.append('<option value="">select pattern...</option>');
					for( var idx in _patterns ){
						var $opt = $('<option>');
						$opt.attr({'value': idx});
						$opt.text( _patterns[idx].label );
						$select.append($opt);
					}
					$select.change(function(){
						var selectedValue = $(this).val();
						// alert(selectedValue);
						var data = _patterns[selectedValue];
						$(this).val('');
						if( !data ){
							alert('ERROR: 設定を読み込めません。');
							return;
						}
						try {
							$body.find('textarea[name=path_region]').val( data.paths_region.join("\n") );
						} catch (e) {
							$body.find('textarea[name=path_region]').val( '/' );
						}
						try {
							$body.find('textarea[name=paths_ignore]').val( data.paths_ignore.join("\n") );
						} catch (e) {
							$body.find('textarea[name=paths_ignore]').val( '' );
						}
						try {
							$body.find('input[name=keep_cache]').prop("checked", !!(data.keep_cache));
						} catch (e) {
							$body.find('input[name=keep_cache]').prop("checked", false);
						}
						return;
					});
				}
			} catch (e) {
				// 設定されていなかったら選択欄を削除
				$pattern.remove();
			}
		})();

		px.dialog({
			'title': 'パブリッシュ',
			'body': $body,
			'buttons':[
				$('<button>')
					.text('パブリッシュを実行する')
					.attr({'type':'submit'})
					.addClass('px2-btn px2-btn--primary')
					.on('click', function(){
						var str_paths_region_val = $body.find('textarea[name=path_region]').val();
						var str_paths_region = '';
						var tmp_ary_paths_region = str_paths_region_val.split(new RegExp('\r\n|\r|\n','g'));
						var ary_paths_region = [];
						for( var i in tmp_ary_paths_region ){
							tmp_ary_paths_region[i] = px.php.trim(tmp_ary_paths_region[i]);
							if( px.php.strlen(tmp_ary_paths_region[i]) ){
								ary_paths_region.push( tmp_ary_paths_region[i] );
							}
						}
						if( !ary_paths_region.length ){
							alert('パブリッシュ対象が指定されていません。1件以上指定してください。');
							return true;
						}
						var path_region = ary_paths_region.shift();

						var str_paths_ignore_val = $body.find('textarea[name=paths_ignore]').val();
						var str_paths_ignore = '';
						var ary_paths_ignore = str_paths_ignore_val.split(new RegExp('\r\n|\r|\n','g'));
						for( var i in ary_paths_ignore ){
							ary_paths_ignore[i] = px.php.trim(ary_paths_ignore[i]);
							if( !px.php.strlen(ary_paths_ignore[i]) ){
								ary_paths_ignore[i] = undefined;
								delete(ary_paths_ignore[i]);
							}
						}
						if( typeof(ary_paths_ignore) == typeof('') ){
							ary_paths_ignore = [ary_paths_ignore];
						}

						var keep_cache = ( $body.find('input[name=keep_cache]:checked').val() ? 1 : 0 );

						px.closeDialog();

						_pj.appdata.get().publishOption = _pj.appdata.get().publishOption || {};
						_pj.appdata.get().publishOption.last = {
							"path_region": path_region,
							"paths_region": ary_paths_region,
							"paths_ignore": ary_paths_ignore,
							"keep_cache": keep_cache
						};
						_pj.appdata.save(function(){});

						_this.progressReport.init(
							$cont,
							{
								"path_region": path_region,
								"paths_region": ary_paths_region,
								"paths_ignore": ary_paths_ignore,
								"keep_cache": keep_cache,
								"complete": function(){
									px.message( 'パブリッシュを完了しました。' );
									init();
								}
							}
						);
					}),
				$('<button>')
					.text(px.lb.get('ui_label.cancel'))
					.addClass('px2-btn')
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
	 * パブリッシュ中状態からの復旧方法の開閉
	 */
	this.toggle_how_to_recovery_on_publish = function(target,a){
		var $this = $(a);
		var $target = $(target);
		$target.toggle('fast',function(){
			$this.removeClass('glyphicon-menu-right').removeClass('glyphicon-menu-down');
			if( $target.is(":hidden") ){
				$this.addClass('glyphicon-menu-right');
			}else{
				$this.addClass('glyphicon-menu-down');
			}
		});
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

},{"../../../fncs/publish/index_files/libs.ignore/progressReport.js":2,"../../../fncs/publish/index_files/libs.ignore/resultReport.js":3}],2:[function(require,module,exports){
/**
 * Publish: progressReport.js
 */
module.exports = function(contApp, px, $){
	var _this = this;
	var _pj = px.getCurrentProject();
	var $results, $phase, $currentTask, $timer, $row, $progressBar;
	var _timer;

	/**
	 * レポート表示の初期化
	 */
	this.init = function( $canvas, opts ){
		// px.progress.start();

		$results = $( $('#template-before_publish-progress').html() );
		$timer = $results.find('.cont_progress-timer');
		$row = $results.find('.cont_progress-row');
		$phase = $results.find('.cont_progress-phase').css({'font-weight':'bold'});
		$currentTask = $results.find('.cont_progress-currentTask');
		$progressBar = $results.find('.cont_progress-bar [role=progressbar]');
		$canvas.html('').append( $results );


		var phase;

		function updateView(data){
			try {
				var data = data.toString();
				var rows = data.split(new RegExp('(\r\n|\r|\n)+'));
			} catch (e) {
			}
			for( var idx in rows ){
				var row = px.php.trim( rows[idx] );
				if( typeof(row) !== typeof('') || !row.length ){
					continue;
				}
				if( row.match( new RegExp('^\\#\\#([\\s\\S]+)$') ) ){
					phase = px.php.trim( RegExp.$1 );
					if( phase == 'Start publishing' ){
						$phase.text( 'Publishing...' );
						(function(){
							var startTimestamp = (new Date).getTime();
							function updateTimer(){
								var time = (new Date).getTime() - startTimestamp;
								$timer.text( Math.floor(time/1000) + ' sec' );
								_timer = setTimeout( updateTimer, 25 );
							}
							updateTimer();
						})();
					}else{
						$phase.text( phase );
					}
				}else if( phase == 'Start publishing' ){
					if( row.match( new RegExp('^([0-9]+)\\/([0-9]+)$') ) ){
						$currentTask.text( RegExp.$1 +' / '+ RegExp.$2 );
						var per = RegExp.$1/RegExp.$2*100;
						$progressBar.attr({'aria-valuenow':per}).css({'width':per+'%'});
					}else if( row.match( new RegExp('^\\/([\\s\\S]+)$') ) ){
						$row.text(row);
					}
				}else if( phase == 'Clearing caches' ){
					$row.text(row);
				}else if( phase == 'Making list' ){
					$row.text(row);
				}else{
					$row.text('');
				}
				// console.log( row );
			}
		}

		var px2cmd_options = '';
		px2cmd_options += 'path_region='+encodeURIComponent(opts.path_region);
		for(var idx in opts.paths_region){
			px2cmd_options += '&paths_region[]='+encodeURIComponent(opts.paths_region[idx]);
		}
		for(var idx in opts.paths_ignore){
			px2cmd_options += '&paths_ignore[]='+encodeURIComponent(opts.paths_ignore[idx]);
		}
		if(opts.keep_cache){
			px2cmd_options += '&keep_cache=1';
		}

		px.commandQueue.client.addQueueItem(
			[
				'php',
				px.path.resolve(_pj.get('path'), _pj.get('entry_script')),
				'/?PX=publish.run&'+px2cmd_options
			],
			{
				'cdName': 'default',
				'tags': [
					'pj-'+_pj.get('id'),
					'pickles2-publish'
				],
				'accept': function(queueId){
					// console.log(queueId);
				},
				'open': function(message){
				},
				'stdout': function(message){
					updateView(message.data.join(''));
				},
				'stderr': function(message){
					updateView(message.data.join(''));
				},
				'close': function(message){
					clearTimeout(_timer);
					setTimeout(function(){
						// px.progress.close();
						opts.complete(true);
					}, 3000);
					return;
				}
			}
		);

	} // this.init();


	return this;

}

},{}],3:[function(require,module,exports){
/**
 * Publish: resultReport.js
 */
module.exports = function(contApp, px, $){
	var _this = this;

	var $results, $rows, $summaries, $spentTime, $totalFileCount, $errorMessage;

	/**
	 * レポート表示の初期化
	 */
	this.init = function( $canvas ){

		$results = $( $('#template-after_publish-canvas').html() );
		$canvas.append( $results );

		$rows = $results.find('.cont_results-rows');
		$summaries = $results.find('.cont_results-summaries');
		$spentTime = $results.find('.cont_results-spentTime span');
		$totalFileCount = $results.find('.cont_results-total_file_count strong');
		$errorMessage = $results.find('.cont_results-errorMessage');

		px.utils.iterateFnc([
			function( it, arg ){
				// d3.csv( contApp.getRealpathPublishDir()+"publish_log.csv", function(error, csv){
				// 	arg.publishLogCsv = csv;
				// 	it.next(arg);
				// });

				d3.csv( 'file://'+contApp.getRealpathPublishDir()+"publish_log.csv" )
					.row(function(d) {
						var rtn = {};
						rtn.datetime = d['datetime'];
						rtn.path = d['path'];
						rtn.procType = d['proc_type'];
						rtn.statusCode = d['status_code'];
						return rtn;
					})
					.get(function(error, csv) {
						// console.log(csv);
						arg.publishLogCsv = csv;
						it.next(arg);
					})
				;
			} ,
			function( it, arg ){
				var status = contApp.getStatus();
				arg.alertLogCsv = [];
				if( !status.alertLogExists ){
					it.next(arg);
					return;
				}
				d3.csv( 'file://'+contApp.getRealpathPublishDir()+"alert_log.csv" )
					.row(function(d) {
						var rtn = {};
						rtn.datetime = d['datetime'];
						rtn.path = d['path'];
						rtn.errorMessage = d['error_message'];
						return rtn;
					})
					.get(function(error, csv) {
						// console.log(csv);
						arg.alertLogCsv = csv;
						it.next(arg);
					})
				;
			} ,
			function( it, arg ){
				var status = contApp.getStatus();
				var count = arg.publishLogCsv.length;
				var startDateTime = arg.publishLogCsv[0].datetime;
				var endDateTime = arg.publishLogCsv[arg.publishLogCsv.length-1].datetime;
				var time = Date.parse( endDateTime ) - Date.parse( startDateTime );

				function updateTotalFileCounter( count, i ){
					i ++;
					var t = 50;
					if( t == i ){
						// 全量完了
						$totalFileCount.text( count );

						if( status.alertLogExists ){
							$results.addClass('cont_results-error');
							$errorMessage
								.text( arg.alertLogCsv.length + '件のエラーが検出されています。' )
							;
						}
						return;
					}
					$totalFileCount.text( Math.round(count/t*i) );
					setTimeout( function(){ updateTotalFileCounter( count, i ); }, 2 );
				}
				updateTotalFileCounter( count, 0 );

				function updateSpentTime( time, i ){
					i ++;
					var t = 35;
					if( t == i ){
						// 全量完了
						$spentTime.text( time + ' sec' );
						return;
					}
					$spentTime.text( Math.round(time/t*i) + ' sec' );
					setTimeout( function(){ updateSpentTime( time, i ); }, 4 );
				}
				updateSpentTime( (time/1000), 0 );


				var rows = [];
				var summaries = {
					'procTypes': {} ,
					'statusCodes': {}
				};
				// d3.select( $canvas.get(0) ).html(arg.publishLogCsv);

				px.utils.iterate(
					arg.publishLogCsv,
					function( it2, row2, idx2 ){

						// 行データ
						rows.push( row2 );
						(function(){
							return;// ← 開発中コメントアウト
							var li = d3.select( $rows.find('table').get(0) ).selectAll('tr');
							var update = li
								.data(rows)
								// .html(function(d, i){
								// 	return '<td>'+(i+1) + '</td><td>' + d['* path']+'</td>';
								// })
							;
							update.enter()
								.append('tr')
								.html(function(d, i){
									var html = '';
									html += '<th>'+(i+1) + '</th>';
									html += '<td>'+d.path+'</td>';
									html += '<td>'+d.procType+'</td>';
									html += '<td>'+d.statusCode+'</td>';
									return html;
								})
							;
							update.exit()
								.remove()//消す
							;
						})();



						// 統計
						if( !summaries.procTypes[row2.procType] ){ summaries.procTypes[row2.procType] = 0; };
						summaries.procTypes[row2.procType] ++;

						if( !summaries.statusCodes[row2.statusCode] ){ summaries.statusCodes[row2.statusCode] = 0; };
						summaries.statusCodes[row2.statusCode] ++;
						// console.log(summaries);

						(function(){
							var table = d3.select( $summaries.find('table').get(0) );
							table.select('tr.cont_procTypes td')
								.data([summaries.procTypes])
								.html(
									function(d, i){
										var ul = $('<ul>');
										for( var idx in d ){
											ul.append( $('<li>').text( idx + ': ' + d[idx] ) );
										}
										return ul.html();
									}
								)
							;
							table.select('tr.cont_statusCodes td')
								.data([summaries.statusCodes])
								.html(
									function(d, i){
										var ul = $('<ul>');
										for( var idx in d ){
											ul.append( $('<li>').text( idx + ': ' + d[idx] ) );
										}
										return ul.html();
									}
								)
							;
						})();

						setTimeout( function(){
							it2.next();
						}, 0 );

					} ,
					function(){
						it.next(arg);
					}
				);

			}
		]).start({});

	} // this.init();

	return this;
}

},{}]},{},[1])