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