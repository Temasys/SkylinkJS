var sharedConfig = require('./karma.conf.js');

module.exports = function(config) {

  var browser = ['FirefoxUM'];

  sharedConfig(config);

  config.browsers = config.browsers.concat(browser);

};