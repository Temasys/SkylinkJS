//-------------------CONSTRUCTOR-------------------
var successCase = function () {
  describe('new StreamTrack(' + printJSON(options) + ')', function () {

    var track = null;
    var objectRefTrack = null;

    before(function (done) {
      window.getUserMedia({ audio: true }, function (stream) {
        objectRefTrack = stream.getAudioTracks()[0];
        done();
      }, function (error) {
        throw error;
      });
    });

    it('does not throw an error', function (done) {
      this.timeout(testItemTimeout);

      expect(function () {
        track = new StreamTrack(objectRefTrack);
      }).to.not.throw(Error);

      done();
    });

    it('returns a new StreamTrack object', function (done) {
      this.timeout(testItemTimeout);

      (typeof track).should.be.eql('object');

      assert.instanceOf(track, StreamTrack);

      done();
    });

  });
};

var failureCase = function (options) {
  describe('new StreamTrack(' + printJSON(options) + ')', function () {

    var track = null;

    it('does throw an error', function (done) {
      this.timeout(testItemTimeout);

      expect(function () {
        track = new StreamTrack(options);
      }).to.throw(Error);

      done();
    });

    it('does not return a new StreamTrack object', function (done) {
      this.timeout(testItemTimeout);

      expect(track).to.equal(null);

      done();
    });

  });
};

// new StreamTrack();
failureCase();

// new StreamTrack(<MediaStream> object);
successCase();
//-------------------CONSTRUCTOR-------------------

//-------------------ATTRIBUTES-------------------
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
//-------------------ATTRIBUTES-------------------

//-------------------EVENTS-------------------
stream = null;
audioTrack = null;

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
//-------------------EVENTS-------------------

//-------------------METHODS-------------------
stream = null;
audioTrack = null;
videoTrack = null;

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
//-------------------METHODS-------------------