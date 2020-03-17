const nodeExternals = require('webpack-node-externals');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
var HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const common = {
  mode: 'development',
  watch: true,
  devtool: 'inline-source-map',
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: ['babel-loader']
    }]
  }
};
const common_production = {
    mode: 'production',
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules']
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }]
    }  
}
const frontend = {
  entry: {
    // 'server-view': './src/index_multi_server.js',
    'client-view': './src/multi-client/index.js'
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   chunks: ['server-view'],
    //   title: 'JumpQuest Development Server',
    //   filename: 'server.html'
    // }),
    new HtmlWebpackPlugin({
      chunks: ['client-view'],
      title: 'JumpQuest Development Client',
      filename: 'index.html'
    }),
    new HtmlWebpackTagsPlugin({ tags: ['css/menu.css'], append: true })
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  }
};

const backend = {
  entry: [
    './src/server/multi/server.multi.js'
  ],
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist')
  },
  target: 'node',
  externals: [nodeExternals()]
};

module.exports = [
  Object.assign({}, common, frontend),
  Object.assign({}, common, backend),
  Object.assign({}, common_production, frontend),
  Object.assign({}, common_production, backend),
];
