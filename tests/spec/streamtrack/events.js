var stream = null;
var audioTrack = null;

describe('#on("streaming"', function () {

  it('has the correct payload', function (done) {
    this.timeout(testItemTimeout);

    stream = new Stream();

    stream.once('streaming', function () {
      audioTrack = stream.getAudioTracks()[0];

      audioTrack.once('streaming', function (payload) {
        expect(payload).to.deep.equal({});
        done();
      });
    });

    stream.start({ audio: true, video: true });
  });
});

describe('#on("mute"', function () {

  it('has the correct payload', function (done) {
    this.timeout(testItemTimeout);

    audioTrack.once('mute', function (payload) {
      expect(payload).to.deep.equal({});
      done();
    });

    audioTrack.mute();
  });

});

describe('#on("unmute"', function () {

  it('has the correct payload', function (done) {
    this.timeout(testItemTimeout);

    audioTrack.once('unmute', function (payload) {
      expect(payload).to.deep.equal({});
      done();
    });

    audioTrack.unmute();
  });

});

describe('#on("stopped"', function () {

  it('has the correct payload', function (done) {
    this.timeout(testItemTimeout);

    audioTrack.once('stopped', function (payload) {
      expect(payload).to.deep.equal({});
      done();
    });

    audioTrack.stop();
  });

});