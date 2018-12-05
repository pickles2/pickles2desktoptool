(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Remote Finder
 */
window.RemoteFinder = function($elm, options){
	var _this = this;
	var current_dir = '/';
	options = options || {};
	options.gpiBridge = options.gpiBridge || function(){};
	options.open = options.open || function(pathinfo, callback){
		callback();
	};
	options.mkdir = options.mkdir || function(current_dir, callback){
		var foldername = prompt('Folder name:');
		if( !foldername ){ return; }
		callback( foldername );
		return;
	};
	options.mkfile = options.mkfile || function(current_dir, callback){
		var filename = prompt('File name:');
		if( !filename ){ return; }
		callback( filename );
		return;
	};
	options.rename = options.rename || function(renameFrom, callback){
		var renameTo = prompt('Rename from '+renameFrom+' to:', renameFrom);
		callback( renameFrom, renameTo );
		return;
	};
	options.remove = options.remove || function(path_target, callback){
		if( !confirm('Really?') ){
			return;
		}
		callback();
		return;
	};
	$elm.classList.add('remote-finder');

	/**
	 * サーバーサイドスクリプトに問い合わせる
	 */
	function gpiBridge(input, callback){
		options.gpiBridge(input, callback);
	}

	/**
	 * ファイルを開く
	 */
	this.open = function(path, callback){
		var ext = null;
		try{
			if( path.match(/^[\s\S]*\.([\s\S]+?)$/) ){
				ext = RegExp.$1.toLowerCase();
			}
		}catch(e){}

		var pathinfo = {
			'path': path,
			'ext': ext
		};
		options.open(pathinfo, function(isCompeted){
			if( isCompeted ){
				return;
			}
			callback(isCompeted);
		});
	}

	/**
	 * フォルダを作成する
	 */
	this.mkdir = function(current_dir, callback){
		options.mkdir(current_dir, function(foldername){
			if( !foldername ){
				return;
			}
			gpiBridge(
				{
					'api': 'createNewFolder',
					'path': current_dir+foldername
				},
				function(result){
					if(!result.result){
						alert(result.message);
					}
					callback();
				}
			);
			return;
		});
	}

	/**
	 * ファイルを作成する
	 */
	this.mkfile = function(current_dir, callback){
		options.mkfile(current_dir, function(filename){
			if( !filename ){
				return;
			}
			gpiBridge(
				{
					'api': 'createNewFile',
					'path': current_dir+filename
				},
				function(result){
					if(!result.result){
						alert(result.message);
					}
					callback();
				}
			);
			return;
		});
	}

	/**
	 * ファイルやフォルダの名前を変更する
	 */
	this.rename = function(renameFrom, callback){
		options.rename(renameFrom, function(renameFrom, renameTo){
			if( !renameTo ){ return; }
			if( renameTo == renameFrom ){ return; }
			gpiBridge(
				{
					'api': 'rename',
					'path': renameFrom,
					'options': {
						'to': renameTo
					}
				},
				function(result){
					if(!result.result){
						alert(result.message);
					}
					callback();
				}
			);
			return;
		});
	}

	/**
	 * ファイルやフォルダを削除する
	 */
	this.remove = function(path_target, callback){
		options.remove(path_target, function(){
			gpiBridge(
				{
					'api': 'remove',
					'path': path_target
				},
				function(result){
					if(!result.result){
						alert(result.message);
					}
					callback();
				}
			);
			return;
		});
	}

	/**
	 * カレントディレクトリを得る
	 */
	this.getCurrentDir = function(){
		return current_dir;
	}

	/**
	 * Finderを初期化します。
	 */
	this.init = function( path, options, callback ){
		current_dir = path;
		callback = callback || function(){};
		gpiBridge(
			{
				'api': 'getItemList',
				'path': path,
				'options': options
			},
			function(result){
				if( !result.result ){
					alert( result.message );
					return;
				}
				$elm.innerHTML = '';
				// callback(result);

				var $ulMenu = document.createElement('ul');
				$ulMenu.classList.add('remote-finder__menu');

				// create new file or folder
				var $li = document.createElement('li');
				var $a = document.createElement('a');
				$a.textContent = 'New Folder';
				$a.classList.add('remote-finder__ico-new-folder');
				$a.href = 'javascript:;';
				$a.addEventListener('click', function(){
					_this.mkdir(path, function(){
						_this.init( path );
					});
				});
				$li.append($a);
				$ulMenu.append($li);

				var $li = document.createElement('li');
				var $a = document.createElement('a');
				$a.textContent = 'New File';
				$a.classList.add('remote-finder__ico-new-file');
				$a.href = 'javascript:;';
				$a.addEventListener('click', function(){
					_this.mkfile(path, function(){
						_this.init( path );
					});
				});
				$li.append($a);
				$ulMenu.append($li);

				$elm.append($ulMenu);

				var $ul = document.createElement('ul');
				$ul.classList.add('remote-finder__file-list');

				// parent directory
				if(path != '/' && path){
					var $li = document.createElement('li');
					var $a = document.createElement('a');
					$a.textContent = '../';
					$a.href = 'javascript:;';
					$a.addEventListener('click', function(){
						var tmp_path = path;
						tmp_path = tmp_path.replace(/\/(?:[^\/]*\/?)$/, '/');
						_this.init( tmp_path );
					});
					$li.append($a);
					$ul.append($li);
				}


				// contained file and folders
				for( var idx in result.list ){
					var $li = document.createElement('li');
					var $a = document.createElement('a');
					$a.textContent = result.list[idx].name;
					$a.href = 'javascript:;';
					$a.setAttribute('data-filename', result.list[idx].name);
					$a.setAttribute('data-path', path + result.list[idx].name);
					$submenu = document.createElement('ul');
					$submenu.classList.add('remote-finder__file-list-submenu');
					if(result.list[idx].type == 'dir'){
						$a.textContent += '/';
						$a.classList.add('remote-finder__ico-folder');
						$a.addEventListener('click', function(e){
							var filename = this.getAttribute('data-filename');
							_this.init( path+filename+'/' );
						});

					}else if(result.list[idx].type == 'file'){
						$a.classList.add('remote-finder__ico-file');
						$a.addEventListener('click', function(e){
							var path = this.getAttribute('data-path');
							_this.open( path, function(res){} );
						});
					}

console.log('=-=-=-=-=', result.list[idx]);
					if( !result.list[idx].writable ){
						$a.classList.add('remote-finder__ico-readonly');
					}

					$menu = document.createElement('button');
					$menu.textContent = 'rename';
					$menu.setAttribute('data-filename', result.list[idx].name);
					$menu.addEventListener('click', function(e){
						e.stopPropagation();
						var filename = this.getAttribute('data-filename');
						_this.rename(path+filename, function(){
							_this.init( path );
						});
					});
					$submenuLi = document.createElement('li');
					$submenuLi.append($menu);
					$submenu.append($submenuLi);

					$menu = document.createElement('button');
					$menu.textContent = 'delete';
					$menu.setAttribute('data-filename', result.list[idx].name);
					$menu.addEventListener('click', function(e){
						e.stopPropagation();
						var filename = this.getAttribute('data-filename');
						_this.remove(path+filename, function(){
							_this.init( path );
						});
					});
					$submenuLi = document.createElement('li');
					$submenuLi.append($menu);
					$submenu.append($submenuLi);

					$a.append($submenu);
					$li.append($a);
					$ul.append($li);
				}
				$elm.append($ul);
			}
		);
		return;
	}
}

},{}]},{},[1])