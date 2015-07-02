module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-replace');

    var replaceTask = {
      production: {
        options: {
            variables: {
                'rev': '<%= grunt.config.get("meta.rev") %>',
                'date': '<%= grunt.config.get("meta.date") %>',
                'tag': '<%= grunt.config.get("meta.tag") %>',
                'version': '<%= pkg.version %>'
            },
            prefix: '@@'
        },
        files: [{
            expand: true,
            flatten: true,
            src: [
                '<%= production %>/**/*.js'
            ],
            dest: '<%= production %>/'
        }]
      }
    };

    var concatTask = {
      options: {
        separator: '\n',
        stripBanners: true,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            (new Date()).toString() + ' */\n\n'
      },

      production: {
        files: {
          '<%= production %>/skylink.debug.js': [
              '<%= source %>/*.js',
          ],
          '<%= production %>/skylink.complete.js': [
              'node_modules/socket.io-client/socket.io.js',
              'node_modules/adapterjs/publish/adapter.screenshare.js',
              '<%= production %>/skylink.debug.js'
          ]
        }
      },
    };

    var testBrowsers = ['chrome','firefox','safari','opera'];

    var classList = ['stream'];
    var moduleList = []; //['event'];

    var testUnits = [];

    // Generate all the test scripts
    var generateTestUnits = function (array, testItems) {
      var a, b;

      // generate test scripts for classes into testUnits
      for (a = 0; a < array.length; a += 1) {
        var unit = array[a];

        for (b = 0; b < testItems.length; b += 1) {
          var item = testItems[b];
          var url = 'tests/spec/' + unit + '/' + item + '.js';
          var fileName = unit + '-' + item;

          // copy layout first and into the gen folder
          concatTask[fileName] = {
            src: ['tests/spec/script.js'],
            dest: 'tests/gen/units/' + fileName + '.js'
          };

          // replace the copied first
          replaceTask[fileName] = {
            options: {
              variables: {
                'test': unit + ' | ' + item,
                'script': grunt.file.read(url, { encoding: 'UTF-8' })
              },
              prefix: '@@'
            },
            files: [{
              expand: true,
              flatten: true,
              src: ['tests/gen/units/' + fileName + '.js'],
              dest: 'tests/gen/units/'
            }]
          };

          testUnits.push(fileName);
        }
      }
    };

    generateTestUnits(classList, ['attributes', 'events', 'methods']);
    generateTestUnits(moduleList, ['attributes', 'methods']);


    // generate configs for each test scripts and each browsers
    var i, j;

    for (i = 0; i < testBrowsers.length; i += 1) {
      var browser = testBrowsers[i];

      for (j = 0; j < testUnits.length; j += 1) {
        var unit = testUnits[j];
        var key = browser + '.' + unit;

        concatTask[key] = {
          src: ['tests/config/spec.conf.js'],
          dest: 'tests/gen/conf/' + key + '.conf.js'
        };

        replaceTask[key] = {
          options: {
            variables: {
              'browser': '../../config/browsers/' + browser + '.conf.js',
              'spec': '../units/' + unit +'.js',
              'port': parseInt('50' + i + j, 10),
              'source': '../../../publish/skylink.complete.js'
            },
            prefix: '@@'
          },
          files: [{
            expand: true,
            flatten: true,
            src: ['tests/gen/conf/' + key + '.conf.js'],
            dest: 'tests/gen/conf'
          }]
        };

        console.log(unit);
      }
    }

    grunt.initConfig({

      pkg: grunt.file.readJSON('package.json'),

      base: grunt.config('base') || grunt.option('base') || process.cwd(),

      source: 'source',

      production: 'publish',

      bamboo: 'bamboo',

      clean: {
        production: ['<%= production %>/'],
        bamboo: ['<%= bamboo %>/'],
        test: ['tests/gen/']
      },

      copy: {
            bamboo: {
                files: [{
                  expand: true,
                  cwd: '<%= production %>/',
                    src: ['**'],
                    dest: '<%= bamboo %>/skylinkjs/<%= pkg.version %>'
                }, {
                    expand: true,
                    src: ['doc/**', 'demo/**'],
                    dest: '<%= bamboo %>/doc/<%= pkg.version %>'
                }, {
                  expand: true,
                  cwd: '<%= production %>/',
                    src: ['**'],
                    dest: '<%= bamboo %>/skylinkjs/<%= ' +
                      'pkg.version_major %>.<%= pkg.version_minor %>.x'
                }, {
                    expand: true,
                    src: ['doc/**', 'demo/**'],
                    dest: '<%= bamboo %>/doc/<%= pkg.version_major %>.<%= pkg.version_minor %>.x'
                }, {
                  expand: true,
                  cwd: '<%= production %>/',
                    src: ['**'],
                    dest: '<%= bamboo %>/skylinkjs/latest'
                }, {
                    expand: true,
                    src: ['doc/**', 'demo/**'],
                    dest: '<%= bamboo %>/doc/latest'
                }],
            },
        },

        concat: concatTask,

        uglify: {
            options: {
                mangle: false,
                drop_console: true,
                compress: {
                    drop_console: true
                },
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            production: {
                files: {
                    '<%= production %>/skylink.min.js': ['<%= production %>/skylink.debug.js'],
                    '<%= production %>/skylink.complete.min.js':
                      ['<%= production %>/skylink.complete.js']
                }
            }
        },

        jshint: {
            build: {
                options: grunt.util._.merge({
                    node: true
                }, grunt.file.readJSON('.jshintrc')),
                src: [
                    //'package.json',
                    'Gruntfile.js'
                ]
            },
            test_bots: {
                options: grunt.util._.merge({
                    node: true
                }, grunt.file.readJSON('.jshintrc')),
                src: [
                    'tests/*_test.js'
                ]
            },
            tests: {
                options: grunt.util._.merge({
                    node: true
                }, grunt.file.readJSON('.jshintrc')),
                src: [
                    'test-bots/*_test.js'
                ]
            },
            app: {
                options: grunt.util._.merge({
                    browser: true,
                    devel: true,
                    globals: {
                        require: true,
                        define: true
                    }
                }, grunt.file.readJSON('.jshintrc')),
                src: [
                    '<%= source %>/*.js'
                ]
            }
        },

        preflight: {
            options: {},
            staging: {
                files: {
                    '/': ['tests/preflight-*.js']
                }
            }
        },

        replace: replaceTask,

        yuidoc: {
            doc: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: 'source/',
                    outdir: 'doc/',
                    themedir: 'doc-style'
                }
            }
        },

        compress: {
            bamboo: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                cwd: 'bamboo/skylinkjs',
                src: ['**/*.js'],
                dest: 'bamboo/skylinkjsgz/'
            }
        }
    });

    grunt.registerTask('versionise', 'Adds version meta intormation', function() {
        var done = this.async(),
            arr = [];

        grunt.util.spawn({
            cmd: 'git',
            args: ['log', '-1', '--pretty=format:%h\n %ci']
        }, function(err, result) {
            if (err) {
                return done(false);
            }
            arr = result.toString().split('\n ');
            grunt.config('meta.rev', arr[0]);
            grunt.config('meta.date', arr[1]);
        });

        try {
            var version = grunt.config('pkg.version')
                            .match(/^([0-9]+)\.([0-9]+)\.([0-9]+)$/);
            grunt.config('pkg.version_major', version[1]);
            grunt.config('pkg.version_minor', version[2]);
            grunt.config('pkg.version_release', version[3]);
        }
        catch (e) {
          grunt.fatal('Version ' + grunt.config('pkg.version') + ' has not the correct format.');
        }

        grunt.util.spawn({
            cmd: 'git',
            args: [
                'for-each-ref',
                '--sort=*authordate',
                '--format="%(tag)"',
                'refs/tags'
            ]
        }, function(err, result) {
            if (err) {
                return done(false);
            }
            arr = result.toString().split('\n');

            var tag = arr[arr.length - 1];
            tag = tag.toString();
            grunt.config('meta.tag', tag);

            grunt.log.write('Version: ' + grunt.config('pkg.version') +
              '\nRevision: ' + grunt.config('meta.rev') +
              '\nDate: ' + grunt.config('meta.date') +
              '\nGit Tag: ' + grunt.config('meta.tag') + '\n');

            done(result);
        });
    });

  grunt.registerTask('bamboovars', 'Write bamboo variables to file', function() {
        grunt.file.write('bamboo/vars', 'version=' + grunt.config('pkg.version') + '\n' +
                                'version_major=' + grunt.config('pkg.version_major') + '\n' +
                                'version_minor=' + grunt.config('pkg.version_minor') + '\n' +
                                'version_release=' + grunt.config('pkg.version_release'));
    grunt.log.writeln('bamboo/vars file successfully created');
  });

    grunt.registerTask('publish', [
      'versionise',
        'clean:production',
        'concat',
        'replace',
        'uglify',
        'yuidoc:doc'
    ]);

    grunt.registerTask('dev', [
        'jshint',
        'versionise',
        'clean:production',
        'concat',
        'replace',
        'uglify'
    ]);

    grunt.registerTask('doc', [
        'yuidoc'
    ]);

    grunt.registerTask('bamboo', [
        'publish',
        'clean:bamboo',
        'copy',
        'compress',
        'bamboovars'
    ]);

    grunt.registerTask('karma', [
        'concat',
        'replace'
    ]);

    grunt.registerTask('test', [
        'versionise',
        'clean:test',
        'concat',
        'replace',
        'uglify'
    ]);
};