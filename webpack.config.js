'use strict';

var path = require('path');

module.exports = {
  devServer: {
    contentBase: path.resolve(__dirname)
  },

  entry: './js/main.js',

  output: {
    filename: './out/main.js',
    path: path.resolve(__dirname),
    sourceMapFilename: '[file].map'
  },

  resolve: {
    modulesDirectories: ['node_modules', './js', './lib', './vendor']
  }
};
