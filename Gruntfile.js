module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        jshintrc: true
      }
    },
    mochaTest: {
      test: {
        options: {
            require: 'babel/register'
        },
        src: ['test/**/*.spec.js']
      }
    },
    browserify: {
      dist: {
        src: ['src/index.js'],
        dest: 'dist/<%= pkg.name %>.js',
        options: {
          bundleOptions: {
            standalone: 'airflux'
          },
          transform: ['babelify']
        },
      }
    },
    uglify: {
      dist: {
        src: 'dist/airflux.js',
        dest: 'dist/airflux.min.js'
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['build']
    },
    karma: {
      integration: {
        configFile: 'karma.conf.js',
        options: {
            browsers: ['PhantomJS']
        }
      }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('test', ['jshint', 'mochaTest' ]);

  grunt.registerTask('build', ['browserify', 'uglify', 'test' ]);

  grunt.registerTask('default', ['watch']);

};
