const path = require('path');

const gulp = require('gulp');
const fs = require('fs-extra');
const basetheme = require('@hopin/hugo-base-theme');

const fetheme = require('./frontend-theme/index');

const themeDir = path.join(__dirname, 'frontend', 'themes', 'hopin-base-theme');

/**
 * Themes
 */
gulp.task('base-theme', async () => {
  await fs.remove(themeDir);
  await basetheme.copyTheme(themeDir);
})

gulp.task('frontend-theme', async () => {
  await fs.remove(themeDir);
  await fetheme.copyTheme(themeDir);
})

gulp.task('themes', gulp.parallel(
  'base-theme',
  'frontend-theme',
))