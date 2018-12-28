window.px = window.parent.px;
window.contApp = new (function( px ){
	var _this = this;
	var _pj = px.getCurrentProject();
	var $main,
		$file,
		$tablePreview;
	var $elms = {};
	$elms.editor = $('<div>');
	var loadedCsv = [];

	/**
	 * 初期化
	 */
	$(window).on('load', function(){
		$main = $('#main');
		$main.html( $('#template-form-step1').html() );
		$tablePreview = $('.cont_table_preview');
		$file = $main.find('input[name=path_csv]');

		// 選択したCSVファイルをプレビュー表示
		$file.on('change', function(e){
			$main.find('button').attr("disabled", "disabled");
			var path_csv = $(this).val();
			try {
				var csvStr = px.fs.readFileSync(path_csv).toString();
			} catch (e) {
				$tablePreview.html('');
				return;
			}

			px.csv.parse(csvStr, function(err, data){
				if(err){
					alert('CSVの読み込みでエラーが発生しました。');
					return;
				}
				loadedCsv = data;
				drawPreviewTable($tablePreview);
				$main.find('button').removeAttr("disabled");
			});
		})

		// コンテンツ移動処理を実行
		$main.find('form').on('submit', function(e){
			$main.find('button').attr("disabled", "disabled");
			var $btnCompolete = $('<button class="px2-btn px2-btn--primary">');
			var $canvasContent = $('<div>');
			var $progress = $('<div>');
			$canvasContent.append($progress);
			px.px2style.modal(
				{
					"title": "コンテンツを作成",
					"body": $canvasContent,
					"width": 600,
					"buttons": [
						$btnCompolete
							.text('完了')
							.attr("disabled","disabled")
							.on('click', function(){
								$main.find('button').removeAttr("disabled");
								px.px2style.closeModal(function(){});
							})
					]
				},
				function(){
				}
			);

			drawPreviewTable($progress);

			// _pj.px2proj.query(
			// 	'/?PX=px2dthelper.check_editor_mode&path='+encodeURIComponent(pagePath), {
			// 		"output": "json",
			// 		"complete": function(data, code){
			// 			// console.log(data, code);
			// 			var rtn = JSON.parse(data);
			// 			callback(rtn);
			// 			return;
			// 		}
			// 	}
			// );

			px.it79.ary(
				loadedCsv,
				function(it1, row, idx){
					setTimeout(function(){
						console.log(idx, row);
						it1.next();
					}, 500);
				},
				function(){
					$btnCompolete.removeAttr("disabled");
				}
			);



			// px.commandQueue.client.addQueueItem(
			// 	[
			// 		'php',
			// 		path_px2_move_contents,
			// 		utils79.base64_encode(JSON.stringify(param))
			// 	],
			// 	{
			// 		'cdName': 'default',
			// 		'tags': [
			// 			'pj-'+pj.get('id'),
			// 			'project-move-contents'
			// 		],
			// 		'accept': function(queueId){
			// 			// console.log(queueId);
			// 		},
			// 		'open': function(message){
			// 		},
			// 		'stdout': function(message){
			// 			for(var idx in message.data){
			// 				stdout += message.data[idx];
			// 				$progress.text( $progress.text()+message.data[idx] );
			// 			}
			// 		},
			// 		'stderr': function(message){
			// 			for(var idx in message.data){
			// 				stdout += message.data[idx];
			// 				stderr += message.data[idx];
			// 				$progress.text( $progress.text()+message.data[idx] );
			// 			}
			// 		},
			// 		'close': function(message){
			// 			setTimeout(function(){
			// 				var code = message.data;
			// 				$btnCompolete.removeAttr("disabled");
			// 			},500);
			// 			return;
			// 		}
			// 	}
			// );

		});

		$(window).on('resize', function(){
			onWindowResize();
		});
	});

	/**
	 * プレビューテーブルを描画する
	 */
	function drawPreviewTable( $div ){
		$div = $($div);
		var $tbl = $('<table>').addClass('table').css({'width':'100%'});
		for(var idx in loadedCsv){
			var $tr = $('<tr>');
			for(var idx2 in loadedCsv[idx]){
				$tr.append( $('<td>').text(loadedCsv[idx][idx2]) );
			}
			$tbl.append($tr);
		}
		$div.html('').append($tbl);
		return true;
	}

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
