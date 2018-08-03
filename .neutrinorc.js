module.exports = {
  use: [
    [
      '@neutrinojs/library',
      {
        name: 'airflux',
        debug: false,
        babel: {
          // Override options for babel-preset-env
          presets: [
            "react", "es2015"
          ],
          plugins: [
            "syntax-class-properties",
            "syntax-decorators",
            "syntax-object-rest-spread",
            "transform-class-properties",
            "transform-object-rest-spread",
            "syntax-export-extensions",
            "babel-plugin-transform-export-extensions"
          ]
        }
      }
    ]
    //,[ '@neutrinojs/karma' ]
  ]
};
