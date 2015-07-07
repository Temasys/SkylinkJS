var socket = null;

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