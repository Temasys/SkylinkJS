var socket = null;

before(function (done)  {
  socket = new Stream();

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