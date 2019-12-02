var { series, parallel, watch, src, dest } = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();
var compiler = require('webpack');
const webpack = require('webpack-stream');

function handleError(err) {
    console.log(err.toString())
    this.emit('end');
}

function wp() {
    return src('./src/index.js')
        .pipe(webpack(require('./webpack.config.js', compiler))).on('error', handleError)
        .pipe(dest('dist/'));
};
async function gulp_nodemon() {
    nodemon({
        script: './server.js', //this is where my express server is
        watch: ['server.js'],
        ext: 'js html css', //nodemon watches *.js, *.html and *.css files
        env: { 'NODE_ENV': 'development' }
    })
};

async function sync() {
    browserSync.init({
        port: 3001, //this can be any port, it will show our app
        proxy: {
            target: 'http://localhost:3000/',
            ws: true
        }, //this is the port where express server works
        // ui: { port: 3003 }, //UI, can be any port
        reloadDelay: 1000, //Important, otherwise syncing will not work
        notify: false
    });
    watch(['./server.js']).on("change", function () {
        browserSync.reload();
    });
    watch(['./src/*.*']).on("change", function () {
        wp();
        browserSync.reload();
    })
};

exports.default = series(wp, parallel(gulp_nodemon, sync));