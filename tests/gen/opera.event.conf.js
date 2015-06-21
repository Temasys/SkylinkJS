var sharedConfig = require('../config/opera.conf.js');

module.exports = function(config) {

  sharedConfig(config);

  config.files.push('../spec/event.js');

  // generate random port
  config.port = 5030;
};