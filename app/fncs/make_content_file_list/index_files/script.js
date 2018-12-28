(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.px = window.parent.px;
window.contApp = new (function( px ){
	var _this = this;
	var _pj = px.getCurrentProject();
	var $main,
		$file;
	var $progress = $('<div>');
	var $tbl = $('<table>')
		.addClass('cont_target_list')
		.addClass('table')
		.css({
			'width':'100%'
		});
	var styleResult = {
		'success' : {
			'background-color': '#dfd'
		},
		'failed': {
			'background-color': '#f99'
		}
	};
	// var entryScript = require('path').resolve(_pj.get('path'), _pj.get('entry_script'));
	var pathCsv;
	var counter = 0;
	var csvRowTemplate = JSON.stringify({
		'path': '',
		'filesize': ''
	});

	/**
	 * 初期化
	 */
	$(window).on('load', function(){
		$main = $('#main');
		$main.html( $('#template-form-step1').html() );
		$file = $main.find('input[name=path_csv_save_to]');

		// 選択したCSVファイルをプレビュー表示
		$file.on('change', function(e){
			// $main.find('button').attr("disabled", "disabled");
			$main.find('button').removeAttr("disabled");
		})

		// ファイルリスト作成処理を実行
		$main.find('form').on('submit', function(e){
			$main.find('button').attr("disabled", "disabled");
			var $btnCompolete = $('<button class="px2-btn px2-btn--primary">');
			var $canvasContent = $('<div>');
			$canvasContent.append($progress);
			$tbl.html('');
			$progress.html('').append($tbl);
			counter = 0;

			pathCsv = $file.val();
			if( px.fs.existsSync( pathCsv ) ){
				px.fs.unlinkSync( pathCsv )
			}
			px.fs.appendFileSync( pathCsv, '' );

			// CSV定義行を保存
			var tmpStrRow = '';
			for(var idx in JSON.parse(csvRowTemplate)){
				var cell = idx + "";
				cell = cell.split('"').join('""');
				tmpStrRow += '"'+cell+'"' + ',';
			}
			px.fs.appendFileSync( pathCsv, tmpStrRow + "\n" );


			px.px2style.modal(
				{
					"title": "ファイルリストを作成",
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
					$progress.html(counter);
					scanDir('/', function(){
						$btnCompolete.removeAttr("disabled");
						return;
					});
				}
			);

		});

		$(window).on('resize', function(){
			onWindowResize();
		});
	});

	/**
	 * ディレクトリをスキャンする
	 */
	function scanDir(path, callback){
		var path_base = _pj.get('path');
		var list = px.fs.readdirSync( path_base + path);
		// console.log(list);
		px.it79.ary(
			list,
			function(it1, basename, idx){
				// console.log(idx, path + basename);

				if( px.utils79.is_file( path_base+path+basename ) ){
					var rowTemplate = JSON.parse(csvRowTemplate);
					rowTemplate.path = path+basename;
					counter ++;
					$progress.html(counter);

					var stat = px.fs.statSync(path_base+path+basename);
					rowTemplate.filesize = stat.size;

					// CSV行データを保存
					var tmpStrRow = '';
					for(var idx in rowTemplate){
						var cell = rowTemplate[idx] + "";
						cell = cell.split('"').join('""');
						tmpStrRow += '"'+cell+'"' + ',';
					}
					px.fs.appendFileSync( pathCsv, tmpStrRow + "\n" );

					it1.next();
					return;
				}else if( px.utils79.is_dir( path_base+path+basename ) ){
					scanDir( path + basename + '/', function(){
						it1.next();
					} );
					return;
				}
			},
			function(){
				setTimeout(function(){
					callback();
				}, 10);
			}
		);
		return;
	}

	/**
	 * ウィンドウリサイズイベントハンドラ
	 */
	function onWindowResize(){
	}

})( window.parent.px );

},{}]},{},[1])