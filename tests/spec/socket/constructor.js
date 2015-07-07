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
