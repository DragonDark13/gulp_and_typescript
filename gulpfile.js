const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
const watchify = require("watchify");
const fancy_log = require("fancy-log");
const sourcemaps = require("gulp-sourcemaps");
const terser = require("terser");
const buffer = require("vinyl-buffer");


const paths = {
    pages: ["src/*.html"],
};

const {series, parallel} = require('gulp');

gulp.task("copy-html", function () {
    return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

const watchedBrowserify = watchify(
    browserify({
        basedir: ".",
        debug: true,
        entries: ["src/main.ts"],
        cache: {},
        packageCache: {},
    }).plugin(tsify)
);

function bundle() {
    return watchedBrowserify
        .bundle()
        .on("error", fancy_log)
        .pipe(source("bundle.js"))
        .pipe(gulp.dest("dist"));
}

gulp.task(
    "default",
    gulp.series(gulp.parallel("copy-html"), function () {
        return browserify({
            basedir: ".",
            debug: true,
            entries: ["src/main.ts"],
            cache: {},
            packageCache: {},
        })
            .plugin(tsify)
            .transform("babelify", {
                presets: ["es2015"],
                extensions: [".ts"],
            })
            .bundle()
            .pipe(source("bundle.js"))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write("./"))
            .pipe(gulp.dest("dist"));
    })
);

watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", fancy_log);
