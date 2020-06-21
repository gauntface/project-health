const gulp = require('gulp');
const path = require('path');
const htmlmin = require('gulp-htmlmin');
const fs = require('fs-extra');
const browserSync = require('browser-sync').create();
const ham = require('@gauntface/html-asset-manager');
const clean = require('@hopin/wbt-clean');
const hugo = require('@gauntface/hugo-node');
const basetheme = require('@hopin/hugo-base-theme');

const fetheme = require('../frontend-theme/index');

const projectDir = path.join(__dirname);
const themeDir = path.join(__dirname, 'themes');

const desiredHugoVersion = 'v0.72.0';

/**
 * Themes
 */
gulp.task('frontend-themes', gulp.parallel(
  async () => {
    const d = path.join(themeDir, "hopin-base");
    await fs.remove(d);
    await basetheme.copyTheme(d);
  },
  async () => {
    const d = path.join(themeDir, "sidecar");
    await fs.remove(d);
    await fetheme.copyTheme(d);
  },
))

/**
 * Build the whole site
 */
gulp.task('frontend-clean', gulp.series(
  clean.gulpClean([
    path.join(__dirname, 'themes'),
  ]),
))

gulp.task('frontend-html', gulp.series(
  // Run html-asset-manager
  () => {
    return ham.manageAssets({
      config: path.join(__dirname, 'asset-manager.json'),
      output: true,
    });
  },

  // Minify HTML
  () => {
    return gulp.src(path.join(__dirname, 'public', '**', '*.html'))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
      minifyURLs: true,
    }))
    .pipe(gulp.dest(path.join(__dirname, 'public')));
  },
))

gulp.task('frontend-hugo-version', async () => {
  const v = await hugo.version();
  if (v != desiredHugoVersion) {
    throw new Error(`Wrong hugo version; got ${v}, want ${desiredHugoVersion}`)
  }
})

gulp.task('frontend-hugo-build', async () => await hugo.build(projectDir))

gulp.task('frontend-genimgs', () => {
  return ham.generateImages({
    config: path.join(__dirname, 'asset-manager.json'),
    output: true,
  });
})

gulp.task('frontend-verification',() => {
  return gulp.src(path.join(__dirname, 'verification', '**', '*'))
    .pipe(gulp.dest(path.join(__dirname, 'public')));
})

gulp.task('frontend-build-raw', gulp.series(
  'frontend-hugo-version',
  'frontend-clean',
  'frontend-themes',
  'frontend-hugo-build',
));

gulp.task('frontend-build', gulp.series(
  'frontend-build-raw',
  'frontend-genimgs',
  'frontend-html',
  'frontend-verification',
))

/**
 * The following are tasks are helpful for local dev and testing
 */
const flags = ['-D', '--ignoreCache', '--port=1314'];

gulp.task('frontend-hugo-server', async () => {
  await hugo.startServer(projectDir, flags);
});

gulp.task('frontend-restart-server', async () => {
  await hugo.restartServer(projectDir, flags);
});

gulp.task('frontend-dev-serve',
  gulp.parallel(
    'frontend-hugo-server',
  ),
);

gulp.task('frontend-prod-watch-manual', () => {
  const opts = {
    delay: 500,
    ignoreInitial: true,
  };
  return gulp.watch(
    [
      path.posix.join(__dirname, 'archetypes', '**', '*'),
      path.posix.join(__dirname, 'content', '**', '*'),
      path.posix.join(__dirname, 'static', '**', '*'),
      path.posix.join(__dirname, 'vertification', '**', '*'),
    ],
    opts,
    gulp.series('frontend-build', async () => browserSync.reload()),
  );
});

gulp.task('frontend-prod-browser-sync', function() {
  browserSync.init({
      server: {
          baseDir: "./public/",
      }
  });
});

gulp.task('frontend-prod-watch',
  gulp.parallel(
    'frontend-prod-browser-sync',
    'frontend-prod-watch-manual',
  ),
);