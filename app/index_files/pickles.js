new (function($, window){
	window.px = $.px = this;
	var _fs = require('fs');
	var _db = {};
	var _current_project_num = null;
	var _selectedProject = null;
	var $header, $footer, $main, $contents;
	this.utils = require('./common/scripts/_utils.node.js');

	// var findpath = require('nodewebkit').findpath;
	// var nwpath = findpath();
	// console.log(findpath);
	// alert(nwpath);

	/**
	 * DBをロードする
	 */
	this.load = function(){
		// UTODO: スタブ実装
		_db = require('./_stub.json');
		return true;
	}

	/**
	 * DBを保存する
	 */
	this.save = function(){
		// UTODO: 開発中
		alert('データ保存は開発中です。');
		return true;
	}

	/**
	 * アプリケーションを終了する
	 */
	this.exit = function(){
		// if(!confirm('exit?')){return;}
		process.exit();
	}

	/**
	 * プロジェクト一覧を取得する
	 */
	this.getProjectList = function(){
		var rtn = _db.projects;
		return rtn;
	}

	/**
	 * プロジェクトを選択する
	 */
	this.selectProject = function(num){
		if( typeof(num) != typeof(0) ){
			return false;
		}
		_selectedProject = num;
		// alert(num);
		return true;
	}

	/**
	 * プロジェクトの選択を解除する
	 */
	this.deselectProject = function(){
		_selectedProject = null;
		return true;
	}

	/**
	 * 選択中のプロジェクトの情報を得る
	 */
	this.getCurrentProject = function(){
		return new (function(projectInfo){
			this.projectInfo = projectInfo;
			this.get = function(key){
				return this.projectInfo[key];
			}
			this.exec_px2 = function( cmd, fnc ){
			}
			this.exec_git = function( cmd, fnc ){
			}
		})( _db.projects[_selectedProject] );
	}

	/**
	 * サブアプリケーション
	 */
	this.subapp = function(appName){
		var $cont = $('.contents').eq(0);
		if( !appName && typeof(_selectedProject) == typeof(0) ){
			appName = 'home';
		}
		if( appName ){
			$cont
				.html('')
				.append(
					$('<iframe>')
						.attr('src', './app_'+appName+'.html')
				)
			;
			// alert(appName+': 開発中');
		}else{
			var list = this.getProjectList();
			var $ul = $('<ul data-inset="true"></ul>');
			$cont.html('');
			for( var i = 0; i < list.length; i++ ){
				$ul.append(
					$('<li>')
						.append(
							$('<a>')
								.attr('href', 'javascript:;')
								.attr('data-path', list[i].path)
								.attr('data-num', i)
								.click(function(){ if( !px.selectProject( $(this).data('num') ) ){alert('ERROR');return false;} px.subapp(); })
								.text(list[i].name)
							)
				);
			}
			$ul.listview(); // ← jQuery mobile の data-role="listview" を動的に適用
			$cont
				.html('')
				.append(
					$('<div class="container">')
						.append($ul)
				);
		}
	}

	/**
	 * レイアウトをリセット
	 */
	function layoutReset(){
		$('body').css({
			'width':'auto',
			'height':'auto',
			'min-height':0,
			'max-height':10000,
			'overflow':'hidden'
		});
		$contents.css({
			'margin':'0 0 0 0' ,
			'position':'fixed' ,
			'left':0 ,
			'top': $header.height()+25 ,
			'right': 0 ,
			'height': $(window).height() - $header.height() - $footer.height() - 50 ,
		})
	}

	/**
	 * イベントセット
	 */
	process.on( 'exit', function(e){
		// console.log(e);
		// e.preventDefault();
		px.save();
		// return false;
	});
	process.on( 'uncaughtException', function(e){
		alert('uncaughtException;');
		console.log('uncaughtException;', e);
	} )
	$(window).on( 'resize', function(e){
		layoutReset();
	} )


	$(function(){
		// アプリケーション開始
		px.load();

		// DOMスキャン
		$header   = $('.theme_header');
		$contents = $('.contents');
		$footer   = $('.theme_footer');

		layoutReset();
		px.subapp();
	});

	return this;
})(jQuery, window);
