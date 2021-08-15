const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');


module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      title: 'Webpack Example App',
      header: 'Webpack Example Title',
      metaDesc: 'Webpack Example Description',
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body'
    })
  ],
  mode: 'development',
  entry: {
    app: './src/index.js',
    worker: './src/worker.js'
  },
  output: {
    clean: true
  },
  devServer: {
    contentBase: './dist',
    open: true
  }
};