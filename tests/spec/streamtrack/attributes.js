var stream = null;
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

describe('#type', function () {

  it('is typeof "string"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(audioTrack.type, 'string');
    assert.typeOf(videoTrack.type, 'string');

    done();
  });

  it('has a value of "audio" for audioTrack', function (done) {
    this.timeout(testItemTimeout);

    expect(audioTrack.type).to.equal('audio');

    done();
  });

  it('has a value of "video" for videoTrack', function (done) {
    this.timeout(testItemTimeout);

    expect(videoTrack.type).to.equal('video');

    done();
  });

});

describe('#readyState', function () {

  it('is typeof "string"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(audioTrack.readyState, 'string');
    assert.typeOf(videoTrack.readyState, 'string');

    done();
  });

  it('has a value of "streaming" in the beginning', function (done) {
    this.timeout(testItemTimeout);

    expect(audioTrack.readyState).to.equal('streaming');
    expect(videoTrack.readyState).to.equal('streaming');

    done();
  });

});

describe('#muted', function () {

  it('is typeof "boolean"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(audioTrack.muted, 'boolean');
    assert.typeOf(videoTrack.muted, 'boolean');

    done();
  });

  it('has a value of false in the beginning (for this test)', function (done) {
    this.timeout(testItemTimeout);

    expect(audioTrack.muted).to.equal(false);
    expect(videoTrack.muted).to.equal(false);

    done();
  });

});


describe('#_objectRef', function () {

  it('#_objectRef is typeof "object"', function (done) {
    this.timeout(testItemTimeout);

    (typeof audioTrack._objectRef).should.be.eql('object');
    (typeof videoTrack._objectRef).should.be.eql('object');

    done();
  });

  it('#_objectRef is the same as provided MediaStream object', function (done) {
    this.timeout(testItemTimeout);

    var objRefAudioTrack = stream._objectRef.getAudioTracks()[0];
    var objRefVideoTrack = stream._objectRef.getVideoTracks()[0];

    (audioTrack._objectRef).should.be.eql(objRefAudioTrack);
    (videoTrack._objectRef).should.be.eql(objRefVideoTrack);

    done();
  });

});