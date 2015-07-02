var sharedConfig = require('../karma.conf.js');

module.exports = function(config) {

  var browser = ['OperaUM'];

  sharedConfig(config);

  config.browsers = config.browsers.concat(browser);

};