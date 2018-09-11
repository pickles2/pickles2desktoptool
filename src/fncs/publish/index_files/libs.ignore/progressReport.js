/**
 * Publish: progressReport.js
 */
module.exports = function(contApp, px, $){
	var _this = this;
	var _pj = px.getCurrentProject();
	var $results, $phase, $currentTask, $timer, $row, $progressBar;
	var phase;

	/**
	 * レポート表示の初期化
	 */
	this.init = function(){
		$results = $('#cont_before_publish-progress');
		$timer = $results.find('.cont_progress-timer');
		$row = $results.find('.cont_progress-row');
		$phase = $results.find('.cont_progress-phase').css({'font-weight':'bold'});
		$currentTask = $results.find('.cont_progress-currentTask');
		$progressBar = $results.find('.cont_progress-bar [role=progressbar]');
	}

	/**
	 * 進捗レポート画面を更新する
	 */
	this.updateView = function(data){

		if( !$results.is(':visible') ){
			$('.cont_main_view').hide();
			$results.show();
		}

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

	return this;

}
