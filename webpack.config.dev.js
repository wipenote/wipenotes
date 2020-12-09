const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { join } = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader')
const dotenv = require('dotenv')
const CopyPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  mode: 'development',
  cache: false,
  optimization: {
    splitChunks: false
  },
  watchOptions: {
    poll: true,
    ignored: /node_modules/
  },
  context: join(__dirname, 'frontend'),
  entry: {
    styles: join(__dirname, 'frontend/styles/index.scss'),
    main: join(__dirname, 'frontend/js/index.js'),
  },
  
  output: {
    filename: '[name].js',
    path: join(__dirname, 'server/public/bundles')
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: 'babel-loader'
      },
      {
        test: /\.(png|jpg|gif|svg|woff|woff2|eot|ttf|otf)$/,
        loader: 'file-loader',
        exclude: /node_modules/,
        options: {
          publicPath: '/assets/bundles',
        }
      },
      {
        test: /\.scss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.vue$/,
        use: 'vue-loader'
      }
    ]
  },
  
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
    }
  },
  
  watch: true,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        ...(dotenv.config().parsed || {}),
        ...(process.env || {}),
      })
    }),
    new CleanWebpackPlugin(), new MiniCssExtractPlugin({ filename: '[name].css' }),
    new webpack.ProvidePlugin({
      'window.jQuery'    : 'jquery',
      'window.$'         : 'jquery',
      'jQuery'           : 'jquery',
      '$'                : 'jquery',
      "window.amplitude": "amplitude"
    }),
    new VueLoaderPlugin(),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1, // disable creating additional chunks
    })
  ]
};

