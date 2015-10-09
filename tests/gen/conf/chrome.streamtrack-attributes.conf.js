/*! skylinkjs - v1.0.0 - Fri Oct 09 2015 11:53:58 GMT+0800 (SGT) */

var sharedConfig = require('../../config/browsers/chrome.conf.js');

module.exports = function(config) {

  sharedConfig(config);

  config.files.push('../units/streamtrack-attributes.js');
  config.files.push('../../../publish/skylink.complete.js');

  config.preprocessors['../../../publish/skylink.complete.js'] = ['coverage'];

  // generate random port
  config.port = 5000;
};