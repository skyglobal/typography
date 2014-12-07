'use strict';

var gulp = require('gulp');
var pkg = require('./package.json');
var skyComponentHelper = require('gulp-sky-component-helper')(gulp, pkg);
var paths = skyComponentHelper.paths;
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');


gulp.task('copy-icons', function() {
    return gulp.src(['./bower_components/bskyb-skycons/dist/fonts/*.*'])
        .pipe(gulp.dest(paths.site['fonts']));
});

gulp.task('pre-build', function(cb){
    return runSequence('copy-icons', cb);
});