var sharedConfig = require('../karma.conf.js');

module.exports = function(config) {

  var browser = ['IEUM'];

  sharedConfig(config);

  config.browsers = config.browsers.concat(browser);

};