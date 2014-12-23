'use strict';

var gulp = require('gulp');
var componentHelper = require('gulp-component-helper')(gulp);
var paths = componentHelper.paths;
var runSequence = require('run-sequence');

gulp.task('copy-fonts', function() {
    return gulp.src([paths.source['fonts'] + '/*.*'])
        .pipe(gulp.dest(paths.dist['fonts']));
});

gulp.task('pre-build', function(cb){
    return runSequence('copy-fonts', cb);
});