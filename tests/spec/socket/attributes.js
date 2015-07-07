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
  socket = new Socket({

  });
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
