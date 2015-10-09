/* Just Mocha / Chai things */
//mocha.bail();
//mocha.run();

var expect = chai.expect;
var assert = chai.assert;
var should = chai.should;

/* Test timeouts */
var testTimeout = 35000;
var gUMTimeout = 25000;
var testItemTimeout = 4000;

var util = require('./util');

/* Template */
describe('@@test', function () {
  this.timeout(testTimeout + 2000);
  this.slow(2000);

  @@script
});