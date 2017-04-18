/**
 * pageFilter.js
 */
module.exports = function(app, px, pj, $elms, _sitemap){
	var it79 = require('iterate79');
	var _this = this;
	var fileterTimer;
	var _workspaceFilterKeywords='',
		_workspaceFilterListLabel='title';

	/**
	 * フィルター機能の初期化
	 */
	this.init = function( callback ){
		callback = callback || function(){};

		it79.fnc({}, [
			function(it, prop){
				// --------------------------------------
				// ページフィルター機能
				$elms.workspaceFilter.find('input[type=text]')
					.val(_workspaceFilterKeywords)
					.off('keyup')
					.on('keyup', function(e){
						_workspaceFilterKeywords = $elms.workspaceFilter.find('input[type=text]').val();
						// console.log(_workspaceFilterKeywords);
						clearTimeout(fileterTimer);
						fileterTimer = setTimeout(function(){
							_this.filter(function(){});
						}, (e.keyCode==13 ? 0 : 1000)); // EnterKey(=13)なら、即座に再描画を開始
					})
				;
				$elms.workspaceFilter.find('input[type=radio][name=list-label]')
					.off('change')
					.on('change', function(){
						_workspaceFilterListLabel = $elms.workspaceFilter.find('input[type=radio][name=list-label]:checked').val();
						// console.log(_workspaceFilterListLabel);
						clearTimeout(fileterTimer);
						fileterTimer = setTimeout(function(){
							_this.filter(function(){});
						}, 1000);
					})
				;
				it.next(prop);

			} ,
			function(it, prop){
				callback();
			}
		]);
		return;
	}

	/**
	 * フィルター実行
	 */
	this.filter = function( callback ){
		callback = callback || function(){};

		it79.fnc({}, [
			function(it, prop){

				if( _sitemap === null ){
					px.message('[ERROR] サイトマップが正常に読み込まれていません。');
					it.next(prop);
					return;
				}
				var $ul = $('<ul class="listview">');
				// $elms.brosList.text( JSON.stringify(_sitemap) );

				new Promise(function(rlv){rlv();})
					.then(function(){ return new Promise(function(rlv, rjt){
						current = (typeof(current)==typeof('')?current:'');

						$elms.brosList.html('').append($ul);

						function isMatchKeywords(target){
							if( typeof(target) != typeof('') ){
								return false;
							}
							if( target.match(_workspaceFilterKeywords) ){
								return true;
							}
							return false;
						}
						it79.ary(
							_sitemap,
							function( it1, row, idx ){
								new Promise(function(rlv){rlv();})
									.then(function(){ return new Promise(function(rlv, rjt){
										// console.log(_sitemap[idx].title);
										if( _workspaceFilterKeywords.length ){
											if(
												!isMatchKeywords(_sitemap[idx].id) &&
												!isMatchKeywords(_sitemap[idx].path) &&
												!isMatchKeywords(_sitemap[idx].content) &&
												!isMatchKeywords(_sitemap[idx].title) &&
												!isMatchKeywords(_sitemap[idx].title_breadcrumb) &&
												!isMatchKeywords(_sitemap[idx].title_h1) &&
												!isMatchKeywords(_sitemap[idx].title_label) &&
												!isMatchKeywords(_sitemap[idx].title_full)
											){
												// console.log('=> skiped.');
												it1.next();
												return;
											}
										}
										$ul.append( $('<li>')
											.append( $('<a>')
												.text( function(){
													return _sitemap[idx][_workspaceFilterListLabel];
												} )
												.attr( 'href', 'javascript:;' )
												.attr( 'data-id', _sitemap[idx].id )
												.attr( 'data-path', _sitemap[idx].path )
												.attr( 'data-content', _sitemap[idx].content )
												.css({
													// ↓暫定だけど、階層の段をつけた。
													'padding-left': (function(pageInfo){
														if( _workspaceFilterListLabel != 'title' ){ return '1em'; }
														if( !_sitemap[idx].id.length ){ return '1em'; }
														if( !_sitemap[idx].logical_path.length ){ return '2em' }
														var rtn = ( (_sitemap[idx].logical_path.split('>').length + 1) * 1.3)+'em';
														return rtn;
													})(_sitemap[idx]),
													'font-size': '12px'
												})
												.on('click', function(){
													app.goto( $(this).attr('data-path'), {"force":true}, function(){} );
												} )
											)
										);
										it1.next();
									}); })
								;
							},
							function(){
								rlv();
							}
						);
					}); })
					.then(function(){ return new Promise(function(rlv, rjt){
						it.next(prop);
					}); })
				;
			} ,
			function(it, prop){
				callback();
			}
		]);
		return;
	}
}
