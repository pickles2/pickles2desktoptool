var gulp = require('gulp');
var packageJson = require(__dirname+'/package.json');
var _tasks = [
	'broccoli-client'
];

// broccoli-client (frontend) を処理
gulp.task("broccoli-client", function() {
	gulp.src(["node_modules/broccoli-html-editor/client/dist/*"])
		.pipe(gulp.dest( './app/common/broccoli-html-editor/client/dist/' ))
	;
	// gulp.src(["node_modules/broccoli-html-editor--table-field/dist/*"])
	// 	.pipe(gulp.dest( './dist/libs/broccoli-html-editor--table-field/dist/' ))
	// ;
	// gulp.src(["node_modules/broccoli-psd-field/dist/*"])
	// 	.pipe(gulp.dest( './dist/libs/broccoli-psd-field/dist/' ))
	// ;
});

// src 中のすべての拡張子を処理(default)
gulp.task("default", _tasks);
