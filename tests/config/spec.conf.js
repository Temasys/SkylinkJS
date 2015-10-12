var sharedConfig = require('@@browser');

module.exports = function(config) {

  sharedConfig(config);

  config.files.push('@@spec');
  config.files.push('@@source');
  config.files.push('@@util');

  config.preprocessors['@@source'] = ['coverage'];
  config.preprocessors['@@spec'] = ['browserify'];

  // generate random port
  config.port = @@port;
};