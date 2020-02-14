/**
 * WASABI API Client
 */
module.exports = function(main) {
	const crypto = require('crypto');

	const APP_KEY = main.getAppKey();
	const BUFFER_KEY = APP_KEY.substr( 5, 16 );
	const ENCRYPT_METHOD = "aes-256-cbc";
	const ENCODING = "hex";

	/**
	 * APP_KEY を暗号化
	 */
	function encryptAppKey(raw) {
		let iv = Buffer.from(BUFFER_KEY)
		let cipher = crypto.createCipheriv(ENCRYPT_METHOD, Buffer.from(APP_KEY), iv)
		let encrypted = cipher.update(raw)
		encrypted = Buffer.concat([encrypted, cipher.final()])
		return encrypted.toString(ENCODING)
	}

	/**
	 * APP_KEY を復号化
	 */
	function decryptAppKey(encrypted) {
		let iv = Buffer.from(BUFFER_KEY)
		let encryptedText = Buffer.from(encrypted, ENCODING)
		let decipher = crypto.createDecipheriv(ENCRYPT_METHOD, Buffer.from(APP_KEY), iv)
		let decrypted = decipher.update(encryptedText)
		decrypted = Buffer.concat([decrypted, decipher.final()])
		return decrypted.toString()
	}

	/**
	 * wasabiUrl を正規化
	 */
	function normalizeWasabiUrl(wasabiUrl){
		wasabiUrl = wasabiUrl.replace(/\/*$/si, '/');
		return wasabiUrl;
	}

	/**
	 * WASABI URL から、登録された API_KEY を取得する
	 */
	function getApiKeyByWasabiUrl(wasabiUrl, callback){
		callback = callback || function(){};
		var baseDir = main.px2dtLDA.getAppDataDir('px2dt');
		wasabiUrl = normalizeWasabiUrl(wasabiUrl);
		if( !main.utils79.is_file( baseDir+'/wasabi.json' ) ){
			callback(false);
			return;
		}
		var API_KEY = false;
		try{
			var file = main.fs.readFileSync(baseDir+'/wasabi.json');
			var json = JSON.parse( file );
			if( json && json.apikeys && json.apikeys[wasabiUrl] ){
				API_KEY = decryptAppKey(json.apikeys[wasabiUrl]);
			}
		}catch(e){
			console.error(e);
			callback(false);
			return;
		}
		callback(API_KEY);
		return;
	}

	/**
	 * API_KEY を WASABI URL と関連付けて保存する
	 */
	function updateApiKeyByWasabiUrl(wasabiUrl, apiKey, callback){
		callback = callback || function(){};
		var baseDir = main.px2dtLDA.getAppDataDir('px2dt');
		wasabiUrl = normalizeWasabiUrl(wasabiUrl);
		try{
			var file = '{}';
			if( main.utils79.is_file( baseDir+'/wasabi.json' ) ){
				file = main.fs.readFileSync(baseDir+'/wasabi.json');
			}
			var json = JSON.parse( file );
			json = json || {};
			json.apikeys = json.apikeys || {};
			json.apikeys[wasabiUrl] = encryptAppKey(apiKey);
			main.fs.writeFileSync( baseDir+'/wasabi.json', JSON.stringify( json, null, 1 ) );
		}catch(e){
			console.error(e);
			callback(false);
			return;
		}
		callback(true);
		return;
	}


	/**
	 * プロジェクトエージェント
	 */
	function projectAgent(pj){
		var _this = this;
		this.pj = pj;
		this.projectId = false;
		this.wasabiUrl = false;
		var conf = pj.getConfig();
		try{
			if( conf && conf.plugins && conf.plugins.wasabi ){
				this.projectId = conf.plugins.wasabi.project_id;
				this.wasabiUrl = conf.plugins.wasabi.url;
				this.wasabiUrl = normalizeWasabiUrl(this.wasabiUrl);
			}
		}catch(e){
			console.error(e);
		}

		/**
		 * このプロジェクトが WASABI の情報を持っているか調べる
		 */
		this.hasWasabi = function(){
			if (!this.projectId || !this.wasabiUrl) {
				return false;
			}
			return true;
		}

		/**
		 * APP_KEY を取得する
		 */
		this.getAppKey = function(callback){
			callback = callback || function(){};
			getApiKeyByWasabiUrl(this.wasabiUrl, function(result){
				callback(result);
			});
			return;
		}

		/**
		 * APP_KEY を更新する
		 */
		this.updateAppKey = function(appKey, callback){
			callback = callback || function(){};
			updateApiKeyByWasabiUrl(this.wasabiUrl, appKey, function(result){
				callback(result);
			});
			return;
		}

		/**
		 * WASABI API を呼び出す
		 */
		this.callWasabiApi = function(api, options, callback){
			api = api || '';
			options = options || {};
			callback = callback || function(){};
			_this.getAppKey(function(apiKey){
				var request = require('request');
				var options = {
					uri: _this.wasabiUrl+'api/'+api+'?apikey='+encodeURIComponent(apiKey),
					headers: {
						"Content-type": "application/x-www-form-urlencoded",
					},
					form: {
						"apikey": apiKey
					},
					insecure: true
				};
				// console.log(options);

				request.get(options, function(error, response, body){
					// console.log(error, response, body);
					var result = false;
					try{
						result = JSON.parse(body);
					}catch(e){}
					callback(result);
				});
			});
			return;
		}

		/**
		 * WASABIユーザー情報を取得する
		 */
		this.getUserInfo = function(callback){
			this.callWasabiApi(
				'user_info',
				{},
				callback
			);
			return;
		}
	}

	/**
	 * プロジェクトエージェントを生成
	 */
	this.createProjectAgent = function(pj){
		return new projectAgent(pj);
	}
};
