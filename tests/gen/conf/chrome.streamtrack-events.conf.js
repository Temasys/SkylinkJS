/*! skylinkjs - v1.0.0 - Mon Jul 06 2015 10:36:42 GMT+0800 (SGT) */

var sharedConfig = require('../../config/browsers/chrome.conf.js');

module.exports = function(config) {

  sharedConfig(config);

  config.files.push('../units/streamtrack-events.js');
  config.files.push('../../../publish/skylink.complete.js');

  config.preprocessors['../../../publish/skylink.complete.js'] = ['coverage'];

  // generate random port
  config.port = 5001;
};