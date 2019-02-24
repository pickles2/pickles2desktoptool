window.px = window.parent.px;
window.contApp = new (function(px){
	var _this = this;
	var utils79 = require('utils79');
	var pj = px.getCurrentProject();
	this.pj = pj;
	var $cont,
		$file,
		$tablePreview;
	var path_px2_move_contents = px.cwd+'/app/common/php/move_contents/move_contents.php';
	var entryScript = require('path').resolve(pj.get('path'), pj.get('entry_script'));

	/**
	 * initialize
	 */
	function init(){
		// 最初の画面を表示

		$cont = $('.contents').html($('#template-main').html());
		$file = $cont.find('input[name=path_csv]');
		$tablePreview = $('.cont_table_preview');

		// 選択したCSVファイルをプレビュー表示
		$file.on('change', function(e){
			$cont.find('button').attr("disabled", "disabled");
			var path_csv = $(this).val();
			try {
				var csvStr = px.fs.readFileSync(path_csv).toString();
			} catch (e) {
				$tablePreview.html('');
				return;
			}

			px.csv.parse(csvStr, function(err, data){
				var $tbl = $('<table>').addClass('def').css({'width':'100%'});
				for(var idx in data){
					var $tr = $('<tr>');
					for(var idx2 in data[idx]){
						$tr.append( $('<td>').text(data[idx][idx2]) );
					}
					$tbl.append($tr);
				}
				$tablePreview.html('').append($tbl);
				$cont.find('button').removeAttr("disabled");
			});
		})

		// コンテンツ移動処理を実行
		$cont.find('form').on('submit', function(e){
			$cont.find('button').attr("disabled", "disabled");
			var path_csv = $file.val();

			var param = {
				php: {
					'bin': px.nodePhpBin.getPath(),
					'ini': px.nodePhpBin.getIniPath(),
					'extension_dir': px.nodePhpBin.getExtensionDir()
				},
				path_csv: path_csv,
				entryScript: entryScript
			};
			var stdout = '',
				stderr = '';

			var $btnCompolete = $('<button class="px2-btn px2-btn--primary">');
			var $canvasContent = $('<div>');
			var $pre = $('<pre>');
			$canvasContent.append($pre);
			px.px2style.modal(
				{
					"title": "コンテンツを移動",
					"body": $canvasContent,
					"buttons": [
						$btnCompolete
							.text('完了')
							.attr("disabled","disabled")
							.on('click', function(){
								$cont.find('button').removeAttr("disabled");
								px.px2style.closeModal(function(){});
							})
					]
				},
				function(){
				}
			);

			px.commandQueue.client.addQueueItem(
				[
					'php',
					path_px2_move_contents,
					utils79.base64_encode(JSON.stringify(param))
				],
				{
					'cdName': 'default',
					'tags': [
						'pj-'+pj.get('id'),
						'project-move-contents'
					],
					'accept': function(queueId){
						// console.log(queueId);
					},
					'open': function(message){
					},
					'stdout': function(message){
						for(var idx in message.data){
							stdout += message.data[idx];
							$pre.text( $pre.text()+message.data[idx] );
						}
					},
					'stderr': function(message){
						for(var idx in message.data){
							stdout += message.data[idx];
							stderr += message.data[idx];
							$pre.text( $pre.text()+message.data[idx] );
						}
					},
					'close': function(message){
						setTimeout(function(){
							var code = message.data;
							$btnCompolete.removeAttr("disabled");
						},500);
						return;
					}
				}
			);

		});
	}


	/**
	 * イベント
	 */
	$(window).on('load', function(){
		init();
	});

})(window.px);
