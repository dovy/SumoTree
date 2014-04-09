module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    src: 'src/*.js',

    clean: {
      dist: ['dist']
    },

    jshint: {
      src: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: ['<%= src %>']
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/unit/*.js']
      }
    },

    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      dev: {
        background: true,
        browsers: ['PhantomJS']
      },
      travis: {
        singleRun: true,
        browsers: ['PhantomJS']
      }
    },
    less: {
      files: {
        "css/style.css": "less/style.less"
      }
    }, 

    less: {
      development: {
        files: {
          "css/style.css": "less/style.less"
        }
      },
      production: {
        options: {
          cleancss: true
        },
        files: {
          "css/style.css": "less/style.less"
        }
      }
    },

    requirejs: {
      options: {
        baseUrl: 'src',
        include: ['FamilySearch'],
        wrap: {
          startFile: 'src/header.frag',
          endFile: 'src/footer.frag'
        }
      },
      dev: {
        options: {
          out: 'dist/familysearch-javascript-sdk.js',
          optimize: 'none'
        }
      },
      prod: {
        options: {
          out: 'dist/familysearch-javascript-sdk.min.js',
          optimize: 'uglify2'
        }
      }
    },

    connect: {
      server: {
        options: {
          port: 9000,
          open: 'http://localhost:9000/',
          livereload: true
        }
      }
    },

    watch: {
      files: [
        '<%= src %>',
        '!js/familysearch-javascript-sdk.js',
        'js/*.js',
        'less/*.less',
        'templates/**/*.html',
        'Gruntfile.js',
      ],
      tasks: ['hogan', 'less:development'],
      options: {
        livereload: false,
        spawn: false
      }
    },
    hogan: {
      publish: {
        options: {
          prettify: true,
          namespace: 'fsWidgetTemplates',
          defaultName: function(file) {
            return file.split('/').pop();
          }
        },
        files:{
          "js/fs-widget-templates.js": ["templates/**/*.html"]
        }
      }
    }



  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-requirejs');
  grunt.loadNpmTasks('grunt-contrib-hogan');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('server', [
    'connect',
    'karma:dev:start',
    'watch'
  ]);

  grunt.registerTask('test', [
    'karma:travis'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'jshint',
    'test',
    'ngdocs',
    'requirejs'
  ]);

  grunt.registerTask('publish', [
    'build',
    'gh-pages:dev'
  ]);

  grunt.registerTask('travis', [
    'jshint',
    'karma:travis',
    'ngdocs',
    'requirejs',
    'gh-pages:travis'
  ]);

  // Default task(s)
  grunt.registerTask('default', ['build']);
};
