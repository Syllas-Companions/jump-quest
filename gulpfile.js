var { series, parallel, watch, src, dest } = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();
var compiler = require('webpack');
const del = require('del');
const webpack = require('webpack-stream');

function handleError(err) {
    console.log(err.toString())
}

function clean_dist_folder() {
    return del(['dist/**', '!dist']);
}
// function for deploying local version
function copy_dev_explorer() {
    return src(['./src/dev-explorer/**/*']).pipe(dest('./dist/public'));
}
// async function wp() {
//     return src('./src/index_single_client.js')
//         .pipe(webpack(require('./webpack.single.config.js', compiler))).on('error', handleError)
//         .pipe(dest('dist/public/'))
// };
async function wp_single_front() {
    const config = require('./webpack.single.config.js');
    return src(['./src/index_single_client.js'])
        .pipe(
            webpack(config[0],
                compiler
            )
        ).on('error', handleError)
        .pipe(dest('dist/public/'))
}
async function wp_single_back() {
    const config = require('./webpack.single.config.js');
    return src(['./src/server/single/server.single.js'])
        .pipe(
            webpack(config[1],
                compiler
            )
        ).on('error', handleError)
        .pipe(dest('dist/'))
};
const wp_single = parallel(wp_single_front, wp_single_back)

async function nodemon_single() {
    setTimeout(function () {
        nodemon({
            script: './dist/server.js', //this is where express server is
            watch: ['./dist/server.js'],
            ext: 'js html css', //nodemon watches *.js, *.html and *.css files
            nodeArgs: ['-r', 'esm'],
            env: { 'NODE_ENV': 'development' }
        })
    }, 4000)
};

async function sync_single() {
    setTimeout(function () {
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
        watch(['./dist/**/*']).on("change", function () {
            browserSync.reload();
        })
    }, 4500)
};

// functions for deploying server-client version

async function wp_multi_front() {
    const config = require('./webpack.multi.config.js');
    return src([/*'./src/index_multi_server.js',*/ './src/multi-client/index.js'])
        .pipe(
            webpack(config[0],
                compiler
            )
        ).on('error', handleError)
        .pipe(dest('dist/public/'))
}
async function wp_multi_back() {
    const config = require('./webpack.multi.config.js');
    return src(['./src/server/multi/server.multi.js'])
        .pipe(
            webpack(config[1],
                compiler
            )
        ).on('error', handleError)
        .pipe(dest('dist/'))
};
const wp_multi = parallel(wp_multi_front, wp_multi_back)
async function nodemon_multi() {
    setTimeout(function () {
        nodemon({
            script: './dist/server.js', //this is where express server is
            watch: ['./dist/server.js'],
            nodeArgs: ['-r', 'esm'],
            ext: 'js html css', //nodemon watches *.js, *.html and *.css files
            env: { 'NODE_ENV': 'development' }
        })
    }, 4000)
}
async function sync_multi() {

    setTimeout(function () {
        browserSync.init({
            port: 3001, //this can be any port, it will show our app
            proxy: {
                target: 'http://localhost:3000/',
                ws: true
            },
            reloadDelay: 1000, //Important, otherwise syncing will not work
            notify: false
        });
        watch(['./dist/**/*']).on("change", function () {
            browserSync.reload();
        })
    }, 4500)
};
exports.multi = series(clean_dist_folder, parallel(wp_multi, nodemon_multi, sync_multi));

exports.single = series(clean_dist_folder, copy_dev_explorer, parallel(wp_single, nodemon_single, sync_single));

exports.default = exports.single;


function wp_deploy_front() {
    const config = require('./webpack.multi.config.js');
    return src([/*'./src/index_multi_server.js',*/ './src/multi-client/index.js'])
        .pipe(
            webpack(config[2],
                compiler
            )
        ).on('error', handleError)
        .pipe(dest('dist/public/'))
}
function wp_deploy_back() {
    const config = require('./webpack.multi.config.js');
    return src(['./src/server/multi/server.multi.js'])
        .pipe(
            webpack(config[3],
                compiler
            )
        ).on('error', handleError)
        .pipe(dest('dist/'))
};
async function nodemon_deploy() {
    nodemon({
        script: './dist/server.js', //this is where express server is
        watch: ['./dist/server.js'],
        nodeArgs: ['-r', 'esm'],
        ext: 'js html css', //nodemon watches *.js, *.html and *.css files
        env: { 'NODE_ENV': 'development' }
    })
}
exports.build = series(wp_deploy_front, wp_deploy_back, nodemon_deploy);
exports.start = nodemon_deploy;
