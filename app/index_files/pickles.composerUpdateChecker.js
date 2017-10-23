/**
 * px.composerUpdateChecker
 */
module.exports = function( px, callback ) {
	callback = callback || function(){};
	var _this = this;
	var utils79 = require('utils79');
	var php = require('phpjs');
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
		// console.log(pj);
		// console.log(status);
		// console.log(composerRootDir);
		// console.log(_this.checkStatus);

		if( !status.isPxStandby ){
			// プロジェクトの準備が不十分なら、チェックしないで返す。
			callback(_this.checkStatus[composerRootDir]);
			return;
		}

		var now = Date.now();
		// console.log(now);
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
				var data = '';

				// console.info('Checking composer update --dry-run');
				px.commandQueue.client.addQueueItem(
					['composer', 'update', '--dry-run'],
					{
						'cdName': composerRootDir, // コマンド実行時のカレントディレクトリ。サーバーサイドのオプション `cd` と突き合わせられる。
						'tags': ['composer-update-check'], // 端末が表示をフィルタリングするために用いるタグ。
						'accept': function(queueId){
							// キュー発行の完了イベントハンドラ
							// 注意: キューに追加した時点で呼ばれます。コマンドの実行完了イベントではありません。
							// 発行したキューのID文字列が返されます。
							console.log(queueId);
						},
						'open': function(message){
							// 登録したキューが実行開始されるときに呼ばれるコールバック
						},
						'stdout': function(message){
							// 登録したコマンドの標準出力を受け取るコールバック
							for(var idx in message.data){
								data += message.data[idx];
							}
						},
						'stderr': function(message){
							// 登録したコマンドの標準エラー出力を受け取るコールバック
							for(var idx in message.data){
								data += message.data[idx];
							}
						},
						'close': function(message){
							// 登録したコマンドが実行完了したときに呼ばれるコールバック
							var code = message.data;
							// var error = undefined;
							// console.log('-- composer update: complete --');
							// console.log(data, error, code);
							var result = php.trim(data);
							var status = 'nothing_todo';
							if( code ){
								status = 'error';
							}else if( result.match( new RegExp( '\- Updating .*? to', 'g' ) ) ){
								status = 'update_found';
							}else if( result.match( new RegExp( 'Nothing to install or update$' ) ) ){
								status = 'nothing_todo';
							}
							_this.checkStatus[composerRootDir].status = status;
							_this.checkStatus[composerRootDir].result = result;

							if( _this.checkStatus[composerRootDir].status == 'update_found' ){
								console.info('composerUpdateChecker: update_found ('+_this.checkStatus[composerRootDir].name+')');
								px.message(_this.checkStatus[composerRootDir].name + ' の composer パッケージのいくつかに、新しいバージョンが見つかりました。 いますぐ更新することをお勧めします。');
							}

							// console.log(_this.checkStatus);
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
