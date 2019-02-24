(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * git-parser.js
 */
module.exports = function(fncCallGit){
	var _this = this;
	fncCallGit = fncCallGit || function(callback){
		callback = callback || function(){}
		callback(0, '');
	}
	this.git = function(cmdAry, callback){
		fncCallGit(cmdAry, function(stdout){
			var rtn = {
				'stdout': stdout
			};
			if(cmdAry[0] == 'init'){
				_this.init(rtn, function(result){
					callback(result);
				});
			}else if(cmdAry[0] == 'status'){
				_this.status(rtn, function(result){
					callback(result);
				});
			}else{
				callback(rtn);
			}
			return;
		});
	}
}
module.exports.prototype.init = require('./parsers/init.js');
module.exports.prototype.status = require('./parsers/status.js');

},{"./parsers/init.js":2,"./parsers/status.js":3}],2:[function(require,module,exports){
/**
 * git init
 */
module.exports = function(result, callback){
	callback = callback || function(){}
    // TODO: 解析処理を書く
	callback(result);
}

},{}],3:[function(require,module,exports){
/**
 * git status
 */
module.exports = function(result, callback){
	callback = callback || function(){}
    // TODO: 解析処理を書く
	callback(result);
}

},{}],4:[function(require,module,exports){
window.GitParser = require('../libs/main.js');

},{"../libs/main.js":1}]},{},[4])