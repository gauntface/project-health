const gulp = require('gulp');
const path = require('path');

const tsBrowser = require('@hopin/wbt-ts-browser');
const css = require('@hopin/wbt-css');
const clean = require('@hopin/wbt-clean');

/**
 * Build theme package
 */
const themeSrc = path.join(__dirname, 'src');
const themeDst = path.join(__dirname, 'build');
const copyExts = [
  'toml',
  'json',
  'html',
  'svg',
  'jpg',
  'jpeg',
  'gif',
  'png',
  'js',
  'woff',
  'woff2',
];


function setEnv(e) {
  const f = async () => {
    process.env.ENV = e
  }
  f.displayName = 'set-env'
  return f
}

gulp.task('frontend-theme-clean', gulp.series(
  clean.gulpClean([
    themeDst,
  ]),
))

gulp.task('frontend-theme-typescript', gulp.series(
  tsBrowser.gulpBuild('sidecar.theme', {
    src: themeSrc,
    dst: themeDst,
  })
))

gulp.task('frontend-theme-css', async () => {
  return css.build({
    src: themeSrc,
    dst: themeDst,
  }, {
    importPaths: [themeSrc],
    preserve: process.env.ENV == 'dev',
    cssVariablesDir: path.join(__dirname, 'src', 'static', 'css', 'variables'),
  });
})

gulp.task('frontend-theme-copy', () => {
  const glob = path.join(themeSrc, `**/*.{${copyExts.join(',')}}`);
  return gulp.src(glob)
    .pipe(gulp.dest(themeDst));
})

gulp.task('frontend-theme-perform-build', gulp.series(
  'frontend-theme-clean',
  gulp.parallel(
    'frontend-theme-typescript',
    'frontend-theme-css',
    'frontend-theme-copy',
  ),
))

gulp.task('frontend-theme-build-dev', gulp.series(
  setEnv('dev'),
  'frontend-theme-perform-build',
))

gulp.task('frontend-theme-build', gulp.series(
  setEnv('prod'),
  'frontend-theme-perform-build',
))



const watchTasks = [
  {task: 'frontend-theme-css', ext: 'css'},
  {task: 'frontend-theme-typescript', ext: 'ts'},
  {task: 'frontend-theme-copy', ext: `{${copyExts.join(',')}}`},
];
const watchTaskNames = [];
for (const wt of watchTasks) {
  const taskName = `frontend-theme-watch-theme-${wt.task}`;
  gulp.task(taskName, () => {
    const opts = {
      delay: 500,
      ignoreInitial: true,
    };
    return gulp.watch(
      [path.posix.join(themeSrc, '**', `*.${wt.ext}`)],
      opts,
      gulp.series(wt.task),
    );
  });
  watchTaskNames.push(taskName)
}

gulp.task('frontend-theme-watch', gulp.series(
  gulp.parallel(...watchTaskNames),
));