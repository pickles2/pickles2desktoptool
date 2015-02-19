/**
 * Publish: app.resultReport.js
 */
window.contApp.resultReport = new (function(px, $){
	var _this = this;

	var $tmpRows, $tmpTable, $tmpSvg;

	/**
	 * レポート表示の初期化
	 */
	this.init = function( contApp, $canvas ){

		$tmpRows = $('<div>');
		$tmpTable = $('<div>');
		$tmpSvg = $('<svg>');
		$tmpTotalCount = $('<div>');

		$canvas.html('')
			.css({
				'position': 'relative'
			})
			.append( $tmpTotalCount
			)
			.append( $tmpRows
				.css({
					'overflow':'auto',
					'height':'300px'
				})
				.append( $('<table class="def">') )
			)
			.append( $tmpTable
				.append( $('<table class="def">')
					.append( $('<tr class="cont_procTypes"><th>Process Type</th><td></td></tr>')
					)
					.append( $('<tr class="cont_statusCodes"><th>Status Code</th><td></td></tr>')
					)
				)
			)
			.append( $tmpSvg
			)
		;

		setTimeout(function(){
			d3.csv( contApp.getRealpathPublishDir()+"publish_log.csv", function(error, csv){
				// var csv = d3.csv.parseRows(data);

				var status = contApp.getStatus();
				var count = csv.length;
				var startDateTime = csv[0]['* datetime'];
				var endDateTime = csv[csv.length-1]['* datetime'];

				$tmpTotalCount
					.html('')
					.append( $('<p>').text( 'total:'+count )
					)
					.append( $('<p>').text( startDateTime + ' 〜 ' + endDateTime )
					)
				;
				if( status.alertLogExists ){
					$tmpTotalCount
						.append( $('<p>').text('エラーが検出されています。').addClass('error') )
					;
				}


				var rows = [];
				var statistics = {
					'procTypes': {} ,
					'statusCodes': {}
				};
				// d3.select( $canvas.get(0) ).html(csv);

				px.utils.iterate(
					csv,
					function( it, row, idx ){

						// 行データ
						rows.push( row );
						(function(){
							var li = d3.select( $tmpRows.find('table').get(0) ).selectAll('tr');
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
									html += '<td>'+d['* path']+'</td>';
									html += '<td>'+d['* proc_type']+'</td>';
									html += '<td>'+d['* status code']+'</td>';
									return html;
								})
							;
							update.exit()
								.remove()//消す
							;
						})();



						// 統計
						if( !statistics.procTypes[row['* proc_type']] ){ statistics.procTypes[row['* proc_type']] = 0; };
						statistics.procTypes[row['* proc_type']] ++;

						if( !statistics.statusCodes[row['* status code']] ){ statistics.statusCodes[row['* status code']] = 0; };
						statistics.statusCodes[row['* status code']] ++;
						// console.log(statistics);

						(function(){
							var table = d3.select( $tmpTable.find('table').get(0) );
							table.select('tr.cont_procTypes td')
								.data([statistics.procTypes])
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
								.data([statistics.statusCodes])
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
							it.next();
						}, 0 );

					} ,
					function(){
						// alert('complete!');
					}
				);

			});
		}, 10);

	}// this.init();



	return this;
})(px, $);
