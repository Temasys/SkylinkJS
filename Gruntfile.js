module.exports = function(grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-tape');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-replace');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        base: grunt.config('base') || grunt.option('base') || process.cwd(),

        source: 'source',

        template: '<%= source %>/template',

        production: 'publish',

        bamboo: 'bamboo',

        clean: {
            production: ['<%= production %>/'],
            bamboo: ['<%= bamboo %>/']
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
                    src: ['doc/**'],
                    dest: '<%= bamboo %>/doc/<%= pkg.version %>'
                }, {
                	expand: true,
                	cwd: '<%= production %>/',
                    src: ['**'],
                    dest: '<%= bamboo %>/skylinkjs/<%= pkg.version_major %>.<%= pkg.version_minor %>.x'
                }, {
                    expand: true,
                    src: ['doc/**'],
                    dest: '<%= bamboo %>/doc/<%= pkg.version_major %>.<%= pkg.version_minor %>.x'
                }, {
                	expand: true,
                	cwd: '<%= production %>/',
                    src: ['**'],
                    dest: '<%= bamboo %>/skylinkjs/latest'
                }, {
                    expand: true,
                    src: ['doc/**'],
                    dest: '<%= bamboo %>/doc/latest'
                }],
            },
        },

        concat: {
            options: {
                separator: '\n',
                stripBanners: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */\n\n'
            },

            production: {
                files: {
                    '<%= production %>/skylink.debug.js': [
                        '<%= template %>/header.js',
                        '<%= source %>/*.js',
                        '<%= template %>/footer.js'
                    ],
                    '<%= production %>/skyway.debug.js': [
                        '<%= template %>/header.js',
                        '<%= source %>/*.js',
                        '<%= template %>/footer.js'
                    ],
                    '<%= production %>/skylink.complete.js': [
                        'node_modules/socket.io-client/socket.io.js',
                        'node_modules/adapterjs/publish/adapter.debug.js',
                        '<%= production %>/skylink.debug.js'
                    ],
                    '<%= production %>/skyway.complete.js': [
                        'node_modules/socket.io-client/socket.io.js',
                        'node_modules/adapterjs/publish/adapter.debug.js',
                        '<%= production %>/skyway.debug.js'
                    ]
                }
            },
        },

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
                    	['<%= production %>/skylink.complete.js'],
                    '<%= production %>/skyway.min.js': ['<%= production %>/skyway.debug.js'],
                    '<%= production %>/skyway.complete.min.js':
                    	['<%= production %>/skyway.complete.js']
                }
            }
        },

        jshint: {
            build: {
                options: grunt.util._.merge({
                    node: true
                }, grunt.file.readJSON('.jshintrc')),
                src: [
                    'package.json',
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

        replace: {
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
        },

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
        }

    });

    grunt.registerTask('versionise',
        'Adds version meta intormation', function() {
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
	            var version = grunt.config('pkg.version').match('^([0-9]+)\.([0-9]+)\.([0-9]+)$')
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
        'copy'
    ]);

};
