var gulp = require('gulp');
var fsx = require('fs-extra');
var packageJson = require(__dirname+'/package.json');
var _tasks = [
	'provisional',
	'broccoli-client'
];

// broccoli-client (frontend) を処理
gulp.task("broccoli-client", function() {
	gulp.src(["node_modules/broccoli-html-editor/client/dist/**/*"])
		.pipe(gulp.dest( './app/common/broccoli-html-editor/client/dist/' ))
	;
	gulp.src(["node_modules/broccoli-field-table/dist/**/*"])
		.pipe(gulp.dest( './app/common/broccoli-field-table/dist/' ))
	;
	gulp.src(["node_modules/pickles2-contents-editor/dist/**/*"])
		.pipe(gulp.dest( './app/common/pickles2-contents-editor/dist/' ))
	;
	// gulp.src(["node_modules/broccoli-field-psd/dist/*"])
	// 	.pipe(gulp.dest( './app/common/broccoli-field-psd/dist/' ))
	// ;
});


// 【暫定対応】
gulp.task("provisional", function() {
	// nw-builderがビルドに失敗するようになったので
	// 暫定的に、ビルドが通っていたときのライブラリのバックアップから復元する。
	// gulp.src(["_libs/**/*"])
	// 	.pipe(gulp.dest( './node_modules/' ))
	// ;

	// Windows版ビルドが正常起動しなくなったため追加。
	// broccoli-html-editor に導入した sass のディレクトリ階層が深すぎたのが原因か？
	// fsx.removeSync(__dirname+'/node_modules/broccoli-html-editor/submodules/');
	// fsx.removeSync(__dirname+'/node_modules/broccoli-html-editor/tests/');
	// fsx.removeSync(__dirname+'/node_modules/broccoli-field-table/submodules/');
	// fsx.removeSync(__dirname+'/node_modules/broccoli-field-table/tests/');
	// fsx.removeSync(__dirname+'/node_modules/broccoli-html-editor/node_modules/node-sass/');
});


// src 中のすべての拡張子を処理(default)
gulp.task("default", _tasks);
