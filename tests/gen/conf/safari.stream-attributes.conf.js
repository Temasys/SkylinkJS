/*! skylinkjs - v1.0.0 - Fri Jul 03 2015 15:54:22 GMT+0800 (SGT) */

var sharedConfig = require('../../config/browsers/safari.conf.js');

module.exports = function(config) {

  sharedConfig(config);

  config.files.push('../units/stream-attributes.js');
  config.files.push('../../../publish/skylink.complete.js');

  config.preprocessors['../../../publish/skylink.complete.js'] = ['coverage'];

  // generate random port
  config.port = 5020;
};