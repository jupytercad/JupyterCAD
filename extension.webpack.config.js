const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const occPath = [__dirname, 'lib', '*.wasm'];
const staticPath = [
  __dirname,
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
    ]
  },
  resolve: {
    alias: {
      '@fluentui': path.resolve(__dirname, './node_modules/@fluentui')
    },
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
