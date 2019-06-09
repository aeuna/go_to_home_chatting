import gulp from 'gulp';
import babel from 'gulp-babel';
import nodemon from 'gulp-nodemon';

export function watch() {
  gulp.watch('server/');
  gulp.watch('client/');
}

export function start (done) {
  nodemon({
    script: 'server/testserver.js'
  , ext: 'js html css'
  , env: { 'NODE_ENV': 'development' }
  , done: done
  , tasks: ['browserify']
  })
}

const build = gulp.parallel(watch, start);
exports.default = build;