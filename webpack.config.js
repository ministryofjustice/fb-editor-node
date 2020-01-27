require('@ministryofjustice/module-alias/register')

const path = require('path')
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin')
const {
  EnvironmentPlugin
} = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')

const {
  sourcePath,
  targetPath
} = require('./build/paths')

const buildSourcePath = path.join(sourcePath, 'js')
const buildTargetPath = path.join(targetPath, 'javascripts')

const {
  version,
  /*
   *  Resolves module aliases in IDEs (WebStorm, etc)
   *
   *  For runtime module alias resolution see
   *  https://www.npmjs.com/package/@ministryofjustice/module-alias
   */
  _moduleAliases
} = require('./package')

module.exports = () => ({
  mode: 'production',
  resolve: {
    alias: {
      ..._moduleAliases
    }
  },
  entry: {
    app: path.join(buildSourcePath, 'app.js'),
    'admin-page': path.join(buildSourcePath, 'admin-page.js'),
    'admin-page.property.booleanconditional': path.join(buildSourcePath, 'admin-page.property.booleanconditional.js'),
    'admin-page.property.items': path.join(buildSourcePath, 'admin-page.property.items.js'),
    'admin-page.property': path.join(buildSourcePath, 'admin-page.property.js'),
    'page.editable': path.join(buildSourcePath, 'page.editable.js'),
    'page.flow': path.join(buildSourcePath, 'page.flow.js')
  },
  output: {
    path: buildTargetPath,
    filename: `[name]-${version}.js`
  },
  stats: {
    colors: true
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        use: 'babel-loader',
        exclude: /node_modules(!\/accessible-autocomplete)/
      }
    ]
  },
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()]
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: false,
      cleanOnceBeforeBuildPatterns: [
        buildTargetPath.concat('/*.js'),
        buildTargetPath.concat('/*.js.map')
      ]
    }),
    new EnvironmentPlugin({ NODE_ENV: 'production' })
  ]
})
