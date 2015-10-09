//-------------------CONSTRUCTOR-------------------
var successCase = function (options) {

  describe('new Socket(' + printJSON(options) + ')', function () {

    var socket = null;

    it('does not throw an error', function (done) {
      this.timeout(testItemTimeout);

      expect(function () {
        socket = new Socket(options);
      }).to.not.throw(Error);

      done();
    });

    it('returns a new Socket object', function (done) {
      this.timeout(testItemTimeout);

      (typeof socket).should.be.eql('object');

      assert.instanceOf(socket, Socket);

      done();
    });

    it('#_httpsPorts equals the httpsPorts passed in', function (done) {
      this.timeout(testItemTimeout);

      expect(socket._httpsPorts).to.deep.equal(options.httpsPorts);

      done();
    });

    it('#_httpPorts equals the httpPorts passed in', function (done) {
      this.timeout(testItemTimeout);

      expect(socket._httpPorts).to.deep.equal(options.httpPorts);

      done();
    });

    if (options.hasOwnProperty('secure')) {
      it('#secure value is ' + options.secure, function (done) {
        this.timeout(testItemTimeout);

        expect(socket.secure).to.equal(options.secure);

        done();
      });
    } else {
      var requestSecureDefault = (window.location.protocol === 'https:' ? 'true (https)' : 'false (http)');

      it('#secure default value is ' + requestSecureDefault, function (done) {
        this.timeout(testItemTimeout);

        expect(socket.secure).to.equal(window.location.protocol === 'https:');

        done();
      });
    }

    if (options.hasOwnProperty('type')) {
      it('#type value is "' + options.type + '"', function (done) {
        this.timeout(testItemTimeout);

        expect(socket.type).to.equal(options.type);

        done();
      });
    } else {
      it('#type default value is "webSocket"', function (done) {
        this.timeout(testItemTimeout);

        expect(socket.type).to.equal('webSocket');

        done();
      });
    }

    if (options.hasOwnProperty('timeout')) {
      it('#_timeout value is ' + options.timeout, function (done) {
        this.timeout(testItemTimeout);

        expect(socket._timeout).to.equal(options.timeout);

        done();
      });
    } else {
      it('#secure default value is 20000'), function (done) {
        this.timeout(testItemTimeout);

        expect(socket._timeout).to.equal(20000);

        done();
      });
    }

  });
};

var failureCase = function (options) {
  describe('new Socket(' + printJSON(options) + ')', function () {

    var socket = null;

    it('does throw an error', function (done) {
      this.timeout(testItemTimeout);

      expect(function () {
        socket = new Socket(options);
      }).to.throw(Error);

      done();
    });

    it('does not return a new Socket object', function (done) {
      this.timeout(testItemTimeout);

      expect(socket).to.equal(null);

      done();
    });

  });
};


// new Socket();
failureCase();

// new Socket({ type: 'webSocket' });
failureCase({ type: 'webSocket' });

// new Socket({ httpPorts: [80, 3000] });
failureCase({ httpPorts: [80, 3000] });

// new Socket({ httpsPorts: [443, 3443] });
failureCase({ httpsPorts: [443, 3443] });

// new Socket({ httpPorts: [443, 3443], httpsPorts: [443, 3443] });
successCase({ httpPorts: [443, 3443], httpsPorts: [443, 3443] });

// new Socket({ httpPorts: [443, 3443], httpsPorts: [443, 3443], type: 'polling' });
successCase({ httpPorts: [443, 3443], httpsPorts: [443, 3443], type: 'polling' });

// new Socket({ httpPorts: [443, 3443], httpsPorts: [443, 3443], type: 'webSocket' });
successCase({ httpPorts: [443, 3443], httpsPorts: [443, 3443], type: 'webSocket' });

// new Socket({ httpPorts: [443, 3443], httpsPorts: [443, 3443], type: 'unknown' });
failureCase({ httpPorts: [443, 3443], httpsPorts: [443, 3443], type: 'unknown' });

// new Socket({ httpPorts: [443, 3443], httpsPorts: [443, 3443], secure: true });
successCase({ httpPorts: [443, 3443], httpsPorts: [443, 3443], secure: true });

// new Socket({ httpPorts: [443, 3443], httpsPorts: [443, 3443], timeout: 2500 })
successCase({ httpPorts: [443, 3443], httpsPorts: [443, 3443], timeout: 2500 });

//-------------------CONSTRUCTOR-------------------

//-------------------ATTRIBUTES-------------------
var socket = null;

var options = {
  httpPorts: [80, 3000],
  httpsPorts: [443, 3443]
};

var requestProtocolTestVal = {
  secure: {
    'http:': 'false (http)',
    'https:': 'true (https)'
  },
  _port: {
    'http:': 'httpPorts (http)',
    'https:': 'httpsPort (https)'
  },
  _isXDR: {
    'undefined': false,
    'function': true
  }
};

before(function (done)  {
  socket = new Socket({});
});

describe('#type', function () {

  it('is typeof "string"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(socket.type, 'string');

    done();
  });

  it('has a default value of "webSocket"', function (done) {
    this.timeout(testItemTimeout);

    expect(socket.type).to.equal('webSocket');

    done();
  });

});

describe('#readyState', function () {

  it('is typeof "string"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(socket.readyState, 'string');

    done();
  });

  it('has a value of "constructed" in the beginning', function (done) {
    this.timeout(testItemTimeout);

    expect(socket.readyState).to.equal('constructed');

    done();
  });

});

describe('#secure', function () {

  it('is typeof "boolean"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(socket.secure, 'boolean');

    done();
  });

  it('has a default value of ' + requestProtocolTestVal.secure[window.location.protocol], function (done) {
    this.timeout(testItemTimeout);

    expect(socket.secure).to.equal(false);

    done();
  });

});

describe('#_port', function () {

  it('is typeof "number"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(socket._port, 'number');

    done();
  });

  it('has the same value as the first ' + requestProtocolTestVal._port[window.location.protocol], function (done) {
    this.timeout(testItemTimeout);

    var expectedPort = window.location.protocol === 'https:' ? options.httpsPorts[0] : options.httpPorts[0];

    expect(socket._port).to.equal(expectedPort);

    done();
  });

});

describe('#_timeout', function () {

  it('is typeof "number"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(socket._timeout, 'number');

    done();
  });

  it('has a default value of 20000', function (done) {
    this.timeout(testItemTimeout);

    expect(socket._timeout).to.equal(20000);

    done();
  });

});

describe('#_messageQueue', function () {

  it('is typeof "object"', function (done) {
    this.timeout(testItemTimeout);

    (typeof socket._messageQueue).should.be.eql('object');

    done();
  });

  it('is instanceof Array', function (done) {
    this.timeout(testItemTimeout);

    assert.instanceOf(socket._messageQueue, Array);

    done();
  });

  it('has an empty value at first', function (done) {
    this.timeout(testItemTimeout);

    expect(socket._messageQueue).to.deep.equal([]);

    done();
  });

});

describe('#_isXDR', function () {

  it('is typeof "boolean"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(socket._isXDR, 'boolean');

    done();
  });

  it('has a value of ' + requestProtocolTestVal._isXDR[typeof window.XDomainRequest], function (done) {
    this.timeout(testItemTimeout);

    var expectedXDR = requestProtocolTestVal._isXDR[typeof window.XDomainRequest]

    expect(socket._isXDR).to.equal(expectedXDR);

    done();
  });

});

describe('#_objectRef', function () {

  it('has a value of null in the beginning', function (done) {
    this.timeout(testItemTimeout);

    expect(socket._objectRef).to.equal(null);

    done();
  });

});

//-------------------ATTRIBUTES-------------------

//-------------------EVENTS-------------------
socket = null;

var successOptions = {
  httpPorts: [80, 3000],
  httpsPorts: [443, 3443]
};

var failureOptions = {
  httpPorts: [34, 5445],
  httpsPorts: [243, 4443]
};

describe('#on("connected"', function () {

  it('has the correct payload', function (done) {
    this.timeout(testItemTimeout);

    socket = new Socket(successOptions);

    socket.once('connected', function (payload) {
      expect(payload).to.deep.equal({ socketType: 'webSocket' });
      done();
    });

    socket.connect();
  });

  it('#readyState has a value is "connected"', function (done) {
    this.timeout(testItemTimeout);

    expect(socket.readyState).to.equal('connected');

    done();
  });
});

describe('#on("disconnected"', function () {

  it('has the correct payload', function (done) {
    this.timeout(testItemTimeout);

    socket.once('disconnected', function (payload) {
      expect(payload).to.deep.equal({ socketType: 'webSocket' });
      done();
    });

    socket.disconnect();
  });

  it('#readyState has a value is "disconnected"', function (done) {
    this.timeout(testItemTimeout);

    expect(socket.readyState).to.equal('disconnected');

    done();
  });
});

// No available test scenario to test a solo messaging connection
describe.skip('#on("message | No available test scenerio"', function () { });

describe('#on("error"', function () {

  before(function () {
    socket = new Socket(failureOptions);
    done();
  });

  it('has the correct payload', function (done) {
    this.timeout(testItemTimeout);

    socket.once('error', function (payload) {
      expect(payload).to.have.all.keys({'errorType': 1, 'error', 1});
      assert.typeOf(payload.errorType, 'string');
      assert.instanceOf(payload.error, Error);
    });

    socket.connect();
  });

  /* Beginning of Scenario: When reconnection fails */
  describe('Scenario: When reconnection fails till connection timeout', function () {

    before(function () {
      socket.disconnect();
    });

    it('triggers "error" as many times as failed reconnection attempts', function (done) {
      this.timeout(testItemTimeout);

      socket.once('error', function (payload) {
        expect(payload).to.have.all.keys({'errorType': 1, 'error', 1});
        assert.typeOf(payload.errorType, 'string');
        assert.instanceOf(payload.error, Error);
      });
    });
  });

  it('triggers ', function (done) {
    this.timeout(testItemTimeout);

    socket.once('error', function (payload) {
      expect(payload).to.have.all.keys({'errorType': 1, 'error', 1});
      assert.typeOf(payload.errorType, 'string');
      assert.instanceOf(payload.error, Error);
    });
  });

  /* End of Scenario: When reconnection fails */

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
socket = null;

before(function (done)  {
  socket = new Socket({});

  done();
});

/* Beginning of #connect() */
describe('#connect()', function () {

  it('is typeof "function"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(socket.connect, 'function');

    done();
  });

  it('triggers "connected" event', function (done) {
    this.timeout(testItemTimeout);

    socket.once('connected', function () {
      done();
    });
  });

  it('#readyState has a value of "connected"', function (done) {
    this.timeout(testItemTimeout);

    expect(socket.readyState).to.equal('connected');

    done();
  });

  it('#_objectRef is typeof "object"', function (done) {
    this.timeout(testItemTimeout);

    (typeof socket._objectRef).should.be.eql('object');

    done();
  });

});
/* End of #connect() */

/* Beginning of #message() */
describe('#message()', function () {

  it('is typeof "function"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(socket.message, 'function');

    done();
  });

});
/* End of #message() */

/* Beginning of #disconnect() */
describe('#disconnect()', function () {

  it('is typeof "function"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(socket.disconnect, 'function');

    done();
  });

  it('triggers "disconnected" event', function (done) {
    this.timeout(testItemTimeout);

    audioTrack.once('disconnected', function () {
      done();
    });
  });

  it('#readyState has a value of "disconnected"', function (done) {
    this.timeout(testItemTimeout);

    expect(socket.readyState).to.equal('disconnected');

    done();
  });

});
/* End of #disconnect() */
//-------------------METHODS-------------------
