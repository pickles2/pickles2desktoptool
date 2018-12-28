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
	var pathCsv;
	var counter = 0;
	var csvRowTemplate = JSON.stringify({
		'path': '',
		'filesize': ''
	});
	var paths_region_dir = [];
	var paths_ignore_dir = [];

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
			paths_region_dir = parse_paths($main.find('textarea[name=paths_region_dir]').val());
			paths_ignore_dir = parse_paths($main.find('textarea[name=paths_ignore_dir]').val());

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

		_pj.px2proj.query(
			'/?PX=px2dthelper.get.all',
			{
				"output": "json",
				"complete": function(data, code){
					// console.log(data, code);
					var allInfo = JSON.parse(data);
					// console.log(allInfo);

					var regionList = [];
					var ignoreList = [];
					if(allInfo.realpath_docroot){
						regionList.push(realpath2path(allInfo.realpath_docroot));
					}
					if(allInfo.packages.path_composer_root_dir){
						ignoreList.push(realpath2path(allInfo.packages.path_composer_root_dir+'vendor/'));
					}
					if(allInfo.packages.path_npm_root_dir){
						ignoreList.push(realpath2path(allInfo.packages.path_npm_root_dir+'node_modules/'));
					}
					if(allInfo.realpath_homedir){
						ignoreList.push(realpath2path(allInfo.realpath_homedir));
					}
					if(allInfo.realpath_theme_collection_dir){
						ignoreList.push(realpath2path(allInfo.realpath_theme_collection_dir));
					}
					var gitRoot = _pj.get_realpath_git_root();
					if(gitRoot){
						ignoreList.push(realpath2path(gitRoot+'.git/'));
					}

					// console.log(regionList);
					// console.log(ignoreList);
					$main.find('textarea[name=paths_region_dir]').val( regionList.join("\n") );
					$main.find('textarea[name=paths_ignore_dir]').val( ignoreList.join("\n") );
					return;
				}
			}
		);


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
					if(!is_target_path(path+basename)){
						it1.next();
						return;
					}
					var rowTemplate = JSON.parse(csvRowTemplate);
					rowTemplate.path = path+basename;
					counter ++;
					$progress.html(counter);


					_pj.px2proj.query(
						path+basename + '?PX=px2dthelper.get.all',
						{
							"output": "json",
							"complete": function(data, code){
								// console.log(data, code);
								var result = JSON.parse(data);
								console.log(result);

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
							}
						}
					);
					return;
				}else if( px.utils79.is_dir( path_base+path+basename ) ){
					if(!is_target_path(path+basename+'/')){
						it1.next();
						return;
					}
					scanDir( path + basename + '/', function(){
						it1.next();
					} );
					return;
				}
			},
			function(){
				callback();
			}
		);
		return;
	}

	/**
	 * パスの指定を解析する
	 */
	function parse_paths(strPaths){
		var paths = strPaths.split(/[\r\n\,]+/);
		for( var i in paths ){
			paths[i] = px.utils79.trim(paths[i]);
		}
		return paths;
	}

	/**
	 * パスが対象となるディレクトリか調べる
	 */
	function is_target_path(path){
		// 対象範囲に含まれない場合
		for(var i in paths_region_dir){
			if( path.indexOf( paths_region_dir[i] ) === -1 ){
				return false;
			}
		}

		// 除外範囲に含まれる場合
		for(var i in paths_ignore_dir){
			if( path.indexOf( paths_ignore_dir[i] ) === 0 ){
				return false;
			}
		}

		return true;
	}

	/**
	 * 絶対パスから、ローカルパス部分を抽出する
	 */
	function realpath2path( realpath ){
		if( typeof(realpath) !== typeof('') ){
			return realpath;
		}
		var path = px.utils79.normalize_path(realpath);
		var pjPath = px.utils79.normalize_path(_pj.get('path'));
		if( path.indexOf( pjPath ) === 0 ){
			path = path.substr(pjPath.length);
		}
		return path;
	}

	/**
	 * ウィンドウリサイズイベントハンドラ
	 */
	function onWindowResize(){
	}

})( window.parent.px );

},{}]},{},[1])