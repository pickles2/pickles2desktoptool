var fsx = require('fs-extra');
var gulp = require('gulp');
var sass = require('gulp-sass');//CSSコンパイラ
var plumber = require("gulp-plumber");//コンパイルエラーが起きても watch を抜けないようになる
var concat = require('gulp-concat');//ファイルの結合ツール
var rename = require("gulp-rename");//ファイル名の置き換えを行う
var browserify = require("gulp-browserify");//NodeJSのコードをブラウザ向けコードに変換
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var packageJson = require(__dirname+'/package.json');
var _tasks = [
	'provisional',
	'client-libs',
	'.html',
	'.js',
	'webpack:home',
	'.css',
	'.css.scss'
];

// client-libs (frontend) を処理
gulp.task("client-libs", function() {
	gulp.src(["node_modules/broccoli-html-editor/client/dist/**/*"])
		.pipe(gulp.dest( './app/common/broccoli-html-editor/client/dist/' ))
	;
	gulp.src(["node_modules/broccoli-field-table/dist/**/*"])
		.pipe(gulp.dest( './app/common/broccoli-field-table/dist/' ))
	;
	gulp.src(["node_modules/pickles2-contents-editor/dist/**/*"])
		.pipe(gulp.dest( './app/common/pickles2-contents-editor/dist/' ))
	;
	gulp.src(["node_modules/pickles2-module-editor/dist/**/*"])
		.pipe(gulp.dest( './app/common/pickles2-module-editor/dist/' ))
	;
	gulp.src(["node_modules/px2style/dist/**/*"])
		.pipe(gulp.dest( './app/common/px2style/dist/' ))
	;
	gulp.src(["node_modules/cmd-queue/dist/**/*"])
		.pipe(gulp.dest( './app/common/cmd-queue/dist/' ))
	;
	gulp.src(["node_modules/remote-finder/dist/**/*"])
		.pipe(gulp.dest( './app/common/remote-finder/dist/' ))
	;
	gulp.src(["submodules/gitui79.js/dist/**/*"])
		.pipe(gulp.dest( './app/common/gitui79/dist/' ))
	;
	gulp.src(["submodules/node-git-parser/dist/**/*"])
		.pipe(gulp.dest( './app/common/gitparse79/dist/' ))
	;
	gulp.src(["submodules/ace-builds/src-noconflict/**/*"])
		.pipe(gulp.dest( './app/common/ace-builds/src-noconflict/' ))
	;
});


// src 中の *.html を処理
gulp.task('.html', function(){
	gulp.src(["src/**/*.html","!src/**/*.ignore*","!src/**/*.ignore*/*"])
		.pipe(plumber())
		.pipe(gulp.dest( './app/' ))
	;
});

// src 中の *.js を処理
gulp.task('.js', function(){
	gulp.src(["src/**/*.js","!src/**/*.ignore*","!src/**/*.ignore*/*","!src/**/*.webpack.js"])
		.pipe(plumber())
		.pipe(browserify({}))
		.pipe(gulp.dest( './app/' ))
	;
});

// Webpack: home を処理
gulp.task("webpack:home", function() {
	return webpackStream({
		mode: 'production',
		entry: "./src/fncs/home/index_files/app.webpack.js",
		output: {
			filename: "app.js"
		},
		module:{
			rules:[
				{
					test:/\.html$/,
					use:['html-loader']
				},
				{
					test: /\.(jpg|png)$/,
					use: ['url-loader']
				}
			]
		}
	}, webpack)
		.pipe(plumber())
		.pipe(gulp.dest( './app/fncs/home/index_files/' ))
		.pipe(concat('app.js'))
	;
});


// src 中の *.css.scss を処理
gulp.task('.css.scss', function(){
	gulp.src(["src/**/*.css.scss","!src/**/*.ignore*","!src/**/*.ignore*/*"])
		.pipe(plumber())
		.pipe(sass())
		.pipe(rename({extname: ''}))
		.pipe(gulp.dest( './app/' ))
	;
});

// src 中の *.css を処理
gulp.task('.css', function(){
	gulp.src(["src/**/*.css","!src/**/*.ignore*","!src/**/*.ignore*/*"])
		.pipe(plumber())
		.pipe(gulp.dest( './app/' ))
	;
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


// src 中のすべての拡張子を監視して処理
gulp.task("watch", function() {
	gulp.watch(["src/**/*"], _tasks);
});


// src 中のすべての拡張子を処理(default)
gulp.task("default", _tasks);
