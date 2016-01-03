module.exports = {
    entry: [ './src/index.js' ], // karma will set this
    output: {
        path: './commonjs2',
        filename: 'index.js',
        library: 'airflux',
        libraryTarget: 'commonjs2'
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
