var sharedConfig = require('@@browser');

module.exports = function(config) {

  sharedConfig(config);

  config.files.push('@@spec');
  config.files.push('@@source');

  config.preprocessors['@@source'] = ['coverage'];

  // generate random port
  config.port = @@port;
};