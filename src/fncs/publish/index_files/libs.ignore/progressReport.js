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
		px.progress.start();

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
						px.progress.close();
						opts.complete(true);
					}, 3000);
					return;
				}
			}
		);

	} // this.init();


	return this;

}
