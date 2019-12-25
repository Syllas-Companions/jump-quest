const nodeExternals = require('webpack-node-externals');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

const common = {
  mode: 'development',
  watch: true,
  devtool: 'inline-source-map',
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  }
};

const frontend = {
  entry: './src/index_single_client.js',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'JumpQuest Development (Single)',
    })
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  }
};

const backend = {
  entry: [
    './src/server/single/server.single.js'
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
  Object.assign({}, common, backend)
];
