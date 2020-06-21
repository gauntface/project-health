const path = require('path');

const gulp = require('gulp');


require('./frontend-theme/gulp-tasks');
require('./frontend/gulp-tasks');

/**
 * Primary Tasks
 */
gulp.task('build', gulp.series(
  'frontend-theme-build',
  'frontend-build',
))

gulp.task('develop', gulp.series(
  'frontend-theme-build-dev',
  'frontend-build',
  gulp.parallel(
    'frontend-theme-watch',
    'frontend-dev-serve',
  ),
))