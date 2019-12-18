// Load Gulp...
var gulp        = require('gulp');
var del         = require('del');
var sass        = require('gulp-sass');
var maps        = require('gulp-sourcemaps');
var uglify      = require('gulp-uglify');
var prefixer    = require('gulp-autoprefixer');
var cleanCSS    = require('gulp-clean-css');
var imagemin    = require('gulp-imagemin');
var rename      = require('gulp-rename');
var browserSync = require('browser-sync');


// Paths
var paths = {
  src: {
    html: './src/*.html',
    css: './src/sass/**/*.sass',
    img: './src/img/**',
    js: './src/js/**/*.js'
  },
  dist: {
    html: './serve/',
    css:  './serve/css',
    img:  './serve/img',
    js: './serve/js'

  }
}
var serve    = './serve/';


// clean dist
function clean() {
    return del(serve);
}

// copy html to dist
function html(){
  return gulp.src(paths.src.html)
    .pipe(gulp.dest(paths.dist.html));
}

// Compile SASS
function css() {
  return gulp.src(paths.src.css)
    .pipe(maps.init())
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(prefixer(['last 4 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: false}))
    .pipe(cleanCSS({level: 2}))
    .pipe(rename({suffix: '.min'}))
    .pipe(maps.write('./'))
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browserSync.stream());
}

// Compress (JPEG, PNG, GIF, SVG, JPG)
function images(){
  return gulp.src(paths.src.img)
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5})
    ]))
    .pipe(gulp.dest(paths.dist.img));
}

// Minify JS
function javascript() {
  return gulp.src(paths.src.js)
    .pipe(maps.init())
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(maps.write('./'))
    .pipe(gulp.dest(paths.dist.js))
    .pipe(browserSync.stream());
}

// Watch (SASS, JS, and HTML) reload browser on change
function server() {
  browserSync.init({
    server: { baseDir: serve },
    browser: 'chrome',
    notify: false
  });
  gulp.watch(paths.src.css, css);
  gulp.watch(paths.src.img, images);
  gulp.watch(paths.src.js, javascript);
  gulp.watch(paths.src.html, html).on('change', browserSync.reload);
}


// Define default task that can be called by just running `gulp` from cli
var build = gulp.series(clean, gulp.parallel(html, css, images, javascript, server));
gulp.task('default', build);