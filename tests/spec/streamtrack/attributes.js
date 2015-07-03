var audioTrack = null;
var videoTrack = null;

before(function (done)  {
  stream = new Stream();

  stream.once('streaming', function () {

    audioTrack = stream.getAudioTracks()[0];
    videoTrack = stream.getVideoTracks()[0];

    done();
  });

  stream.start({ audio: true, video: true});
});


describe('#readyState', function () {

  it('is typeof "string"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.readyState, 'string');

    done();
  });

  it('has a value of "constructed" in the beginning', function (done) {
    this.timeout(testItemTimeout);

    expect(stream.readyState).to.equal('constructed');

    done();
  });

});

describe('#_objectRef', function () {

  it('has a value of null in the beginning', function (done) {
    this.timeout(testItemTimeout);

    expect(stream._objectRef).to.equal(null);

    done();
  });

});

describe('#_audioTracks', function () {

  it('is typeof "object"', function (done) {
    this.timeout(testItemTimeout);

    (typeof stream._audioTracks).should.be.eql('object');

    done();
  });

  it('is instanceof Array', function (done) {
    this.timeout(testItemTimeout);

    assert.instanceOf(stream._audioTracks, Array);

    done();
  });

  it('has empty tracks at the beginning', function (done) {
    this.timeout(testItemTimeout);

    expect(stream._audioTracks).to.deep.equal([]);
    expect(stream._audioTracks).to.have.length(0);

    done();
  });

});

describe('#_videoTracks', function () {

  it('is typeof "object"', function (done) {
    this.timeout(testItemTimeout);

    (typeof stream._videoTracks).should.be.eql('object');

    done();
  });

  it('is instanceof Array', function (done) {
    this.timeout(testItemTimeout);

    assert.instanceOf(stream._videoTracks, Array);

    done();
  });

  it('has empty tracks at the beginning', function (done) {
    this.timeout(testItemTimeout);

    expect(stream._videoTracks).to.deep.equal([]);
    expect(stream._videoTracks).to.have.length(0);

    done();
  });

});

describe('#_constraints', function () {

  it('has a value of null in the beginning', function (done) {
    this.timeout(testItemTimeout);

    expect(stream._constraints).to.equal(null);

    done();
  });

});