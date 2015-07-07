var stream = null;
var audioTrack = null;
var videoTrack = null;

before(function (done)  {
  stream = new Stream();

  stream.once('streaming', function (payload) {
    audioTrack = stream.getAudioTracks()[0];
    videoTrack = stream.getVideoTracks()[0];

    done();
  });

  stream.start({ audio: true, video: true });
});

/* Beginning of #mute() */
describe('#mute()', function () {

  it('is typeof "function"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(audioTrack.mute, 'function');
    assert.typeOf(videoTrack.mute, 'function');

    done();
  });

  it('triggers "mute" event', function (done) {
    this.timeout(testItemTimeout);

    var audioTriggerCounter = 0;
    var videoTriggerCounter = 0;

    audioTrack.once('mute', function () {
      audioTriggerCounter++;
    });

    videoTrack.once('mute', function () {
      videoTriggerCounter++;
    });

    audioTrack.mute();
    videoTrack.mute();

    setTimeout(function () {
      expect(audioTriggerCounter).to.equal(1);
      expect(videoTriggerCounter).to.equal(1);
      done();
    }, 1000);
  });

  it('#muted has a value of true', function (done) {
    this.timeout(testItemTimeout);

    expect(audioTrack.muted).to.equal(true);
    expect(videoTrack.muted).to.equal(true);

    done();
  });

  it('#_objectRef.enabled has a value of false', function (done) {
    this.timeout(testItemTimeout);

    expect(audioTrack._objectRef.enabled).to.equal(false);
    expect(videoTrack._objectRef.enabled).to.equal(false);

    done();
  });

});
/* End of #mute() */

/* Beginning of #unmute() */
describe('#unmute()', function () {

  it('is typeof "function"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(audioTrack.unmute, 'function');
    assert.typeOf(videoTrack.unmute, 'function');

    done();
  });

  it('triggers "unmute" event', function (done) {
    this.timeout(testItemTimeout);

    var audioTriggerCounter = 0;
    var videoTriggerCounter = 0;

    audioTrack.once('unmute', function () {
      audioTriggerCounter++;
    });

    videoTrack.once('unmute', function () {
      videoTriggerCounter++;
    });

    audioTrack.unmute();
    videoTrack.unmute();

    setTimeout(function () {
      expect(audioTriggerCounter).to.equal(1);
      expect(videoTriggerCounter).to.equal(1);
      done();
    }, 1000);
  });

  it('#muted has a value of false', function (done) {
    this.timeout(testItemTimeout);

    expect(audioTrack.muted).to.equal(false);
    expect(videoTrack.muted).to.equal(false);

    done();
  });

  it('#_objectRef.enabled has a value of true', function (done) {
    this.timeout(testItemTimeout);

    expect(audioTrack._objectRef.enabled).to.equal(true);
    expect(videoTrack._objectRef.enabled).to.equal(true);

    done();
  });

});
/* End of #unmute() */

/* Beginning of #stop() */
describe('#stop()', function () {

  it('is typeof "function"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(audioTrack.stop, 'function');
    assert.typeOf(videoTrack.stop, 'function');

    done();
  });

  it('triggers "stopped" event', function (done) {
    this.timeout(testItemTimeout);

    var audioTriggerCounter = 0;
    var videoTriggerCounter = 0;
    var streamTriggerCounter = 0;

    audioTrack.once('stopped', function () {
      audioTriggerCounter++;
    });

    videoTrack.once('stopped', function () {
      videoTriggerCounter++;
    });

    stream.once('stopped', function () {
      streamTriggerCounter++;
    });

    audioTrack.stop();
    videoTrack.stop();

    setTimeout(function () {
      expect(audioTriggerCounter).to.equal(1);
      expect(videoTriggerCounter).to.equal(1);
      expect(streamTriggerCounter).to.equal(1);
      done();
    }, 1000);
  });

  it('#readyState has a value of "stopped"', function (done) {
    this.timeout(testItemTimeout);

    expect(audioTrack.readyState).to.equal('stopped');
    expect(videoTrack.readyState).to.equal('stopped');

    done();
  });

  it('Stream.readyState has a value of "stopped"', function (done) {
    this.timeout(testItemTimeout);

    expect(stream.readyState).to.equal('stopped');

    done();
  });

});
/* End of #stop() */