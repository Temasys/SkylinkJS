module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-clean');
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
				src: [
					'../AdapterJS/source/adapter.js',
					'<%= source %>/*.js'
				],
				dest: '<%= production %>/skyway.debug.js'
			}
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
			production_min: {
				files: {
					'<%= production %>/skyway.min.js': ['<%= production %>/skyway.debug.js']
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

	grunt.registerTask('versionise',
		'Adds version meta intormation to index.html', function () {
		var done = this.async(),
			arr = [];

		grunt.util.spawn({
			cmd : 'git',
			args : ['log', '-1', '--pretty=format:%h\n %ci']
		}, function (err, result) {
			if (err) {
				return done(false);
			}
			arr = result.toString().split('\n ');
			grunt.config('meta.rev', arr[0]);
			grunt.config('meta.date', arr[1]);
		});

		grunt.util.spawn({
			cmd : 'git',
			args : [
				'for-each-ref',
				'--sort=*authordate',
				'--format="%(tag)"',
				'refs/tags'
			]
		}, function (err, result) {
			if (err) {
				return done(false);
			}
			arr = result.toString().split('\n');

			var tag = arr[arr.length - 1];
			tag = tag.toString();
			grunt.config('meta.tag', tag);

			done(result);
		});
	});

	grunt.registerTask('publish', [
		'clean:production',
		'concat:production',
		'versionise',
		'replace:dist',
		'uglify:production_min',
		'yuidoc'
	]);

};
