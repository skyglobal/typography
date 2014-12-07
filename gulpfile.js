'use strict';

var gulp = require('gulp');
var pkg = require('./package.json');
var skyComponentHelper = require('gulp-sky-component-helper')(gulp, pkg);
var paths = skyComponentHelper.paths;
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
