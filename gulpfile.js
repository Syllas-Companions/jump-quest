var { series, parallel, watch, src, dest } = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();
var compiler = require('webpack');
const del = require('del');
const webpack = require('webpack-stream');

function handleError(err) {
    console.log(err.toString())
}

function clean_dist_folder(){
    return del(['dist/**', '!dist']);
}
// function for deploying local version
async function wp() {
    return src('./src/index_single_client.js')
        .pipe(webpack(require('./webpack.single.config.js', compiler))).on('error', handleError)
        .pipe(dest('dist/'))
};

async function gulp_nodemon() {
    nodemon({
        script: './server.single.js', //this is where express server is
        watch: ['server.single.js'],
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
    watch(['./server.single.js']).on("change", function () {
        browserSync.reload();
    });
    watch(['./src/**/*.*']).on("change", function () {
        browserSync.reload();
    })
};

// functions for deploying server-client version

async function wp_multi() {
    return src('./src/index_multi_client.js')
        .pipe(webpack(require('./webpack.multi.config.js', compiler))).on('error', handleError)
        .pipe(dest('dist/'))
};
async function gulp_nodemon_multi(){
    nodemon({
        script: './server.multi.js', //this is where express server is
        watch: ['server.multi.js'],
        nodeArgs: ['-r','esm'],
        ext: 'js html css', //nodemon watches *.js, *.html and *.css files
        env: { 'NODE_ENV': 'development' }
    })
}
async function sync_multi() {
    browserSync.init({
        port: 3001, //this can be any port, it will show our app
        proxy: {
            target: 'http://localhost:3000/',
            ws: true
        }, 
        reloadDelay: 1000, //Important, otherwise syncing will not work
        notify: false
    });
    watch(['./server.multi.js']).on("change", function () {
        browserSync.reload();
    });
    watch(['./src/**/*.*']).on("change", function () {
        browserSync.reload();
    })
};

exports.multi = series(clean_dist_folder,parallel(wp_multi,gulp_nodemon_multi, sync_multi));
exports.single = series(clean_dist_folder,parallel(wp, gulp_nodemon, sync));

exports.default = exports.single;