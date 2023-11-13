const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const occPath = [
  __dirname,
  'lib',
  'jupytercad.opencascade.wasm'
];
const staticPath = [
  __dirname,
  'jupytercad_core',
  'labextension',
  'static',
  'jupytercad.opencascade.wasm'
];

module.exports = {
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'javascript/auto',
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        }
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
