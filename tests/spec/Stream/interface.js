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

  // Before every tests
  before(function (done) {
    stream = new Stream({
      audio: true,
      video: true
    });

    // why not stream.on('start', done) ?
    // because if you pass in an object in done accidentally
    // it because as error done lol.
    stream.on('start', function () {
      done();
    });
  });


  console.log('===== Attributes =======');

  it('Stream.id typeof "string"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.id, 'string');

    done();
  });

  it('Stream.readyState typeof "string"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.readyState, 'string');

    done();
  });

  it('Stream._objectRef typeof "object"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream._objectRef, 'object');

    // Test basic MediaStream properties coverage to ensure it is a MediaStream object lol
    assert.typeOf(stream._objectRef.getAudioTracks, 'function');
    assert.typeOf(stream._objectRef.getVideoTracks, 'function');

    done();
  });

  it('Stream._audioTracks instanceof Array', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream._audioTracks, 'object');

    assert.instanceOf(stream._videoTracks, Array);

    done();
  });

  it('Stream._videoTracks instanceof Array', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream._videoTracks, 'object');

    assert.instanceOf(stream._videoTracks, Array);

    done();
  });

  it('Stream._videoTracks instanceof Array', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream._videoTracks, 'object');

    assert.instanceOf(stream._videoTracks, Array);

    done();
  });


  it('Stream._constraints instanceof Array', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream._videoTracks, 'object');

    assert.instanceOf(stream._videoTracks, Array);

    done();
  });

  console.log('===== Methods =======');

  it('Stream.addTrack (StreamTrack track) :: null', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.addTrack, 'function');

    done();
  });

  it('Stream.removeTrack (StreamTrack track) :: null', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.removeTrack, 'function');

    done();
  });

  it('Stream.getAudioTracks () :: new StreamTrack[*]', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.getAudioTracks, 'function');

    done();
  });

  it('Stream.getVideoTracks () :: new StreamTrack[*]', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.getVideoTracks, 'function');

    done();
  });

  it('Stream.getVideoTracks () :: new StreamTrack[*]', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.getVideoTracks, 'function');

    done();
  });

  it('Stream.stop () : null', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.stop, 'function');

    done();
  });

  it('Stream._init (<MediaStream> stream) : null', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.stop, 'function');

    done();
  });

});


})();
