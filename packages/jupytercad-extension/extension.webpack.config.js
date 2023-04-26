const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const occPath = [
  __dirname,
  '../',
  '../',
  'node_modules',
  '@jupytercad/jupytercad-opencascade',
  'lib',
  '*.wasm'
];
const staticPath = [
  __dirname,
  '../',
  '../',
  'jupytercad',
  'labextension',
  'static',
  '[name].wasm'
];

module.exports = {
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'javascript/auto',
        loader: 'file-loader'
      }
      // { test: /\.js$/, loader: 'source-map-loader' }
    ]
  },
  resolve: {
    fallback: {
      fs: false,
      child_process: false,
      crypto: false
    }
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.join(...occPath),
          to: path.join(...staticPath)
        }
      ]
    })
  ]
};
