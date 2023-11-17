const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const occPath = [
  __dirname,
  '../',
  '../',
  'node_modules',
  '@jupytercad/opencascade',
  'lib',
  'jupytercad.opencascade.wasm'
];
const staticPath = [
  __dirname,
  'jupytercad_core',
  'labextension',
  'static',
  '[name].wasm'
];

module.exports = {
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
