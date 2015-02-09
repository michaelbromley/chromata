var gulp = require('gulp');
var inject = require('gulp-inject');
var to5 = require('gulp-6to5');
var annotate = require('gulp-ng-annotate');

gulp.task('scripts', function () {
    return gulp.src([
        '!**/vendor/*.js',
        './src/**/*.js'
    ])
        .pipe(to5({
            modules: 'system'
        }))
        .pipe(annotate())
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
        .pipe(inject(sources, { addRootSlash: false }))
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

    gulp.watch('./src/**/*.js', ['scripts']);
    gulp.watch('./src/index.html', ['index']);

});


gulp.task('default', ['index']);