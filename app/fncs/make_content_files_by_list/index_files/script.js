(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
	var styleResult = {
		'success' : {
			'background-color': '#dfd'
		},
		'failed': {
			'background-color': '#f99'
		}
	};

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
				drawTargetListTable($tablePreview);
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

			drawTargetListTable($progress);

			px.it79.ary(
				loadedCsv,
				function(it1, row, idx){
					console.log(idx, row);

					var nth = Number(idx)+1;
					var editorMode = row[1];
					var command = row[0]+'?PX=px2dthelper.init_content&editor_mode='+encodeURIComponent(row[1]);
					if( editorMode.match(/^\//) ){
						// B列が / から始まる場合、コピー元パスと判断する。
						command = '/?PX=px2dthelper.copy_content&from='+encodeURIComponent(row[1])+'&to='+encodeURIComponent(row[0]);
					}
					console.log(command);

					_pj.px2proj.query(
						command,
						{
							"output": "json",
							"complete": function(data, code){
								console.log(data, code);
								var result = JSON.parse(data);
								var styleName = 'success';
								if( code !== 0 ){
									styleName = 'failed';
								}
								if( !result[0] ){
									styleName = 'failed';
								}

								$('.cont_target_list tr:nth-child('+nth+') td').css(styleResult[styleName]);
								$progress.find('.cont_target_list tr:nth-child('+nth+') td').css(styleResult[styleName]);
								it1.next();
								return;
							}
						}
					);

				},
				function(){
					$btnCompolete.removeAttr("disabled");
				}
			);

		});

		$(window).on('resize', function(){
			onWindowResize();
		});
	});

	/**
	 * プレビューテーブルを描画する
	 */
	function drawTargetListTable( $div ){
		$div = $($div);
		var $tbl = $('<table>')
			.addClass('cont_target_list')
			.addClass('table')
			.css({
				'width':'100%'
			});
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

},{}]},{},[1])