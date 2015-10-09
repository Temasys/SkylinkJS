//-------------------CONSTRUCTOR-------------------

var successCase = function (options) {
  describe('new Stream()', function () {

    var stream = null;

    it('does not throw an error', function (done) {
      this.timeout(testItemTimeout);

      expect(function () {
        stream = new Stream();
      }).to.not.throw(Error);

      done();
    });

    it('returns a new Stream object', function (done) {
      this.timeout(testItemTimeout);

      (typeof stream).should.be.eql('object');

      assert.instanceOf(stream, Stream);

      done();
    });

  });
};

// none for the moment
var failureCase = function (options) {};

// new Stream();
successCase();

//-------------------CONSTRUCTOR-------------------

//-------------------ATTRIBUTES-------------------

var stream = null;

before(function (done)  {
  stream = new Stream();
  done();
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

//-------------------ATTRIBUTES-------------------

//-------------------EVENTS-------------------

describe('#on("streaming"', function () {

  it('has the correct payload', function (done) {
    this.timeout(testItemTimeout);

    stream.once('streaming', function (payload) {
      expect(payload).to.deep.equal({});

      done();
    });

    stream.start({ audio: true, video: true });
  });
});

describe('#on("stopped"', function () {

  it('has the correct payload', function (done) {
    this.timeout(testItemTimeout);

    stream.once('stopped', function (payload) {
      expect(payload).to.deep.equal({});

      done();
    });

    stream.stop();
  });

});

//-------------------EVENTS-------------------

//-------------------METHODS-------------------

/* Beginning of #start() */
describe('#start()', function () {

  it('is typeof "function"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.start, 'function');

    done();
  });

  /* Beginning of parameters (JSON options) */
  describe('When parameters is (JSON options)', function () {

    var constraints = {
      audio: true,
      video: true
    };

    // requires auto getUserMedia
    it('triggers "streaming" event', function (done) {
      this.timeout(testItemTimeout);

      stream.once('streaming', function () {
        done();
      });

      stream.start(constraints);
    });

    it('#_constraints is typeof "object"', function (done) {
      this.timeout(testItemTimeout);

      assert.typeOf(stream._constraints, 'object');

      done();
    });

    it('#_constraints is a JSON object', function (done) {
      this.timeout(testItemTimeout);

      var resultStr = JSON.stringify(stream._constraints);

      expect(resultStr[0]).to.equal('{');
      expect(resultStr[resultStr.length - 1]).to.equal('}');

      done();
    });

    it('#_constraints to equal constraints passed in', function (done) {
      this.timeout(testItemTimeout);

      expect(stream._constraints).to.equal(constraints);

      done();
    });

    it('#readyState has a value of "streaming"', function (done) {
      this.timeout(testItemTimeout);

      expect(stream.readyState).to.equal('streaming');

      done();
    });

    it('#_objectRef is typeof "object"', function (done) {
      this.timeout(testItemTimeout);

      (typeof stream._objectRef).should.be.eql('object');

      done();
    });

    it('#_objectRef has getAudioTracks() function', function (done) {
      this.timeout(testItemTimeout);

      assert.typeOf(stream._objectRef.getAudioTracks, 'function');

      done();
    });

    it('#_objectRef has getVideoTracks() function', function (done) {
      this.timeout(testItemTimeout);

      assert.typeOf(stream._objectRef.getVideoTracks, 'function');

      done();
    });

  });
  /* End of parameters (JSON options) */

  /* Beginning of parameters (null, MediaStream object) */
  describe('When parameters is (null, MediaStream object)', function () {

    var constraints = {
      audio: true,
      video: true
    };
    var object = null;

    before(function (done) {
      window.getUserMedia(constraints, function (data) {
        object = data;
        done();
      }, function (error) {
        throw error;
      });
    });

    // requires auto getUserMedia
    it('triggers "streaming" event', function (done) {
      this.timeout(testItemTimeout);

      stream.once('streaming', function () {
        done();
      });

      stream.start(null, object);
    });

    it('#_constraints has a value of null', function (done) {
      this.timeout(testItemTimeout);

      expect(stream._constraints).to.equal(null);

      done();
    });

    it('#readyState has a value of "streaming"', function (done) {
      this.timeout(testItemTimeout);

      expect(stream.readyState).to.equal('streaming');

      done();
    });

    it('#_objectRef is typeof "object"', function (done) {
      this.timeout(testItemTimeout);

      (typeof stream._objectRef).should.be.eql('object');

      done();
    });

    it('#_objectRef has getAudioTracks() function', function (done) {
      this.timeout(testItemTimeout);

      assert.typeOf(stream._objectRef.getAudioTracks, 'function');

      done();
    });

    it('#_objectRef has getVideoTracks() function', function (done) {
      this.timeout(testItemTimeout);

      assert.typeOf(stream._objectRef.getVideoTracks, 'function');

      done();
    });

    it('#_objectRef is the same as provided MediaStream object', function (done) {
      this.timeout(testItemTimeout);

      (stream._objectRef).should.be.eql(object);

      done();
    });

  });
  /* End of parameters (null, MediaStream object) */

  /* Beginning of parameters (JSON options, MediaStream object) */
  describe('When parameters is (JSON options, MediaStream object)', function () {

    var constraints = {
      audio: true,
      video: true
    };

    var object = null;

    before(function (done) {
      window.getUserMedia(constraints, function (data) {
        object = data;
        done();
      }, function (error) {
        throw error;
      });
    });

    // requires auto getUserMedia
    it('triggers "streaming" event', function (done) {
      this.timeout(testItemTimeout);

      stream.once('streaming', function () {
        done();
      });

      stream.start(constraints, object);
    });

    it('#_constraints is typeof "object"', function (done) {
      this.timeout(testItemTimeout);

      assert.typeOf(stream._constraints, 'object');

      done();
    });

    it('#_constraints is a JSON object', function (done) {
      this.timeout(testItemTimeout);

      var resultStr = JSON.stringify(stream._constraints);

      expect(resultStr[0]).to.equal('{');
      expect(resultStr[resultStr.length - 1]).to.equal('}');

      done();
    });

    it('#_constraints to equal constraints passed in', function (done) {
      this.timeout(testItemTimeout);

      expect(stream._constraints).to.equal(constraints);

      done();
    });

    it('#readyState has a value of "streaming"', function (done) {
      this.timeout(testItemTimeout);

      expect(stream.readyState).to.equal('streaming');

      done();
    });

    it('#_objectRef is typeof "object"', function (done) {
      this.timeout(testItemTimeout);

      (typeof stream._objectRef).should.be.eql('object');

      done();
    });

    it('#_objectRef has getAudioTracks() function', function (done) {
      this.timeout(testItemTimeout);

      assert.typeOf(stream._objectRef.getAudioTracks, 'function');

      done();
    });

    it('#_objectRef has getVideoTracks() function', function (done) {
      this.timeout(testItemTimeout);

      assert.typeOf(stream._objectRef.getVideoTracks, 'function');

      done();
    });

    it('#_objectRef is the same as provided MediaStream object', function (done) {
      this.timeout(testItemTimeout);

      (stream._objectRef).should.be.eql(object);

      done();
    });

  });
  /* End of parameters (JSON options, MediaStream object) */

});
/* End of #start() */

/* Beginning of #attachStream() */
describe('#attachStream()', function () {

  var video = document.createElement('video');
  video.autoplay = 'autoplay';
  video.muted = 'muted';

  it('is typeof "function"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.attachStream, 'function');

    done();
  });

  it('attaches stream to video element', function (done) {
    this.timeout(testItemTimeout);

    // only supported from IE 9.0 and above
    video.onplaying = function () {
      util.drawCanvas(video, function (hasStream) {
        expect(hasStream).to.equal(true);
        done();
      });
    };

    document.body.appendChild(video);

    // wait for a second because onplay is a <video> DOM event
    if (window.webrtcDetectedBrowser === 'IE' ||
      window.webrtcDetectedBrowser === 'safari') {
      setTimeout(function () {
        video.onplay();
      }, 1000);
    }

    stream.attachStream(video);
  });

  it('removes "muted" and "autoplay" for plugin objects', function (done) {
    this.timeout(testItemTimeout);

    // for IE / Safari plugin objects to be false
    if (window.webrtcDetectedBrowser === 'IE' ||
      window.webrtcDetectedBrowser === 'safari') {
      video.hasAttribute('autoplay').should.be.eql(false);
      video.hasAttribute('muted').should.be.eql(false);
    } else {
      // for chrome autoplay="autoplay" means true.
      // so expect it as autoplay
      expect(!!video.autoplay).to.equal(true);
      expect(!!video.muted).to.equal(true);
    }

    done();
  });

});
/* End of #attachStream() */

/* Beginning of #getVideoTracks() */
describe('#getAudioTracks()', function () {

  it('is typeof "function"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.getAudioTracks, 'function');

    done();
  });

  it('returns the same tracks from #_audioTracks', function (done) {
    this.timeout(testItemTimeout);

    var tracks = stream.getAudioTracks();

    expect(tracks).to.deep.equal(stream._audioTracks);
    expect(tracks).to.have.length(stream._audioTracks.length);

    done();
  });

});
/* End of #getAudioTracks() */

/* Beginning of #getAudioTracks() */
describe('#getVideoTracks()', function () {

  it('is typeof "function"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.getAudioTracks, 'function');

    done();
  });

  it('returns the same tracks from #_videoTracks', function (done) {
    this.timeout(testItemTimeout);

    var tracks = stream.getVideoTracks();

    expect(tracks).to.deep.equal(stream._videoTracks);
    expect(tracks).to.have.length(stream._videoTracks.length);

    done();
  });

});
/* End of #getVideoTracks() */

/* Beginning of #stop() */
describe('#stop()', function () {

  it('is typeof "function"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.start, 'function');

    done();
  });

  it('triggers "stopped" event', function (done) {
    this.timeout(testItemTimeout);

    stream.once('stopped', function () {
      done();
    });

    stream.stop();
  });

  it('#readyState has a value of "stopped"', function (done) {
    this.timeout(testItemTimeout);

    expect(stream.readyState).to.equal('stopped');

    done();
  });

});
/* End of #stop() */

//-------------------METHODS-------------------
