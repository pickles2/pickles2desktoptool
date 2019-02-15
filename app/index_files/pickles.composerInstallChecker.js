/**
 * px.composerInstallChecker
 */
module.exports = function( px, callback ) {
	callback = callback || function(){};
	var _this = this;
	var utils79 = require('utils79');
	this.px = px;
	this.checkStatus = {};

	function init(callback){
		setTimeout(function(){
			callback();
		}, 0);
	}

	/**
	 * composerパッケージの更新状況をチェックした結果を取得する
	 */
	this.getStatus = function( pj, callback ){
		callback = callback || function(){};
		var composerRootDir = pj.get_realpath_composer_root();
		setTimeout(function(){
			callback( _this.checkStatus[composerRootDir] );
		}, 0);
		return;
	}

	/**
	 * composerパッケージの更新状況をチェックした結果を取得する
	 */
	this.clearStatus = function( pj, callback ){
		callback = callback || function(){};
		var composerRootDir = pj.get_realpath_composer_root();
		_this.checkStatus[composerRootDir] = undefined;
		delete(_this.checkStatus[composerRootDir]);
		setTimeout(function(){
			callback( true );
		}, 0);
		return;
	}

	/**
	 * composerパッケージの更新状況をチェックする
	 */
	this.check = function( pj, callback ){
		callback = callback || function(){};

		var composerRootDir = pj.get_realpath_composer_root();
		var status = pj.status();

		if( !status.isPxStandby ){
			// プロジェクトの準備が不十分なら、チェックしないで返す。
			callback(_this.checkStatus[composerRootDir]);
			return;
		}

		var now = Date.now();
		var interval = 1*60*60*1000; // 1時間以内にチェックしてたら再チェックしない
		if( _this.checkStatus[composerRootDir] ){
			if( _this.checkStatus[composerRootDir].status == 'checking' ){
				// チェックの実行中
				if( _this.checkStatus[composerRootDir].datetime > now - interval ){
					// 1時間以内に発行した checkingなら信用し、再チェックしない
					// ※1時間以上たっていてまだ checking なら、処理が完了していない可能性がある。再チェックする。
					callback( _this.checkStatus[composerRootDir] );
					return;
				}
			}else if( _this.checkStatus[composerRootDir].datetime > now - interval ){
				// 1時間以内にチェックしてたら再チェックしない
				callback( _this.checkStatus[composerRootDir] );
				return;
			}
		}

		// composerRootDir パスをキーに、ステータス管理オブジェクトに領域を確保する。
		_this.checkStatus[composerRootDir] = {
			'name': pj.get('name'),
			'path': pj.get('path'),
			'composerRootDir': composerRootDir,
			'datetime': now,
			'status': 'checking'
		};

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){

				// $ composer install --dry-run
				// この処理は、cmd-queue の行列待ちをしません。
				// これはユーザーの認識の外で自動的に実行される処理で、
				// かつ長い時間を要する場合があるコマンドです。
				// ユーザーが知らない処理のために、ユーザーが実行したい処理が待ち状態になるのは使い勝手が悪いので、
				// 行列待ちはしないことにしました。
				px.execComposer(
					['install', '--dry-run'],
					{
						'cwd': composerRootDir,
						'success': function(data){
							console.log('composer install: success');
							console.log(data);
						},
						'error': function(data){
							console.log('composer install: error');
							console.log(data);
						},
						'complete': function(data, error, code){
							var result = utils79.trim(data);
							console.log(result);
							var status = 'nothing_todo';
							if( code ){
								status = 'error';
							}else if( result.match( new RegExp( '\- (?:Updating) .*? to', 'g' ) ) ){
								status = 'update_found';
							}else if( result.match( new RegExp( '\- (?:Installing) .*?', 'g' ) ) ){
								status = 'update_found';
							}else if( result.match( new RegExp( 'Nothing to install or update$' ) ) ){
								status = 'nothing_todo';
							}
							_this.checkStatus[composerRootDir].status = status;
							_this.checkStatus[composerRootDir].result = result;

							if( _this.checkStatus[composerRootDir].status == 'update_found' ){
								console.info('composerInstallChecker: update_found ('+_this.checkStatus[composerRootDir].name+')');
								px.message(_this.checkStatus[composerRootDir].name + ' の composer パッケージのいくつかに、新しいバージョンが見つかりました。 composer install を実行してください。');
							}
							callback( _this.checkStatus[composerRootDir] );
							return;
						}
					}
				);

			}); })
		;
		return;
	}

	init(callback);
	return this;
};
