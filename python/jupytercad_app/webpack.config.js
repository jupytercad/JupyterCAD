// Copyright (c) Jupyter Development Team.
// Copyright (c) Voila Development Team.
// Distributed under the terms of the Modified BSD License.

const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge').default;
const { ModuleFederationPlugin } = webpack.container;

const Build = require('@jupyterlab/builder').Build;
const baseConfig = require('@jupyterlab/builder/lib/webpack.config.base');

const data = require('./package.json');

const names = Object.keys(data.dependencies).filter(name => {
  try {
    const packageData = require(path.join(name, 'package.json'));
    return packageData.jupyterlab !== undefined;
  } catch {
    return false;
  }
});

const distRoot = path.resolve(
  __dirname,
  'jupytercad_app',
  'static'
);

// Ensure a clear build directory.
const buildDir = path.resolve(__dirname, 'build_dir');
if (fs.existsSync(buildDir)) {
  fs.removeSync(buildDir);
}
fs.ensureDirSync(buildDir);

// Copy files to the build directory
const libDir = path.resolve(__dirname, 'lib');
fs.copySync(libDir, buildDir);

const extras = Build.ensureAssets({
  packageNames: names,
  output: buildDir,
  schemaOutput: path.resolve(__dirname, 'jupytercad_app'),
  themeOutput: path.resolve(__dirname, 'jupytercad_app')
});

// Make a bootstrap entrypoint
const entryPoint = path.join(buildDir, 'bootstrap.js');

if (process.env.NODE_ENV === 'production') {
  baseConfig.mode = 'production';
}

module.exports = [
  merge(baseConfig, {
    mode: 'development',
    entry: ['./' + path.relative(__dirname, entryPoint)],
    output: {
      path: distRoot,
      library: {
        type: 'var',
        name: ['_JUPYTERLAB', 'CORE_OUTPUT']
      },
      filename: 'app.js'
    },
    plugins: [
      new ModuleFederationPlugin({
        library: {
          type: 'var',
          name: ['_JUPYTERLAB', 'CORE_LIBRARY_FEDERATION']
        },
        name: 'CORE_FEDERATION',
        shared: {
          ...data.dependencies
        }
      })
    ],
    resolve: {
      fallback: {
        util: require.resolve('util/')
      }
    }
  })
].concat(extras);
