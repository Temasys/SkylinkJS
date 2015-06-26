var sharedConfig = require('../config/firefox.conf.js');

module.exports = function(config) {

  sharedConfig(config);

  config.files.push('../spec/event.js');
  config.files.push('../../source/event.js');

  config.preprocessors['../../source/event.js'] = ['coverage'];

  // generate random port
  config.port = 5010;
};