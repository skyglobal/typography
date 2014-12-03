'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var deploy = require("gulp-gh-pages");
var bower = require('gulp-bower');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var run = require("gulp-run");
var runSequence = require('run-sequence');
var pkg = require('./package.json');
var aws_s3 = require('gulp-aws-s3').setup({bucket: process.env.AWS_SKYGLOBAL_BUCKET});

var flatten = require('gulp-flatten');

var path = require("path");

var paths = {
    "site": './_site',
    "demo": {
        html: "./demo",
        sass: './demo/scss',
        images: './demo/images'
    },
    source: {
        sass: './src/scss',
        fonts: './src/fonts'
    },
    dist : {
        css: "./dist/css",
        js: "./dist/js",
        fonts: './dist/fonts'
    }
};

gulp.task('sass', function() {
    browserSync.notify('<span style="color: grey">Running:</span> Sass compiling');
    return gulp.src([ paths.demo['sass'] + '/**/*.scss', paths.source['sass'] + '/**/*.scss'])
        .pipe(sass({
            includePaths: ['bower_components', paths.source['fonts']],
            outputStyle: 'nested'
        }))
        .pipe(autoprefixer())
        .pipe(gulp.dest(paths.site + '/css'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('bower', function() {
    return bower()
});

gulp.task('gh-pages', function () {
    gulp.src(paths.site + "/**/*")
        .pipe(deploy({
            cacheDir: '.tmp'
        })).pipe(gulp.dest('/tmp/gh-pages'));
});

gulp.task('run-release-bower', function(cb) {
    run('git tag -a v'+ pkg.version +' -m "release v' + pkg.version +' for bower"; git push origin master v'+ pkg.version).exec();
});

gulp.task('browserSync', function() {
    browserSync({
        port: 3456,
        server: {
            baseDir: paths.site
        }
    });
});

gulp.task('watch', function() {
    gulp.watch(paths.site, ['create-site']);
    gulp.watch([paths.source['sass'] + '/**/*',paths.demo['sass']], ['sass']);
});

gulp.task('create-site', function() {
    gulp.src([paths.demo['html'] + '/index.html',
            paths.demo['html'] +'/_includes/*.html'])
        .pipe(concat('index.html'))
        .pipe(gulp.dest(paths.site));
    gulp.src(paths.demo['images'] + '/**/*')
        .pipe(gulp.dest(paths.site + '/images'));
});


gulp.task('create-bower-dist', function() {
    gulp.src([paths.site + '/css/typography.css'])
        .pipe(gulp.dest(paths.dist['css']));

    gulp.src([paths.source['fonts'] + '/**/*'])
        .pipe(flatten())
        .pipe(gulp.dest(paths.dist['fonts']));

});

gulp.task('copy-fonts', function() {
    return gulp.src([
            paths.source['fonts'] + '/*.svg',
            paths.source['fonts'] + '/*.eot',
            paths.source['fonts'] + '/*.ttf'])
        .pipe(gulp.dest(paths.site + '/fonts/'));
});

function awsUpload(fileType){
    var path = 'components/' + pkg.name.replace('bskyb-','') + '/' + pkg.version + '/' + fileType + '/';
    return gulp.src(paths.dist[fileType] + '/**/*')
        .pipe(aws_s3.upload({ path: path } ));

}

gulp.task('aws', function() {
    awsUpload('css');
    awsUpload('js');
    awsUpload('fonts');
});

gulp.task('build', function(cb) {
    return runSequence(['copy-fonts','create-site','bower'],['sass'],['create-bower-dist'],
        cb
    );
});

gulp.task('serve', function(callback) {
    return runSequence(
        'build',
        ['browserSync', 'watch'],
        callback
    );
});

gulp.task('release:bower', function(cb) {
    return runSequence(
        'build',
        'run-release-bower',
        cb
    );
});

gulp.task('release:gh-pages', function(cb) {
    return runSequence(
        'build',
        'gh-pages',
        cb
    );
});


gulp.task('release:cdn', function(cb) {
    return runSequence(
        'build',
        'aws',
        cb
    );
});