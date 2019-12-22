const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  watch: true,
  entry: {
    'server': './src/index_multi_server.js',
    'client': './src/index_multi_client.js'
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['server'],
      title: 'JumpQuest Development Server',
      filename: 'server.html'
    }),
    new HtmlWebpackPlugin({
      chunks: ['client'],
      title: 'JumpQuest Development Client',
      filename: 'index.html'
    })
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  }
};