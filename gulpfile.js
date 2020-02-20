// Load Gulp...
const { src, dest, series, parallel, watch }    = require('gulp');
const del         = require('del');
const sass        = require('gulp-sass');
const pug         = require('gulp-pug');
const maps        = require('gulp-sourcemaps');
const uglify      = require('gulp-uglify');
const prefixer    = require('gulp-autoprefixer');
const cleanCSS    = require('gulp-clean-css');
const imagemin    = require('gulp-imagemin');
const rename      = require('gulp-rename');
const browserSync = require('browser-sync');


// Paths
const paths = {
  src: {
    html: './src/**/*.pug',
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
const serve    = './serve/';


// clean dist
function clean() {
    return del(serve);
}

// copy html to dist
function html(){
  return src(paths.src.html)
    .pipe(pug({
        pretty: true
      }))
    .pipe(dest(paths.dist.html));
}

// Compile SASS
function css() {
  return src(paths.src.css)
    .pipe(maps.init())
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(prefixer(['last 4 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: false}))
    .pipe(cleanCSS({level: 2}))
    .pipe(rename({suffix: '.min'}))
    .pipe(maps.write('./'))
    .pipe(dest(paths.dist.css))
    .pipe(browserSync.stream());
}

// Compress (JPEG, PNG, GIF, SVG, JPG)
function images(){
  return src(paths.src.img)
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5})
    ]))
    .pipe(dest(paths.dist.img));
}

// Minify JS
function javascript() {
  return src(paths.src.js)
    .pipe(maps.init())
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(maps.write('./'))
    .pipe(dest(paths.dist.js))
    .pipe(browserSync.stream());
}

// Watch (SASS, JS, and HTML) reload browser on change
function server() {
  browserSync.init({
    server: { baseDir: serve },
    browser: 'chrome',
    notify: false
  });
  watch(paths.src.css, css);
  watch(paths.src.img, images);
  watch(paths.src.js, javascript);
  watch(paths.src.html, html).on('change', browserSync.reload);
}


// Define default task that can be called by just running `gulp` from cli
exports.default = series(clean, parallel(html, css, images, javascript), server)
