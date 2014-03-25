module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-replace');

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		base: grunt.config('base') || grunt.option('base') || process.cwd(),

		source: 'source',

		production: 'publish',

		clean: {
			production: ['<%= production %>/']
		},

		concat: {
			options: {
				separator: ';',
				stripBanners: true,
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
					'<%= grunt.template.today("yyyy-mm-dd") %> */\n\n'
			},
			production: {
				src: ['<%= source %>/*.js'],
				dest: '<%= production %>/skyway.js'
			}
		},

		uglify: {
			options: {
				mangle: false,
				drop_console: true
			},
			production: {
				files: {
					'<%= production %>/skyway.min.js': ['<%= production %>/skyway.js']
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
			tests: {
				options: grunt.util._.merge({
					node: true
				}, grunt.file.readJSON('.jshintrc')),
				src: [
					'tests/*_test.js'
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

		nodeunit: {
			tests: ['tests/*_test.js']
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
			dist: {
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
						'<%= production %>/*.js'
					],
					dest: '<%= production %>/'
				}]
			}
		},

		yuidoc: {
			compile: {
				name: '<%= pkg.name %>',
				description: '<%= pkg.description %>',
				version: '<%= pkg.version %>',
				url: '<%= pkg.homepage %>',
				options: {
					paths: 'source/',
					outdir: 'doc/'
				}
			}
		}

	});

	grunt.registerTask('test', [
		'jshint',
		'nodeunit'
	]);

	grunt.registerTask('publish', [
		'test',
		'clean:production',
		'concat:production',
		'replace:dist',
		'uglify:production',
		'yuidoc'
	]);

};
