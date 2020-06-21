const path = require('path');

const gulp = require('gulp');
const fs = require('fs-extra');
const basetheme = require('@hopin/hugo-base-theme');

require('./frontend-theme/gulp-tasks');
require('./frontend/gulp-tasks');

/**
 * Primary Tasks
 */
gulp.task('build', gulp.series(
  'frontend-theme-build',
  'frontend-build',
))

gulp.task('develop', gulp.parallel(
  'frontend-theme-watch',
  'frontend-serve',
))