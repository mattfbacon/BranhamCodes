const gulp = require('gulp');
const series = gulp.series;
const less = require('gulp-less');
const _nunjucks = require('nunjucks');
const nunjucks = require('gulp-nunjucks');
const data = require('gulp-data');
const fs = require('fs');

function copyStatic(cb) {
	// static files to place at root
	gulp.src('./src/res/static/**').pipe(gulp.dest('./dist/static/'));
	// static files not to place at root
	gulp.src('./src/res/img/**').pipe(gulp.dest('./dist/static/res/img/'));
	gulp.src('./src/res/js/**').pipe(gulp.dest('./dist/static/res/js/'));
	gulp.src('./src/res/style/**.css').pipe(gulp.dest('./dist/static/res/style/'));
	cb();
}

function compileStyles(cb) {
	gulp.src('./src/res/style/**.less').pipe(less({
		paths: [ `${__dirname}/src/res/style/`, `${__dirname}/dist/static/res/style/` ]
	})).pipe(gulp.dest('./dist/static/res/style/'));
	cb();
}

function compilePages(cb) {
	const env = new _nunjucks.Environment(new _nunjucks.FileSystemLoader('./src'), {trimBlocks: true, lstripBlocks: true});

	gulp.src('./src/pages/**.html')
		.pipe(data(({path}) => ({ path: path.replace(__dirname, '').replace('/src/pages', '').replace(/\/?index\.html/, '').replace('.html', '').replace(/^\//, '') })))
		.pipe(nunjucks.compile({}, { env }))
		.pipe(gulp.dest('./dist/static/'));
	gulp.src('./src/dynamicpages/**.html')
		.pipe(data(({path}) => ({ path: path.replace(__dirname, '').replace('/src/dynamicpages', '').replace(/\/?index\.html/, '').replace('.html', '').replace(/^\//, '') })))
		.pipe(nunjucks.compile({}, { env }))
		.pipe(gulp.dest('./dist/dynamic/'));
	cb();
}

exports.default = series(copyStatic, compileStyles, compilePages);
