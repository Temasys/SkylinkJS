// Karma configuration
// Generated on Mon Mar 09 2015 10:02:58 GMT+0800 (SGT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],


    // list of files / patterns to load in the browser
    files: [
      '../../publish/skylink.complete.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '../../publish/skylink.complete.js': ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha','coverage'],

    // optionally, configure the reporter
    coverageReporter: {
      type : 'html',
      dir : '../coverage/'
    },

    // web server default port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

        // you can define custom flags
    customLaunchers: {
      ChromeUM: {
        base: 'Chrome',
        flags: ['--use-fake-ui-for-media-stream']
      },

      FirefoxUM: {
        base: 'Firefox',
        flags: []
      },

      SafariUM: {
        base: 'Safari',
        flags: []
      },

      OperaUM: {
        base: 'Opera',
        flags: []
      },

      IEUM: {
        base: 'IE',
        flags: []
      }
    },

    browsers: [],

    browserNoActivityTimeout: 100000,

    plugins: [
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-opera-launcher',
      'karma-safari-launcher',
      'karma-ie-launcher',
      'karma-coverage'
    ]

  });
};