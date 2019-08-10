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
		fncCallGit(cmdAry, function(code, stdout){
			_this.parse(cmdAry, code, stdout, callback);
			return;
		});
	}
	this.parse = function(cmdAry, code, stdout, callback){
		var rtn = {
			'code': code,
			'stdout': stdout,
			'errors': []
		};
		if( stdout.match(/^fatal\:\ ([\s\S]*)$/g) ){
			rtn.errors.push( RegExp.$1 );
			callback(rtn);
			return;
		}

		if( rtn.stdout.match(/^git\:\ (\'([\s\S]*?)\'\ is\ not\ a\ git\ command\.)/g) ){
			rtn.errors.push(RegExp.$1);
		}else if(rtn.code !== 0){
			rtn.errors.push(rtn.stdout);
		}

		switch( cmdAry[0] ){
			case 'init':
			case 'config':
			case 'status':
			case 'add':
			case 'commit':
			case 'branch':
			case 'checkout':
			case 'log':
			case 'show':
				_this[cmdAry[0]](cmdAry, rtn, function(result){
					callback(result);
				});
				break;
			default:
				callback(rtn);
				break;
		}
		return;
	}
}

module.exports.prototype.init = require('./parsers/init.js');
module.exports.prototype.config = require('./parsers/config.js');
module.exports.prototype.status = require('./parsers/status.js');
module.exports.prototype.add = require('./parsers/add.js');
module.exports.prototype.commit = require('./parsers/commit.js');
module.exports.prototype.branch = require('./parsers/branch.js');
module.exports.prototype.checkout = require('./parsers/checkout.js');
module.exports.prototype.log = require('./parsers/log.js');
module.exports.prototype.show = require('./parsers/show.js');

/**
 * コマンド配列を解析する
 */
module.exports.prototype.parseCmdAry = function(cmdAry){
	var rtn = {
		"options": {},
		"args": []
	};
	cmdAry.forEach(function(cmdLine, idx){
		if( !idx ){return;}
		// console.log(cmdLine, idx);
		if( cmdLine.match(/^\-\-?([a-zA-Z\-/.]+?)(?:\=([a-zA-Z\-/.]+))?$/) ){
			var key = RegExp.$1;
			var val = RegExp.$2;
			rtn.options[key] = true;
			if( val ){
				rtn.options[key] = val;
			}
			return;
		}
		rtn.args.push(cmdLine);
	});
	return rtn;
}

},{"./parsers/add.js":2,"./parsers/branch.js":3,"./parsers/checkout.js":4,"./parsers/commit.js":5,"./parsers/config.js":6,"./parsers/init.js":7,"./parsers/log.js":8,"./parsers/show.js":9,"./parsers/status.js":10}],2:[function(require,module,exports){
/**
 * git add
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	if( !result.stdout.length ){
		callback(result);
		return;
	}
	result.added = [];
	result.removed = [];

	lines.forEach(function(line){

		if( line.match(/^add\ \'([\s\S]*)\'$/g) ){
			result.added.push( RegExp.$1 );
		}else if( line.match(/^remove\ \'([\s\S]*)\'$/g) ){
			result.removed.push( RegExp.$1 );
		}
	});

	// console.log(result);
	callback(result);
}

},{}],3:[function(require,module,exports){
/**
 * git branch
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	result.branches = [];

	lines.forEach(function(line){
		if( !line.length ){
			return;
		}

		if( line.match(/^(\*?)[\s]*([\S]*)$/g) ){
			var branchName = RegExp.$2;
			result.branches.push(branchName);
			if( RegExp.$1 ){
				result.currentBranchName = branchName;
			}
		}

	});

	callback(result);
}

},{}],4:[function(require,module,exports){
/**
 * git checkout
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	result.result = false;
	result.created = false;

	lines.forEach(function(line){
		if( !line.length ){
			return;
		}

		if( line.match(/^Switched\ to\ (a\ new\ )?branch \'([\S]*?)\'$/g) ){
			var branchName = RegExp.$2;
			result.currentBranchName = branchName;
			if( RegExp.$1 ){
				result.created = true;
			}
			result.result = true;
		}

	});

	callback(result);
}

},{}],5:[function(require,module,exports){
/**
 * git commit
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
    // TODO: 解析処理を書く
	callback(result);
}

},{}],6:[function(require,module,exports){
/**
 * git config
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
	// console.log(lines);
	var mode = null;

	var parsedCmd = this.parseCmdAry(cmdAry);
	// console.log(parsedCmd);

	result.property = parsedCmd.args[0];
	if( parsedCmd.args.length == 1 ){
		mode = 'get';
	}else{
		mode = 'set';
	}

	if( mode == 'get' ){
		switch( result.property ){
			case 'user.name':
				result.name = lines[0];break;
			case 'user.email':
				result.email = lines[0];break;
		}
	}

	// console.log(result);
	callback(result);
}

},{}],7:[function(require,module,exports){
/**
 * git init
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
    // TODO: 解析処理を書く
	callback(result);
}

},{}],8:[function(require,module,exports){
/**
 * git log
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var _this = this;
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
    result.logs = [];
    var tmpLog = {},
		tmpLogs = [];
	// console.log(lines);

	var parsedCmd = this.parseCmdAry(cmdAry);
	// console.log(parsedCmd);

	if( parsedCmd.options.pretty ){
		// TODO: 未対応
	}else if( parsedCmd.options.stat ){
		// TODO: 未対応
	}else{
		lines.forEach(function(line){

			if( line.match(/^commit\ ([0-9a-fA-F]+)$/) ){
				if( tmpLog.commit ){
					tmpLogs.push(tmpLog);
				}
				tmpLog = {};
				tmpLog.commit = RegExp.$1;
				tmpLog.stdout = [];
				tmpLog.stdout.push(line);
				phase = 'log_header';
				return;
			}
			tmpLog.stdout.push(line);
			return;
		});
		if( tmpLog.commit ){
			tmpLogs.push(tmpLog);
		}

		tmpLogs.forEach(function(logStdout){
			var fres = {};
			fres.code = 0;
			fres.stdout = logStdout.stdout.join("\n");
			fres.errors = [];
			_this.show(
				['show', logStdout.commit],
				fres,
				function(res){
					delete(res.code);
					delete(res.stdout);
					delete(res.errors);
					result.logs.push(res);
				}
			);
		});
	}

	// console.log(result);
	callback(result);
}

},{}],9:[function(require,module,exports){
/**
 * git show
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
    var tmpLines=[], tmpLog;
	// console.log(lines);

	var parsedCmd = this.parseCmdAry(cmdAry);
	// console.log(parsedCmd);

	if( parsedCmd.options.pretty || parsedCmd.options.format ){
		// TODO: 未対応
	}else if( parsedCmd.options.oneline ){
		// TODO: 未対応
	}else if( parsedCmd.options['show-notes'] || parsedCmd.options['no-standard-notes'] || parsedCmd.options['standard-notes'] ){
		// TODO: 未対応
	}else if( parsedCmd.options['show-signature'] ){
		// TODO: 未対応
	}else{
		lines.forEach(function(line){

			if( line.match(/^commit\ ([0-9a-fA-F]+)$/) ){
				tmpLog = {};
				result.commit = RegExp.$1;
				result.message = '';
				tmpLines=[];
				phase = 'log_header';
				return;

			}else if(phase == 'log_header'){
				if( !line.length ){
					phase = 'log_commit_message';
					result = parseLogHeaders(result, tmpLines);
					tmpLines = [];
					return;
				}
				tmpLines.push(line);
				return;

			}else if(phase == 'log_commit_message'){
				if( !line.length ){
					phase = 'log_commit_files';
					tmpLines = [];
					return;
				}
				if( line.match(/^\s{4}([\s\S]*?)$/g) ){
					result.message += RegExp.$1 + "\n";
					return;
				}
				return;

			}else if(phase == 'log_commit_files'){
				if( !line.length ){
					phase = null;
					result.files = parseLogFiles(tmpLines);
					return;
				}
				tmpLines.push(line);
				return;

			}
		});
	}

	// console.log(result);
	callback(result);
}

/**
 * header部分を解析
 */
function parseLogHeaders(tmpLog, lines){
	lines.forEach(function(line){
		if( line.match(/^Author\:\s+([\s\S]+?)\s+\<([\S]+?)\>$/g) ){
			tmpLog.author = RegExp.$1;
			tmpLog.email = RegExp.$2;
			return;
		}
		if( line.match(/^Date\:\s+([\s\S]+?)$/g) ){
			tmpLog.date = RegExp.$1;
			return;
		}
	});
	return tmpLog;
}

/**
 * ファイルのdiff部分を解析
 */
function parseLogFiles(lines){
	var phase = null;
	var rtn = [];
	var tmpFileDiff = {};
	// console.log(lines);

	lines.forEach(function(line){
		if( line.match(/^diff\ \-\-git\ a\/([\s\S]*?) b\/([\s\S]*?)$/) ){
			if( tmpFileDiff.filename ){
				rtn.push(tmpFileDiff);
				tmpFileDiff = {};
			}
			tmpFileDiff.filenameBefore = RegExp.$1;
			tmpFileDiff.filename = RegExp.$2;
			tmpFileDiff.type = 'changed';
			tmpFileDiff.isRenamed = (tmpFileDiff.filenameBefore !== tmpFileDiff.filename);
			tmpFileDiff.similarity = false;
			tmpFileDiff.index = {};
			// tmpFileDiff.diff = [];
			phase = 'diff_header';
			return;

		}else if(phase == 'diff_header'){
			if( line.match(/^new\ file\ mode\ ([0-9]+)$/g) ){
				tmpFileDiff.type = 'added';
				tmpFileDiff.mode = RegExp.$1;
				return;
			}
			if( line.match(/^deleted\ file\ mode\ ([0-9]+)$/g) ){
				tmpFileDiff.type = 'deleted';
				tmpFileDiff.mode = RegExp.$1;
				return;
			}
			if( line.match(/^similarity\ index\ ([1-9][0-9]*\%)$/g) ){
				tmpFileDiff.similarity = RegExp.$1;
				return;
			}
			if( line.match(/^index\ ([0-9a-zA-Z]+)\.\.([0-9a-zA-Z]+)(?:\ ([0-9]+))?$/g) ){
				tmpFileDiff.index.from = RegExp.$1;
				tmpFileDiff.index.to = RegExp.$2;
				if( RegExp.$3 ){
					tmpFileDiff.mode = RegExp.$3;
				}
				return;
			}
		}
	});
	if( tmpFileDiff.filename ){
		rtn.push(tmpFileDiff);
		tmpFileDiff = {};
	}
	return rtn;
}

},{}],10:[function(require,module,exports){
/**
 * git status
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
	result.staged = {};
	result.staged.untracked = [];
	result.staged.modified = [];
	result.staged.deleted = [];
	result.notStaged = {};
	result.notStaged.untracked = [];
	result.notStaged.modified = [];
	result.notStaged.deleted = [];
	// console.log(lines);

	lines.forEach(function(line){

		// --------------------------------------
		// Branch Name
		if( !phase ){
			if( line.match(/^On\ branch\ ([\s\S]*)$/g) ){
				result.currentBranchName = RegExp.$1;
			}
		}

		// --------------------------------------
		// Untracked files
		if( line == 'Untracked files:' ){
			phase = 'untracked_files_standby';
			return;
		}else if(phase == 'untracked_files_standby'){
			if( !line.length ){
				phase = 'untracked_files';
				return;
			}
		}else if(phase == 'untracked_files'){
			if( !line.length ){
				phase = null;
				return;
			}
			if( line.match(/^[\s]*([\s\S]*?)$/g) ){
				result.notStaged.untracked.push( RegExp.$1 );
				return;
			}
		}

		// --------------------------------------
		// Changes not staged for commit
		if( line == 'Changes not staged for commit:' ){
			phase = 'changes_not_staged_for_commit_standby';
			return;
		}else if(phase == 'changes_not_staged_for_commit_standby'){
			if( !line.length ){
				phase = 'changes_not_staged_for_commit';
				return;
			}
		}else if(phase == 'changes_not_staged_for_commit'){
			if( !line.length ){
				phase = null;
				return;
			}
			if( line.match(/^[\s]*modified\:[\s]+([\s\S]*?)$/g) ){
				result.notStaged.modified.push( RegExp.$1 );
				return;
			}else if( line.match(/^[\s]*deleted\:[\s]+([\s\S]*?)$/g) ){
				result.notStaged.deleted.push( RegExp.$1 );
				return;
			}
		}

		// --------------------------------------
		// Staged
		if( line == 'Changes to be committed:' ){
			phase = 'changes_to_be_committed_standby';
			return;
		}else if(phase == 'changes_to_be_committed_standby'){
			if( !line.length ){
				phase = 'changes_to_be_committed';
				return;
			}
		}else if(phase == 'changes_to_be_committed'){
			if( !line.length ){
				phase = null;
				return;
			}
			if( line.match(/^[\s]*new\ file\:[\s]+([\s\S]*?)$/g) ){
				result.staged.untracked.push( RegExp.$1 );
				return;
			}else if( line.match(/^[\s]*modified\:[\s]+([\s\S]*?)$/g) ){
				result.staged.modified.push( RegExp.$1 );
				return;
			}else if( line.match(/^[\s]*deleted\:[\s]+([\s\S]*?)$/g) ){
				result.staged.deleted.push( RegExp.$1 );
				return;
			}
		}
	});

	// console.log(result);
	callback(result);
}

},{}],11:[function(require,module,exports){
window.GitParse79 = require('../libs/main.js');

},{"../libs/main.js":1}]},{},[11])