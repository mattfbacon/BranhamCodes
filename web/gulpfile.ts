'use strict';

const _nunjucks = require('nunjucks');
const cleancss = require('gulp-clean-css');
import data = require('gulp-data');
import debug = require('gulp-debug');
import gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
import less = require('gulp-less');
import nunjucks = require('gulp-nunjucks');
const sourcemap = require('gulp-sourcemaps');
import svgmin = require('gulp-svgmin');
import ts = require('gulp-typescript');
import uglify = require('gulp-uglify');

const copy_static = (cb: () => any) => {
	gulp.src('./src/static/**').pipe(gulp.dest('./dist/static/'));
	cb();
};

const resources = (cb: () => any) => {
	// svg: minify with svgmin
	gulp.src('./src/res/**/*.svg')
		.pipe(debug({ 'title': 'svg', }))
		.pipe(svgmin())
		.pipe(gulp.dest('./dist/static/res/'));
	// js: uglify
	gulp.src([ './src/res/**/*.js', '!./src/res/**/*.min.js', ])
		.pipe(debug({ 'title': 'js', }))
		.pipe(sourcemap.init())
		.pipe(uglify())
		.pipe(sourcemap.write('.'))
		.pipe(gulp.dest('./dist/static/res/'));
	// ts: transpile and uglify
	gulp.src('./src/res/**/*.ts')
		.pipe(debug({ 'title': 'ts', }))
		.pipe(sourcemap.init())
		.pipe(ts())
		.pipe(uglify())
		.pipe(sourcemap.write('.'))
		.pipe(gulp.dest('./dist/static/res/'));
	// css: minify
	gulp.src([ './src/res/**/*.css', '!./src/res/**/*.min.css', ])
		.pipe(debug({ 'title': 'css', }))
		.pipe(sourcemap.init())
		.pipe(cleancss())
		.pipe(sourcemap.write('.'))
		.pipe(gulp.dest('./dist/static/res/'));
	// less: transpile and minify
	gulp.src('./src/res/**/*.less')
		.pipe(debug({ 'title': 'less', }))
		.pipe(sourcemap.init())
		.pipe(less({
			'paths': [ `${__dirname}/src/res/`, ],
		}))
		.pipe(cleancss())
		.pipe(sourcemap.write('.'))
		.pipe(gulp.dest('./dist/static/res/'));
	// all others, including pre-minified CSS and JS: just copy
	gulp.src([ './src/res/**/!(*.less|*.css|*.ts|*.js|*.svg)', './src/res/**/*.min.css', './src/res/**/*.min.js']).pipe(debug({ 'title': 'default', })).pipe(gulp.dest('./dist/static/res/'));
	cb();
};

const compile_pages = (cb: () => any) => {
	const env = new _nunjucks.Environment(new _nunjucks.FileSystemLoader('./src'), { 'lstripBlocks': true, 'trimBlocks': true, });

	gulp.src('./src/pages/**/*.html')
		.pipe(data(({ 'path': fpath, }) => ({ 'path': fpath.replace(__dirname, '').replace('/src/pages', '').replace(/\/?index\.html/, '').replace('.html', '').replace(/^\//, ''), })))
		.pipe(nunjucks.compile({}, { env, }))
		.pipe(sourcemap.init())
		.pipe(htmlmin())
		.pipe(sourcemap.write('.'))
		.pipe(gulp.dest('./dist/static/'));
	gulp.src('./src/dynamicpages/**/*.html')
		.pipe(data(({ 'path': fpath, }) => ({ 'path': fpath.replace(__dirname, '').replace('/src/dynamicpages', '').replace(/\/?index\.html/, '').replace('.html', '').replace(/^\//, ''), })))
		.pipe(nunjucks.compile({}, { env, }))
		.pipe(htmlmin()) // no sourcemap since it won't match when the template is compiled
		.pipe(gulp.dest('./dist/dynamic/'));
	cb();
};

exports.default = gulp.parallel(copy_static, resources, compile_pages);
