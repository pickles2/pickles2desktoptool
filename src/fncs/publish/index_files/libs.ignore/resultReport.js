/**
 * Publish: resultReport.js
 */
module.exports = function(contApp, px, $){
	var _this = this;

	var $scene, $results, $rows, $summaries, $spentTime, $totalFileCount, $errorMessage;
	var publishStatus;
	var errorReports = [];

	/**
	 * レポート表示の初期化
	 */
	this.init = function(){
		$scene = $('#cont_after_publish');
		if( !$scene.is(':visible') ){
			$('.cont_scene').hide();
			$scene.show();
		}
		$scene.find('.cont_results-error').removeClass('cont_results-error');

		$canvas = $scene.find('.cont_canvas');
		$results = $canvas.find('.cont_results');
		$canvas
			.height( $(window).height() - $('.container').eq(0).height() - $scene.find('.cont_buttons').height() - 20 )
		;


		$rows = $results.find('.cont_results-rows');
		$summaries = $results.find('.cont_results-summaries');
		$spentTime = $results.find('.cont_results-spentTime span');
		$totalFileCount = $results.find('.cont_results-total_file_count strong');
		$errorMessage = $results.find('.cont_results-errorMessage');

		px.it79.fnc({}, [
			function( it, arg ){
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
				contApp.checkPublishStatus(function(res){
					// console.log(res);
					publishStatus = res;
					it.next(arg);
				});
			} ,
			function( it, arg ){

				arg.alertLogCsv = [];
				if( !publishStatus.alertLogExists ){
					it.next(arg);
					return;
				}

				errorReports = [];
				d3.csv( 'file://'+contApp.getRealpathPublishDir()+"alert_log.csv" )
					.row(function(d) {
						var rtn = {};
						rtn.datetime = d['datetime'];
						rtn.path = d['path'];
						rtn.errorMessage = d['error_message'];
						errorReports.push(rtn);
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

						if( publishStatus.alertLogExists ){
							$results.addClass('cont_results-error');
							var $a = $('<a href="#">');
							$a.text(arg.alertLogCsv.length + '件のエラーが検出されています。');
							$errorMessage
								.html( '' )
								.append( $a )
							;
							$a.on('click', function(){
								_this.openErrorReports();
							});
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
		]);

	} // this.init();

	/**
	 * エラー内容を表示する
	 */
	this.openErrorReports = function(){

		$body = $('<div>');
		if( !errorReports.length ){
			$body.append('<p>エラーレポートはありません。</p>')
		}else{
			$body.append('<p>'+errorReports.length+'件のエラーがあります。</p>')
			var $table = $('<table class="px2-table"><thead></thead><tbody></tbody></table>');
			$body.append($table);
			$table.find('thead')
				.append( $('<tr>')
					.append( $('<td>').text('時刻') )
					.append( $('<td>').text('パス') )
					.append( $('<td>').text('メッセージ') )
				)
			;
			errorReports.forEach(function(error){
				$table.find('tbody')
					.append( $('<tr>')
						.append( $('<td>').text(error.datetime) )
						.append( $('<td>').text(error.path) )
						.append( $('<td>').text(error.errorMessage) )
					)
				;
			});
		}

		px2style.modal({
			title: 'エラーレポート一覧',
			body: $body,
			width: 880,
			buttons: [
				$('<button class="px2-btn">')
					.text('OK')
					.on('click', function(){
						_this.closeErrorReports();
					})
			]
		});
	}

	/**
	 * エラー内容表示を閉じる
	 */
	this.closeErrorReports = function(){
		px2style.closeModal();
	}

	return this;
}
