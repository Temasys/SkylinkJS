/*! skylinkjs - v1.0.0 - Fri Jul 03 2015 11:11:59 GMT+0800 (SGT) */

//mocha.bail();
//mocha.run();

var expect = chai.expect;
var assert = chai.assert;
var should = chai.should;

/* Test timeouts */
var testTimeout = 35000;
var gUMTimeout = 25000;
var testItemTimeout = 4000;

/* Shared functions */
// Checking the bytes of the canvas
var checkCanvas = function (ctx, width, height) {
  var nimg = ctx.getImageData(0, 0, width, height);

  var d = nimg.data;

  var i;

  for (i = 0; i < d.length; i += 4) {
    var r = d[i];
    var g = d[i + 1];
    var b = d[i + 2];

    if (r !== 0 || g !== 0 || b !== 0) {
      return true;
    }
  }

  return false;
};

// Drawing into a canvas using video
var drawCanvas = function (v, callback) {
  var draw = function (v,c,w,h) {
    if(v.paused || v.ended) {
      return false;
    }
    c.drawImage(v,0,0,w,h);
    setTimeout(draw,20,v,c,w,h);
  };

  var canvas = document.getElementById('test');

  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'test';
    document.body.appendChild(canvas);
  }

  var context = canvas.getContext('2d');

  var cw = Math.floor(canvas.clientWidth);
  var ch = Math.floor(canvas.clientHeight);
  canvas.width = cw;
  canvas.height = ch;

  draw(v,context,cw,ch);

 setTimeout(function () {
   v.pause();

   callback( checkCanvas(context, cw, ch) );
 }, 50);
};

/* Template */
describe('stream | methods', function () {
  this.timeout(testTimeout + 2000);
  this.slow(2000);

  var stream = null;

before(function (done)  {
  stream = new Stream();
  done();
});

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

      assert.typeOf(stream._objectRef, 'object');

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

    var object = null;

    before(function () {
      window.getUserMedia({
        audio: true,
        video: true
      }, function (data) {
        object = data;
        done();
      }, function (error) {
        throw error;
      })
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

      assert.typeOf(stream._objectRef, 'object');

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

      expect(stream._objectRef).to.equal(object);
    });

  });
  /* End of parameters (null, MediaStream object) */

  /* Beginning of parameters (JSON options, MediaStream object) */
  describe('When parameters is (JSON options)', function () {

    var constraints = {
      audio: true,
      video: true
    };

    var object = null;

    before(function (done) {
      window.getUserMedia({
        audio: true,
        video: true
      }, function (data) {
        object = data;
        done()
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

      stream.start(constraints, );
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

      assert.typeOf(stream._objectRef, 'object');

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

      expect(stream._objectRef).to.equal(object);
    });

  });
  /* End of parameters (JSON options, MediaStream object) */

});
/* End of #start() */

/* Beginning of #attachStream() */
describe('#attachStream', function () {

  var video = document.createElement('video');

  document.body.appendChild(video);

  it('is typeof "function"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.attachStream, 'function');

    done();
  });

  it('attaches stream to video element', function (done) {
    this.timeout(testItemTimeout);

    video.onplay = function () {
      drawCanvas(video, function (isEmpty) {
        expect(isEmpty).to.equal(false);
        done();
      });
    };

    stream.attachStream(video);
  });
});

/* Beginning of #stop() */
describe('#stop()', function () {

  it('is typeof "function"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.start, 'function');

    done();
  });

  it('triggers "stopped" event', function () {
    this.timeout(testItemTimeout);

    stream.once('stopped', function () {
      done();
    });

    stream.stop();
  });

  it('#readyState has a value of "stopped"', function () {
    this.timeout(testItemTimeout);

    expect(stream.readyState).to.equal('stopped');

    done();
  });

});
});