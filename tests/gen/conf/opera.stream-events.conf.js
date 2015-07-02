/*! skylinkjs - v1.0.0 - Thu Jul 02 2015 22:46:48 GMT+0800 (SGT) */

var sharedConfig = require('../../config/browsers/opera.conf.js');

module.exports = function(config) {

  sharedConfig(config);

  config.files.push('../units/stream-events.js');
  config.files.push('../../../publish/skylink.complete.js');

  config.preprocessors['../../../publish/skylink.complete.js'] = ['coverage'];

  // generate random port
  config.port = 5031;
};