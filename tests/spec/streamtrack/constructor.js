var successCase = function () {
  describe('new StreamTrack(' + printJSON(options) + ')', function () {

    var track = null;
    var objectRefTrack = null;

    before(function (done) {
      window.getUserMedia({ audio: true }, function (stream) {
        objectRefTrack = stream.getAudioTracks()[0];
        done();
      }, function (error) {
        throw error;
      });
    });

    it('does not throw an error', function (done) {
      this.timeout(testItemTimeout);

      expect(function () {
        track = new StreamTrack(objectRefTrack);
      }).to.not.throw(Error);

      done();
    });

    it('returns a new StreamTrack object', function (done) {
      this.timeout(testItemTimeout);

      (typeof track).should.be.eql('object');

      assert.instanceOf(track, StreamTrack);

      done();
    });

  });
};

var failureCase = function (options) {
  describe('new StreamTrack(' + printJSON(options) + ')', function () {

    var track = null;

    it('does throw an error', function (done) {
      this.timeout(testItemTimeout);

      expect(function () {
        track = new StreamTrack(options);
      }).to.throw(Error);

      done();
    });

    it('does not return a new StreamTrack object', function (done) {
      this.timeout(testItemTimeout);

      expect(track).to.equal(null);

      done();
    });

  });
};

// new StreamTrack();
failureCase();

// new StreamTrack(<MediaStream> object);
successCase();