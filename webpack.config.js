module.exports = {
    entry: [ './src/index.js' ], // karma will set this
    output: {
        path: './build',
        filename: 'airflux.js',
        library: 'airflux',
        libraryTarget: 'umd'
    },
    resolve: {
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loaders: ['babel'],
            }
        ]
    },
    externals: [
      {
        react: {
          root: 'React',
          commonjs2: 'react',
          commonjs: 'react',
          amd: 'react'
        }
      }
    ]
}
