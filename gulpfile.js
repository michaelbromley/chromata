var gulp = require('gulp');
var inject = require('gulp-inject');
var to5 = require('gulp-6to5');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var wrap = require('gulp-wrap');

gulp.task('scripts', function () {
    return gulp.src([
        '!**/vendor/*.js',
        './src/**/*.js'
    ])
        .pipe(to5({
            modules: 'system'
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('index', ['scripts'], function() {

    var target = gulp.src('./src/index.html');

    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src([
        'scripts/init.js',
        '**/*.css'
    ], {read: false, cwd: './src/'});

    return target
       // .pipe(inject(sources, { addRootSlash: false }))
        .pipe(gulp.dest('./build'));
});

gulp.task('assets', function() {
    return gulp.src([
        './src/vendor*/*.js',
        './src/assets*/**/*.*'
    ])
        .pipe(gulp.dest('./build'));
});

gulp.task('watch', ['index', 'assets'], function () {

    gulp.watch('./src/**/*.js', ['scripts', 'dist']);
    gulp.watch('./src/index.html', ['index']);

});

/**
 * Create a stand-alone bundle and minified version for distribution
 */
gulp.task('dist', function() {
    return gulp.src([
        './src/scripts/!(init)*.js'
    ])
        .pipe(concat('chromata.js'))
        .pipe(to5({
            modules: 'ignore'
        }))
        .pipe(wrap('(function(window, undefined){\n\n<%= contents %>\n})(window);'))
        .pipe(gulp.dest('./dist'))
        .pipe(uglify())
        .pipe(rename('chromata.min.js'))
        .pipe(gulp.dest('./dist'));
});


gulp.task('default', ['index', 'dist']);