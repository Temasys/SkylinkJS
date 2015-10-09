/*! skylinkjs - v1.0.0 - Fri Oct 09 2015 11:53:58 GMT+0800 (SGT) */

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

// Parse the constraints of getUserMedia
var printJSON = function (obj, spaces) {
  spaces = typeof spaces !== 'number' ? 2 : spaces;

  if (typeof obj === 'undefined') {
    return '';
  }

  // make indentation
  var makeIndentation = function (spaces) {
    var str = '';
    var i;

    for (i = 0; i < spaces; i += 1) {
      str += ' ';
    }

    return str;
  };

  var opening = '{';
  var closing = '}';

  if (obj instanceof Array) {
    opening = '[';
    closing = ']';
  }

  // parse object
  var outputStr = makeIndentation(spaces - 2) + opening;
  var val;


  if (!(obj instanceof Array)) {
    var key;

    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        outputStr += '\n\t' + makeIndentation(spaces) + '"' + key + '": ';

        val = obj[key];

        if (typeof val === 'object') {
          outputStr += printJSON(val, spaces + 2);

        } else if (typeof val === 'string') {
          outputStr += '"' + val + '"';

        } else {
          outputStr += val;
        }

        outputStr += ',';
      }
    }
  } else {
    var i;

    for (i = 0; i < obj.length; i += 1) {
      val = obj[i];

      if (typeof val === 'object') {
        outputStr += printJSON(val, spaces + 2);

      } else if (typeof val === 'string') {
        outputStr += '"' + val + '"';

      } else {
        outputStr += val;
      }

      if (i < (obj.length - 1)) {
        outputStr += ',';
      }
    }
  }

  outputStr += '\n\t' + makeIndentation(spaces - 2) + closing;

  return outputStr;
};

/* Template */
describe('streamtrack | attributes', function () {
  this.timeout(testTimeout + 2000);
  this.slow(2000);

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
});