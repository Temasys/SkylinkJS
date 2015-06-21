var sharedConfig = require('../config/firefox.conf.js');

module.exports = function(config) {

  sharedConfig(config);

  config.files.push('../spec/event.js');

  // generate random port
  config.port = 5010;
};