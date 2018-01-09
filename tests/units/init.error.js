/**
 * For `init()` error case.
 */
test = this.test || {};
test.init = test.init || {};
test.init.error = function (options, expected) {

	var skylink = new Skylink();
  var response = null;
  var readyStates = [];

  skylink.on('readyStateChange', function (readyState, error, room) {
    readyStates.push({
      readyState: readyState,
      error: error,
      room: room
    });
  });

  /**
   * Tests that (error, ..) is returned instead.
   */
  it('Should return as (error, ..)', function (done) {
    this.timeout(configs.timeout);

    skylink.init(options, function (error, success) {
      response = error;
      // Test returned `error` parameter.
      assert.isNotNull(error);
      // Test returned `success` parameter.
      assert.isNull(success);
      done();
    });
  });

  /**
   * Tests that readyStateChange is triggered correctly.
   */
  it('Should trigger readyStateChange correctly', function () {
    // Test readyStateChange[0] `readyState` payload.
    expect(readyStates[0].readyState).to.eql(Skylink.prototype.READY_STATE_CHANGE.INIT);
    // Test readyStateChange[0] `error` payload.
    expect(readyStates[0].error).to.eql(null);
    // Test readyStateChange[0] `room` payload.
    expect(readyStates[0].room).to.eql(skylink._selectedRoom);

    // For some errors, the request to the API server has not been made.
    if (expected.status === -2) {
      // Test readyStateChange[1] `readyState` payload.
      expect(readyStates[1].readyState).to.eql(Skylink.prototype.READY_STATE_CHANGE.ERROR);
      // Test readyStateChange[1] `error.errorCode` payload.
      expect(readyStates[1].error.errorCode).to.eql(expected.errorCode);
      // Test readyStateChange[1] `error.error` payload.
      assert.instanceOf(readyStates[1].error.content, Error);
      // Test readyStateChange[1] `error.status` payload.
      expect(readyStates[1].error.status).to.eql(expected.status);
      // Test readyStateChange[1] `room` payload.
      expect(readyStates[1].room).to.eql(skylink._selectedRoom);

    } else {
    	// Test readyStateChange[1] `readyState` payload.
      expect(readyStates[1].readyState).to.eql(Skylink.prototype.READY_STATE_CHANGE.LOADING);
      // Test readyStateChange[1] `error` payload.
      expect(readyStates[1].error).to.eql(null);
      // Test readyStateChange[1] `room` payload.
      expect(readyStates[1].room).to.eql(skylink._selectedRoom);

      // Test readyStateChange[2] `readyState` payload.
      expect(readyStates[2].readyState).to.eql(Skylink.prototype.READY_STATE_CHANGE.ERROR);
      // Test readyStateChange[2] `error.errorCode` payload.
      expect(readyStates[2].error.errorCode).to.eql(expected.errorCode);
      // Test readyStateChange[2] `error.error` payload.
      assert.instanceOf(readyStates[2].error.content, Error);
      // Test readyStateChange[2] `error.status` payload.
      expect(readyStates[2].error.status).to.eql(expected.status);
      // Test readyStateChange[2] `room` payload.
      expect(readyStates[2].room).to.eql(skylink._selectedRoom);
    }
  });

  /**
   * Tests `error.errorCode`.
   */
  it('Returns error.errorCode correctly', function () {
    // Test returned output.
    expect(response.errorCode).to.eql(expected.errorCode);
  });

  /**
   * Tests `error.error`.
   */
  it('Returns error.error correctly', function () {
    // Test returned output.
    assert.instanceOf(response.error, Error);
  });

  /**
   * Tests `error.status`.
   */
  it('Returns error.status correctly', function () {
    // Test returned output.
    expect(response.status).to.eql(expected.status);
  });

};