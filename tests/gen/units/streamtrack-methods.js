/*! skylinkjs - v1.0.0 - Mon Jul 06 2015 11:09:33 GMT+0800 (SGT) */

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
describe('streamtrack | methods', function () {
  this.timeout(testTimeout + 2000);
  this.slow(2000);

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
});