var path = require('path')
  , webpack = require('webpack')
  , ExtractTextPlugin = require("extract-text-webpack-plugin")
  , pkg = require('./package.json');

function makeConfig(options){
  var entry = options.entry
    , plugins = options.plugins || []

  var loaders = [
    { test: /\.css$/,  loader: options.extractStyles 
        ? ExtractTextPlugin.extract("style-loader", "css-loader") 
        : "style-loader!css-loader" },

    { test: /\.less$/, loader: options.extractStyles  
        ? ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")  
        : "style-loader!css-loader!less-loader" },

    { test: /\.gif$/, loader: "url-loader?mimetype=image/png" },
    { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
    { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader?name=[name].[ext]" },

    { test: /\.jsx$|\.js$/, loader: 'babel-loader', exclude: /node_modules/, query: pkg.babel }
  ];

  if (options.hot){
    loaders.splice(loaders.length - 1,0, 
      { test: /\.jsx$|\.js$/, loader: 'react-hot-loader', exclude: /node_modules/ })

    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin())

    entry = [
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      entry
    ]
  }

  if (options.loaders)
    loaders = loaders.concat(options.loaders)


  if (options.minimize) 
    plugins.push(
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.DefinePlugin({
        '__VERSION__': JSON.stringify(pkg.version),
        "process.env": { NODE_ENV: JSON.stringify("production") }
      }),
      new webpack.NoErrorsPlugin())
  else
    plugins.push(
      new webpack.DefinePlugin({
        '__VERSION__': JSON.stringify(pkg.version)
      }));
  
  if (options.extractStyles)
    plugins.push(
      new ExtractTextPlugin(options.styleName || "styles.css", {
          allChunks: true
      }))

  if (options.banner) {
    plugins.push(
      new webpack.BannerPlugin( 
        'v' + JSON.stringify(pkg.version) + ' | (c) ' + (new Date).getFullYear() + ' Jason Quense | '
        + 'https://github.com/jquense/react-widgets/blob/master/License.txt'
        , { entryOnly : true }))
  }

  return {
    cache: true,

    devtool: options.devtool,

    entry: entry,

    output: options.output,

    externals: options.externals,

    resolve: {
      extensions: ['', '.js', '.jsx']
    },

    module: {
      loaders: loaders
    },

    plugins: plugins,

    node: {
      Buffer: false
    }
  }
}


module.exports = {

  babel: pkg.babel,

  browser: makeConfig({

    banner: true,

    minimize: true,

    entry: './lib/index.js',

    output: {
      path: path.join(__dirname, './dist'),
      filename: 'react-widgets.js',
      library:  'ReactWidgets',
      libraryTarget: 'this'
    },

    externals: {
      globalize: 'Globalize',
      react:  'React'
    }
  }),

  dev: makeConfig({

    hot: true,

    devtool: 'source-map',

    entry: './dev/dev.jsx',

    output: {
      filename: 'bundle.js',
      path: __dirname
    }
  }),

  docBuild: makeConfig({

    minimize: true,

    extractStyles: true,

    styleName: 'docs.css',

    entry: './docs/components/docs.jsx',

    output: {
      path: path.join(__dirname, './docs/public'),
      filename: 'docs.js'
    },

    externals: {
      react:  'window.React',
      'babel/browser': 'window.babel'
    },

    loaders: [
      { test: /\.json$/, loader: "json" }
    ]

  }),

  docServer: makeConfig({

    devtool: 'source-map',

    hot: true,

    extractStyles: true,

    styleName: 'public/docs.css',

    entry:'./docs/components/docs.jsx',

    output: {
      path: path.join(__dirname, './docs/public'),
      filename: 'docs.js'
    },

    externals: {
      react: 'window.React',
      'babel/browser': 'window.babel'
    },

    loaders: [{ test: /\.json$/, loader: "json" }],
  }),

  test: makeConfig({

    devtool: 'inline-source-map',

    // entry:'./test.js',

    // output: {
    //   path: __dirname,
    //   filename: '_test.bundle.js'
    // },
    
    loaders: [
      { test: /sinon-chai/, loader: "imports?define=>false" }
    ]
  })
}
