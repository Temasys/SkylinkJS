var stream = null;

before(function (done)  {
  stream = new Stream();
  done();
});

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