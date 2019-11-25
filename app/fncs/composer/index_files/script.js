(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.px = window.parent.px;

var pj = px.getCurrentProject();
var fsEx = px.fsEx;
var cont_realpathComposerRoot = pj.get('path');
var CodeMirrorInstans;
var it79 = px.it79;
var utils79 = px.utils79;
if( px.utils.isDirectory( pj.get_realpath_composer_root() ) ){
	cont_realpathComposerRoot = pj.get_realpath_composer_root();
}
var cont_realpathComposerJson = cont_realpathComposerRoot+'composer.json';
var cont_realpathVendorDir = cont_realpathComposerRoot+'vendor/';

window.cont_init = function(){
	// bootstrap
	$('*').tooltip();

	$('.cont-show-advanced a').on('click', function(e){
		$('.nav>.cont-show-advanced').hide();
		$('.nav>li.cont-advanced').css({"display":"block"});
	});

	px.fs.readFile(cont_realpathComposerJson, function(err, src){
		if(err){
			px.message(err);
		}
		$('.cont_edit_composer_json textarea').val(src);

		$('a.cont_edit[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			// console.log( e.target ); // newly activated tab
			// console.log( e.relatedTarget ); // previous active tab
			if( !CodeMirrorInstans ){
				CodeMirrorInstans = window.textEditor.attachTextEditor(
					$('.cont_edit_composer_json textarea').get(0),
					'json',
					{
						save: function(){ cont_save_composerJson(); }
					}
				);
			}
			cont_resizeEvent();

		});

		$(window).resize(cont_resizeEvent);
		cont_resizeEvent();
	});


}

/**
 * composer self-update
 */
window.cont_selfupdate_conposer = function(btn){
	$(btn).attr('disabled', 'disabled');
	$('#cont_maintenance .cont_console').html('');

	pj.execComposer(
		[
			'self-update'
		] ,
		{
			success: function(data){
				$('#cont_maintenance .cont_console').text(
					$('#cont_maintenance .cont_console').text() + data
				);
			} ,
			error: function(data){
				$('#cont_maintenance .cont_console').text(
					$('#cont_maintenance .cont_console').text() + data
				);
			} ,
			complete: function(data, error, code){
				$('#cont_maintenance .cont_console').text(
					$('#cont_maintenance .cont_console').text() + "\n\n" + 'composer self-update 完了しました。'
				);
				$(btn).removeAttr('disabled');
				px.message( 'composer self-update 完了しました。' );
			}
		}
	);
}

/**
 * composer update
 */
window.cont_update_proj = function(btn){
	$(btn).attr('disabled', 'disabled');
	$('#cont_update input[name=composer-force-update]').attr('disabled', 'disabled');
	var isForceUpdate = $('#cont_update input[name=composer-force-update]').prop("checked");

	$('#cont_update .cont_console').html('');

	it79.fnc({}, [
		function(it1){
			// 強制的更新の処理
			if( !isForceUpdate ){
				it1.next();
				return;
			}
			if(!utils79.is_dir(cont_realpathVendorDir)){
				it1.next();
				return;
			}
			$('#cont_update .cont_console').text(
				$('#cont_update .cont_console').text() + 'Removing `vendor` directory...'
			);
			// vendorフォルダを削除する
			fsEx.remove(cont_realpathVendorDir, function(){
				$('#cont_update .cont_console').text(
					$('#cont_update .cont_console').text() + 'done'+"\n"
				);
				it1.next();
			});
			return;
		},
		function(it1){
			// composer update
			pj.execComposer(
				['update', '--no-interaction'],
				{
					success: function(data){
						$('#cont_update .cont_console').text(
							$('#cont_update .cont_console').text() + data
						);
					} ,
					error: function(data){
						$('#cont_update .cont_console').text(
							$('#cont_update .cont_console').text() + data
						);
					} ,
					complete: function(data, error, code){
						// $('.cont_console').text(
						// 	$('.cont_console').text() + code
						// );
						$(btn).removeAttr('disabled');
						$('#cont_update input[name=composer-force-update]').removeAttr('disabled');
						px.composerInstallChecker.clearStatus( pj, function(){
							if(code){
								alert(
									'composer が正常に終了しませんでした。(Exit Status Code: '+code+')'+"\n"
									+'出力内容を参考に `composer.json` の内容を確認して再度お試しください。'+"\n"
									+'または、「強制的に更新する」オプションを有効にして再実行すると解決する場合があります。'+"\n"
								);
							}
							$('#cont_update .cont_console').text(
								$('#cont_update .cont_console').text() + "\n\n" + 'composer update 完了しました。'
							);
							px.message( 'composer update 完了しました。' );
						} );
					}
				}
			);
			return;
		}
	]);
}

/**
 * composer install
 */
window.cont_install_proj = function(btn){
	$(btn).attr('disabled', 'disabled');
	$('#cont_install input[name=composer-force-install]').attr('disabled', 'disabled');
	var isForceInstall = $('#cont_install input[name=composer-force-install]').prop("checked");

	$('#cont_install .cont_console').html('');

	it79.fnc({}, [
		function(it1){
			// 強制的更新の処理
			if( !isForceInstall ){
				it1.next();
				return;
			}
			if(!utils79.is_dir(cont_realpathVendorDir)){
				it1.next();
				return;
			}
			$('#cont_install .cont_console').text(
				$('#cont_install .cont_console').text() + 'Removing `vendor` directory...'
			);
			// vendorフォルダを削除する
			fsEx.remove(cont_realpathVendorDir, function(){
				$('#cont_install .cont_console').text(
					$('#cont_install .cont_console').text() + 'done'+"\n"
				);
				it1.next();
			});
			return;
		},
		function(it1){
			// composer install
			pj.execComposer(
				['install', '--no-interaction'],
				{
					success: function(data){
						$('#cont_install .cont_console').text(
							$('#cont_install .cont_console').text() + data
						);
					} ,
					error: function(data){
						$('#cont_install .cont_console').text(
							$('#cont_install .cont_console').text() + data
						);
					} ,
					complete: function(data, error, code){
						// $('.cont_console').text(
						// 	$('.cont_console').text() + code
						// );
						$(btn).removeAttr('disabled');
						$('#cont_install input[name=composer-force-install]').removeAttr('disabled');
						px.composerInstallChecker.clearStatus( pj, function(){
							if(code){
								alert(
									'composer が正常に終了しませんでした。(Exit Status Code: '+code+')'+"\n"
									+'出力内容を参考に `composer.json` の内容を確認して再度お試しください。'+"\n"
									+'または、「クリーンインストールする」オプションを有効にして再実行すると解決する場合があります。'+"\n"
								);
							}
							$('#cont_install .cont_console').text(
								$('#cont_install .cont_console').text() + "\n\n" + 'composer install 完了しました。'
							);
							px.message( 'composer install 完了しました。' );
						} );
					}
				}
			);
			return;
		}
	]);
}

/**
 * composer show
 */
window.cont_show_packages = function(btn, opt){
	$(btn).attr('disabled', 'disabled');
	$('#cont_status .cont_console').html('');

	pj.execComposer(
		['show', opt],
		{
			success: function(data){
				$('#cont_status .cont_console').text(
					$('#cont_status .cont_console').text() + data
				);
			} ,
			error: function(data){
				$('#cont_status .cont_console').text(
					$('#cont_status .cont_console').text() + data
				);
			} ,
			complete: function(data, error, code){
				$(btn).removeAttr('disabled');
				px.message( 'composer show 完了しました。' );
			}
		}
	);
}

/**
 * composer.json の編集を保存
 */
window.cont_save_composerJson = function(form){
	var $form = $('form.cont_edit_composer_json');
	var src = $form.find('textarea').val();

	src = JSON.parse( JSON.stringify( src ) );
	px.fs.writeFile( cont_realpathComposerJson, src, {encoding:'utf8'}, function(err){
		if(err){
			px.message( 'composer.json の保存に失敗しました。' );
		}else{
			px.message( 'composer.json を保存しました。 $ composer update を実行してください。' );
		}
	} );
}

/**
 * window resize
 */
window.cont_resizeEvent = function(){
	var cmHeight = $(window).innerHeight() - $('#cont_edit button').offset().top - $('#cont_edit button').outerHeight() -20;
	if( cmHeight < 120 ){ cmHeight = 'auto'; }
	$('.cont_edit_composer_json .CodeMirror')
		.css({
			'height': cmHeight
		})
	;
}

$(function(){
	cont_init();
});

},{}]},{},[1])