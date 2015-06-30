(function () {

'use strict';

//mocha.bail();
//mocha.run();

var expect = chai.expect;
var assert = chai.assert;
var should = chai.should;

var testTimeout = 35000;
var gUMTimeout = 25000;
var testItemTimeout = 4000;


describe('Stream', function() {
  this.timeout(testTimeout + 2000);
  this.slow(2000);

  var stream = null;

  console.log('===== Subscribed Events =======');

  it('Stream :: emits -> start', function (done) {
    this.timeout(testItemTimeout);

    stream = new Stream({
      audio: true,
      video: true
    });

    // triggers when data is triggered
    stream.on('start', function () {
      done();
    });
  });

  it('Stream :: emits -> stop', function (done) {
    this.timeout(testItemTimeout);

    stream.on('stop', function () {
      done();
    });
  });

  console.log('===== ReadyState Order =======');

  it('Stream.readyState === "constructed" && "ready"', function (done) {
    this.timeout(testItemTimeout);

    stream = new Stream({
      audio: true,
      video: true
    });

    var initRs = stream.readyState;

    expect(initRs).to.equal('constructed');

    // triggers when data is triggered
    stream.on('start', function () {
      expect(stream.readyState).to.equal('ready');
    });
  });

});


})();
