var stream = null;

before(function (done)  {
  stream = new Stream();
  done();
});


describe('#id', function() {

  it('is typeof "string"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.id, 'string');

    done();
  });

});

describe('#readyState', function () {

  it('is typeof "string"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream.readyState, 'string');

    done();
  });

  it('has a value of "constructed" in the beginning', function (done) {
    this.timeout(testItemTimeout);

    expect(stream.readyState).to.equal('constructed');

    done();
  });

});

describe('#_objectRef', function () {

  it('is typeof "object"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream._objectRef, 'object');

    done();
  });

  it('has a value of null in the beginning', function (done) {
    this.timeout(testItemTimeout);

    expect(stream._objectRef).to.equal(null);

    done();
  });

});

describe('#_audioTracks', function () {

  it('is typeof "object"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream._audioTracks, 'object');

    done();
  });

  it('is instanceof Array', function (done) {
    this.timeout(testItemTimeout);

    assert.instanceOf(stream._videoTracks, Array);

    done();
  });

});

describe('#_videoTracks', function () {

  it('is typeof "object"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream._videoTracks, 'object');

    done();
  });

  it('is instanceof Array', function (done) {
    this.timeout(testItemTimeout);

    assert.instanceOf(stream._videoTracks, Array);

    done();
  });

});

describe('#_constraints', function () {

  it('is typeof "object"', function (done) {
    this.timeout(testItemTimeout);

    assert.typeOf(stream._constraints, 'object');

    done();
  });

  it('has a value of null in the beginning', function (done) {
    this.timeout(testItemTimeout);

    expect(stream._constraints).to.equal(null);

    done();
  });

});