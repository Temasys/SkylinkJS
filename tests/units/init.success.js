/**
 * For `init()` success case.
 */
test = this.test || {};
test.init = test.init || {};
test.init.success = function (options) {

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
   * Tests that (.., success) is returned instead.
   */
  it('Should return as (.., success)', function (done) {
    this.timeout(configs.timeout);

    skylink.init(options, function (error, success) {
      console.error('error ->', error ? error.error.message : null);
      response = success;
      // Test returned `error` parameter.
      assert.isNull(error);
      // Test returned `success` parameter.
      assert.isNotNull(success);
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

    // Test readyStateChange[1] `readyState` payload.
    expect(readyStates[1].readyState).to.eql(Skylink.prototype.READY_STATE_CHANGE.LOADING);
    // Test readyStateChange[1] `error` payload.
    expect(readyStates[1].error).to.eql(null);
    // Test readyStateChange[1] `room` payload.
    expect(readyStates[1].room).to.eql(skylink._selectedRoom);

    // Test readyStateChange[2] `readyState` payload.
    expect(readyStates[2].readyState).to.eql(Skylink.prototype.READY_STATE_CHANGE.COMPLETED);
    // Test readyStateChange[2] `error` payload.
    expect(readyStates[2].error).to.eql(null);
    // Test readyStateChange[2] `room` payload.
    expect(readyStates[2].room).to.eql(skylink._selectedRoom);
  });

  /**
   * Tests `success.selectedRoom`.
   */
  it('Returns success.selectedRoom correctly', function () {
    // Test the configured settings.
    expect(skylink._selectedRoom).to.eql(skylink._initOptions.defaultRoom);
    // Test returned output.
    expect(response.selectedRoom).to.eql(skylink._selectedRoom);
  });

  /**
   * Tests `success.serverUrl`.
   */
  it('Returns success.serverUrl correctly', function () {
    // Test the returned output to contain the base construct: <room server>/api/<my app key>/<room>
    expect(response.serverUrl.indexOf(
      skylink._initOptions.roomServer + '/api/' +
      skylink._initOptions.appKey + '/' +
      skylink._selectedRoom)
    ).to.eql(0);

    // Test the returned output to contain the credentials construct: /<start>/<duration>?cred=<creds>
    if (skylink._initOptions.credentials) {
      expect(response.serverUrl).match(new RegExp(
        '.*\/' + skylink._initOptions.credentials.startDateTime + '\/' +
        skylink._initOptions.credentials.duration + '[&|?]cred=' +
        skylink._initOptions.credentials.credentials)
      );
    }
  });

  /**
   * Tests `success.readyState`.
   */
  it('Returns success.readyState correctly', function () {
    // Test the configured readyState.
    expect(skylink._readyState).to.eql(Skylink.prototype.READY_STATE_CHANGE.COMPLETED);
    // Test returned output.
    expect(response.readyState).to.eql(skylink._readyState);
  });

  /**
   * Tests `success.appKey`.
   * Requires to be defined always.
   */
  it('Returns success.appKey correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.appKey).to.eql(
      // 1. Use configured `options.appKey` value.
      options.appKey ||
      // 2. Use configured deprecated `options.apiKey` value.
      options.apiKey ||
      // 3. Use `options` as the app key value.
      options
    );
    // Test returned output.
    expect(response.appKey).to.eql(skylink._initOptions.appKey);
  });

  /**
   * Tests `success.defaultRoom`.
   * Defaults: options.appKey
   */
  it('Returns success.defaultRoom correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.defaultRoom).to.eql(
      // 1. Use configured `options.defaultRoom` value.
      options.defaultRoom ||
      // 2. Use configured `options.appKey` value as fallback.
      skylink._initOptions.appKey
    );
    // Test returned output.
    expect(response.defaultRoom).to.eql(skylink._initOptions.defaultRoom);
  });

  /**
   * Tests `success.useEdgeWebRTC`.
   * Defaults: false
   */
  it('Returns success.useEdgeWebRTC correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.useEdgeWebRTC).to.eql(options.useEdgeWebRTC === true);
    // Test returned output.
    expect(response.useEdgeWebRTC).to.eql(skylink._initOptions.useEdgeWebRTC);
  });

  /**
   * Tests `success.credentials`.
   * Defaults: null
   * Requires options.credentials.credentials,
   *   options.credentials.duration and
   *   options.credentials.startDateTime to be defined.
   */
  it('Returns success.credentials correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.credentials).to.eql(
      options.credentials &&
      options.credentials.credentials &&
      options.credentials.duration &&
      options.credentials.startDateTime ? options.credentials : null
    );
    // Test returned output.
    expect(response.credentials).to.eql(skylink._initOptions.credentials);
  });

  /**
   * Tests `success.roomServer`.
   * Defaults: [Set by SDK]
   * Requires to be defined as `//` at the beginning.
   */
  it('Returns success.roomServer correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.roomServer).to.match(new RegExp(
      options.roomServer && options.roomServer.indexOf('//') === 0 ?
      options.roomServer : '\/\/.*')
    );
    // Test returned output.
    expect(response.roomServer).to.eql(skylink._initOptions.roomServer);
  });

  /**
   * Tests `success.enableIceTrickle`.
   * Defaults: true
   */
  it('Returns success.enableIceTrickle correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.enableIceTrickle).to.eql(options.enableIceTrickle !== false);
    // Test returned output.
    expect(response.enableIceTrickle).to.eql(skylink._initOptions.enableIceTrickle);
  });

  /**
   * Tests `success.enableDataChannel`.
   * Defaults: true
   */
  it('Returns success.enableDataChannel correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.enableDataChannel).to.eql(options.enableDataChannel !== false);
    // Test returned output.
    expect(response.enableDataChannel).to.eql(skylink._initOptions.enableDataChannel);
  });

  /**
   * Tests `success.enableSTUNServer`.
   * Defaults: true
   */
  it('Returns success.enableSTUNServer correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.enableSTUNServer).to.eql(
      // Setting `options.forceTURN` force sets this value to false.
      skylink._initOptions.forceTURN ? false : options.enableSTUNServer !== false
    );
    // Test returned output.
    expect(response.enableSTUNServer).to.eql(skylink._initOptions.enableSTUNServer);
  });

  /**
   * Tests `success.enableTURNServer`.
   * Defaults: true
   */
  it('Returns success.enableTURNServer correctly', function () {
    // Test the configured settings.
    // Setting `options.forceTURN` force sets this value to true.
    expect(skylink._initOptions.enableTURNServer).to.eql(
      skylink._initOptions.forceTURN ? true : options.enableTURNServer !== false
    );
    // Test returned output.
    expect(response.enableTURNServer).to.eql(skylink._initOptions.enableTURNServer);
  });

  /**
   * Tests `success.audioFallback`.
   * Defaults: false
   */
  it('Returns success.audioFallback correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.audioFallback).to.eql(options.audioFallback === true);
    // Test returned output.
    expect(response.audioFallback).to.eql(skylink._initOptions.audioFallback);
  });

  /**
   * Tests `success.forceSSL`.
   * Defaults: true
   */
  it('Returns success.forceSSL correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.forceSSL).to.eql(options.forceSSL !== false);
    // Test returned output.
    expect(response.forceSSL).to.eql(skylink._initOptions.forceSSL);
  });

  /**
   * Tests `success.socketTimeout`.
   * Defaults: 7000
   * Requires to be defined 5000 and above.
   */
  it('Returns success.socketTimeout correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.socketTimeout).to.eql(
      options.socketTimeout && options.socketTimeout >= 5000 ?
      options.socketTimeout : 7000
    );
    // Test returned output.
    expect(response.socketTimeout).to.eql(skylink._initOptions.socketTimeout);
  });

  /**
   * Tests `success.apiTimeout`.
   * Defaults: 4000
   */
  it('Returns success.apiTimeout correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.apiTimeout).to.eql(options.apiTimeout ? options.apiTimeout : 4000);
    // Test returned output.
    expect(response.apiTimeout).to.eql(skylink._initOptions.apiTimeout);
  });

  /**
   * Tests `success.forceTURNSSL`.
   * Defaults: false
   */
  it('Returns success.forceTURNSSL correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.forceTURNSSL).to.eql(options.forceTURNSSL === true);
    // Test returned output.
    expect(response.forceTURNSSL).to.eql(skylink._initOptions.forceTURNSSL);
  });

  /**
   * Tests `success.forceTURN`.
   * Defaults: false
   */
  it('Returns success.forceTURN correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.forceTURN).to.eql(options.forceTURN === true);
    // Test returned output.
    expect(response.forceTURN).to.eql(skylink._initOptions.forceTURN);
  });

  /**
   * Tests `success.usePublicSTUN`.
   * Defaults: false
   */
  it('Returns success.usePublicSTUN correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.usePublicSTUN).to.eql(options.usePublicSTUN === true);
    // Test returned output.
    expect(response.usePublicSTUN).to.eql(skylink._initOptions.usePublicSTUN);
  });

  /**
   * Tests `success.disableVideoFecCodecs`.
   * Defaults: false
   */
  it('Returns success.disableVideoFecCodecs correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.disableVideoFecCodecs).to.eql(options.disableVideoFecCodecs === true);
    // Test returned output.
    expect(response.disableVideoFecCodecs).to.eql(skylink._initOptions.disableVideoFecCodecs);
  });

  /**
   * Tests `success.disableComfortNoiseCodec`.
   * Defaults: false
   */
  it('Returns success.disableComfortNoiseCodec correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.disableComfortNoiseCodec).to.eql(options.disableComfortNoiseCodec === true);
    // Test returned output.
    expect(response.disableComfortNoiseCodec).to.eql(skylink._initOptions.disableComfortNoiseCodec);
  });

  /**
   * Tests `success.disableREMB`.
   * Defaults: false
   */
  it('Returns success.disableREMB correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.disableREMB).to.eql(options.disableREMB === true);
    // Test returned output.
    expect(response.disableREMB).to.eql(skylink._initOptions.disableREMB);
  });

  /**
   * Tests `success.throttleShouldThrowError`.
   * Defaults: false
   */
  it('Returns success.throttleShouldThrowError correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.throttleShouldThrowError).to.eql(options.throttleShouldThrowError === true);
    // Test returned output.
    expect(response.throttleShouldThrowError).to.eql(skylink._initOptions.throttleShouldThrowError);
  });

  /**
   * Tests `success.mcuUseRenegoRestart`.
   * Defaults: false
   */
  it('Returns success.mcuUseRenegoRestart correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.mcuUseRenegoRestart).to.eql(options.mcuUseRenegoRestart === true);
    // Test returned output.
    expect(response.mcuUseRenegoRestart).to.eql(skylink._initOptions.mcuUseRenegoRestart);
  });

  /**
   * Tests `success.enableSimultaneousTransfers`.
   * Defaults: true
   */
  it('Returns success.enableSimultaneousTransfers correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.enableSimultaneousTransfers).to.eql(options.enableSimultaneousTransfers !== false);
    // Test returned output.
    expect(response.enableSimultaneousTransfers).to.eql(skylink._initOptions.enableSimultaneousTransfers);
  });

  /**
   * Tests `success.priorityWeightScheme`.
   * Defaults: PRIORITY_WEIGHT_SCHEME.AUTO
   */
  it('Returns success.priorityWeightScheme correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.priorityWeightScheme).to.eql(
      utils.constant('PRIORITY_WEIGHT_SCHEME').contains(options.priorityWeightScheme, 'AUTO')
    );
    // Test returned output.
    expect(response.priorityWeightScheme).to.eql(skylink._initOptions.priorityWeightScheme);
  });

  /**
   * Tests `success.TURNServerTransport`.
   * Defaults: TURN_TRANSPORT.ANY
   */
  it('Returns success.TURNServerTransport correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.TURNServerTransport).to.eql(
      utils.constant('TURN_TRANSPORT').contains(options.TURNServerTransport, 'ANY')
    );
    // Test returned output.
    expect(response.TURNTransport).to.eql(skylink._initOptions.TURNServerTransport);
  });

  /**
   * Tests `success.filterCandidatesType.host`.
   * Defaults: false
   */
  it('Returns success.filterCandidatesType.host correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.filterCandidatesType.host).to.eql(
      // Setting `options.forceTURN` force sets this value to true.
      skylink._initOptions.forceTURN || (options.filterCandidatesType && options.filterCandidatesType.host) === true
    );
    // Test returned output.
    expect(response.filterCandidatesType.host).to.eql(skylink._initOptions.filterCandidatesType.host);
  });

  /**
   * Tests `success.filterCandidatesType.srflx`.
   * Defaults: false
   */
  it('Returns success.filterCandidatesType.srflx correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.filterCandidatesType.srflx).to.eql(
      // Setting `options.forceTURN` force sets this value to true.
      skylink._initOptions.forceTURN || (options.filterCandidatesType && options.filterCandidatesType.srflx) === true
    );
    // Test returned output.
    expect(response.filterCandidatesType.srflx).to.eql(skylink._initOptions.filterCandidatesType.srflx);
  });

  /**
   * Tests `success.filterCandidatesType.relay`.
   * Defaults: false
   */
  it('Returns success.filterCandidatesType.relay correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.filterCandidatesType.relay).to.eql(
      // Setting `options.forceTURN` force sets this value to true.
      (!skylink._initOptions.forceTURN && options.filterCandidatesType && options.filterCandidatesType.relay) === true
    );
    // Test returned output.
    expect(response.filterCandidatesType.relay).to.eql(skylink._initOptions.filterCandidatesType.relay);
  });

  /**
   * Tests `success.throttleIntervals.shareScreen`.
   * Defaults: 10000
   */
  it('Returns success.throttleIntervals.shareScreen correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.throttleIntervals.shareScreen).to.eql(
      options.throttleIntervals && typeof options.throttleIntervals.shareScreen === 'number' ?
      options.throttleIntervals.shareScreen : 10000
    );
    // Test returned output.
    expect(response.throttleIntervals.shareScreen).to.eql(skylink._initOptions.throttleIntervals.shareScreen);
  });

  /**
   * Tests `success.throttleIntervals.refreshConnection`.
   * Defaults: 5000
   */
  it('Returns success.throttleIntervals.refreshConnection correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.throttleIntervals.refreshConnection).to.eql(
      options.throttleIntervals && typeof options.throttleIntervals.refreshConnection === 'number' ?
      options.throttleIntervals.refreshConnection : 5000
    );
    // Test returned output.
    expect(response.throttleIntervals.refreshConnection).to.eql(skylink._initOptions.throttleIntervals.refreshConnection);
  });

  /**
   * Tests `success.throttleIntervals.getUserMedia`.
   * Defaults: 0
   */
  it('Returns success.throttleIntervals.getUserMedia correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.throttleIntervals.getUserMedia).to.eql(
      options.throttleIntervals && typeof options.throttleIntervals.getUserMedia === 'number' ?
      options.throttleIntervals.getUserMedia : 0
    );
    // Test returned output.
    expect(response.throttleIntervals.getUserMedia).to.eql(skylink._initOptions.throttleIntervals.getUserMedia);
  });

  /**
   * Tests `success.iceServer`.
   * Defaults: null
   * Returns {JSON} when provided as {Array|String}: { urls: [] }
   */
  it('Returns success.iceServer correctly', function () {
    // Test the configured settings.
    // When provided as `['turn:xxxx1.com', 'turn:xxxx2.com']`. Requires a length greater than 0.
    if (Array.isArray(options.iceServer) && options.iceServer.length > 0) {
      expect(skylink._initOptions.iceServer).to.eql({
        urls: options.iceServer
      });
    // When provided as `'turn:xxxx1.com'`.
    } else if (options.iceServer && typeof options.iceServer === 'string') {
      expect(skylink._initOptions.iceServer).to.eql({
        urls: [options.iceServer]
      });
    // When not provided.
    } else {
      expect(skylink._initOptions.iceServer).to.eql(null);
    }
    // Test returned output.
    expect(response.iceServer).to.eql(skylink._initOptions.iceServer);
  });

  /**
   * Tests `success.socketServer`.
   * Defaults: null
   * Returns {JSON} when provided as {JSON}: { url: 'sig-xxx.com', ports: [443], protocol: 'https:' }
   * Returns {String} when provided as {String}: 'https://sig-xxxx.com:443'
   */
  it('Returns success.socketServer correctly', function () {
    // Test the configured settings.
    // When provided as `{ url: 'sig-xxx.com' }`.
    if (options.socketServer && options.socketServer.url) {
      expect(skylink._initOptions.socketServer.url).to.eql(options.socketServer.url);
      // When provided as `{ ports: [xxx] }`. Requires a length greater than 0.
      expect(skylink._initOptions.socketServer.ports).to.eql(
        Array.isArray(options.socketServer.ports) && 
        // Should it be defined as `[]` or `null`. Ambigious documentation here.
        options.socketServer.ports.length > 0 ? options.socketServer.ports : []
      );
      // When provided as `{ protocol: 'https:' }.
      expect(skylink._initOptions.socketServer.protocol).to.eql(options.socketServer.protocol || null);
    // When provided as `'https://sig-xxx.com'`.
    } else if (options.socketServer && typeof options.socketServer === 'string') {
      expect(skylink._initOptions.socketServer).to.eql(options.socketServer);
    // When not provided.
    } else {
      expect(skylink._initOptions.socketServer).to.eql(null);
    }
    // Test returned output.
    expect(response.socketServer).to.eql(skylink._initOptions.socketServer);
  });

  /**
   * Tests `success.audioCodec`.
   * Defaults: AUDIO_CODEC.AUTO
   */
  it('Returns success.audioCodec correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.audioCodec).to.eql(
      utils.constant('AUDIO_CODEC').contains(options.audioCodec, 'AUTO')
    );
    // Test returned output.
    expect(response.audioCodec).to.eql(skylink._initOptions.audioCodec);
  });

  /**
   * Tests `success.videoCodec`.
   * Defaults: VIDEO_CODEC.AUTO
   */
  it('Returns success.videoCodec correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.videoCodec).to.eql(
      utils.constant('VIDEO_CODEC').contains(options.videoCodec, 'AUTO')
    );
    // Test returned output.
    expect(response.videoCodec).to.eql(skylink._initOptions.videoCodec);
  });

  /**
   * Tests `success.codecParams.video.h264.profileLevelId`.
   * Defaults: null
   */
  it('Returns success.codecParams.video.h264.profileLevelId correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.codecParams.video.h264.profileLevelId).to.eql(
      // When provided as `{ video: { h264: { profileLevelId: 'xxx' } } }`.
      options.codecParams && options.codecParams.video && options.codecParams.video.h264 &&
      options.codecParams.video.h264.profileLevelId ?
      options.codecParams.video.h264.profileLevelId : null
    );
    // Test returned output.
    expect(response.codecParams.video.h264.profileLevelId).to.eql(
      skylink._initOptions.codecParams.video.h264.profileLevelId
    );
  });

  /**
   * Tests `success.codecParams.video.h264.levelAsymmetryAllowed`.
   * Defaults: null
   */
  it('Returns success.codecParams.video.h264.levelAsymmetryAllowed correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.codecParams.video.h264.levelAsymmetryAllowed).to.eql(
      // When provided as `{ video: { h264: { levelAsymmetryAllowed: false } } }`.
      options.codecParams && options.codecParams.video && options.codecParams.video.h264 &&
      typeof options.codecParams.video.h264.levelAsymmetryAllowed === 'boolean' ?
      options.codecParams.video.h264.levelAsymmetryAllowed : null
    );
    // Test returned output.
    expect(response.codecParams.video.h264.levelAsymmetryAllowed).to.eql(
      skylink._initOptions.codecParams.video.h264.levelAsymmetryAllowed
    );
  });

  /**
   * Tests `success.codecParams.video.h264.packetizationMode`.
   * Defaults: null
   */
  it('Returns success.codecParams.video.h264.packetizationMode correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.codecParams.video.h264.packetizationMode).to.eql(
      // When provided as `{ video: { h264: { packetizationMode: 2 } } }`.
      options.codecParams && options.codecParams.video && options.codecParams.video.h264 &&
      typeof options.codecParams.video.h264.packetizationMode === 'number' ?
      options.codecParams.video.h264.packetizationMode : null
    );
    // Test returned output.
    expect(response.codecParams.video.h264.packetizationMode).to.eql(
      skylink._initOptions.codecParams.video.h264.packetizationMode
    );
  });

  /**
   * Tests `success.codecParams.video.vp8.maxFr`.
   * Defaults: null
   */
  it('Returns success.codecParams.video.vp8.maxFr correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.codecParams.video.vp8.maxFr).to.eql(
      // When provided as `{ video: { vp8: { maxFr: 20 } } }`.
      options.codecParams && options.codecParams.video && options.codecParams.video.vp8 &&
      typeof options.codecParams.video.vp8.maxFr === 'number' ?
      options.codecParams.video.vp8.maxFr : null
    );
    // Test returned output.
    expect(response.codecParams.video.vp8.maxFr).to.eql(
      skylink._initOptions.codecParams.video.vp8.maxFr
    );
  });

  /**
   * Tests `success.codecParams.video.vp8.maxFs`.
   * Defaults: null
   */
  it('Returns success.codecParams.video.vp8.maxFs correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.codecParams.video.vp8.maxFs).to.eql(
      // When provided as `{ video: { vp8: { maxFs: 20 } } }`.
      options.codecParams && options.codecParams.video && options.codecParams.video.vp8 &&
      typeof options.codecParams.video.vp8.maxFs === 'number' ?
      options.codecParams.video.vp8.maxFs : null
    );
    // Test returned output.
    expect(response.codecParams.video.vp8.maxFs).to.eql(
      skylink._initOptions.codecParams.video.vp8.maxFs
    );
  });

  /**
   * Tests `success.codecParams.video.vp9.maxFr`.
   * Defaults: null
   */
  it('Returns success.codecParams.video.vp9.maxFr correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.codecParams.video.vp9.maxFr).to.eql(
      // When provided as `{ video: { vp9: { maxFr: 20 } } }`.
      options.codecParams && options.codecParams.video && options.codecParams.video.vp9 &&
      typeof options.codecParams.video.vp9.maxFr === 'number' ?
      options.codecParams.video.vp9.maxFr : null
    );
    // Test returned output.
    expect(response.codecParams.video.vp9.maxFr).to.eql(
      skylink._initOptions.codecParams.video.vp9.maxFr
    );
  });

  /**
   * Tests `success.codecParams.video.vp9.maxFs`.
   * Defaults: null
   */
  it('Returns success.codecParams.video.vp9.maxFs correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.codecParams.video.vp9.maxFs).to.eql(
      // When provided as `{ video: { vp9: { maxFs: 20 } } }`.
      options.codecParams && options.codecParams.video && options.codecParams.video.vp9 &&
      typeof options.codecParams.video.vp9.maxFs === 'number' ?
      options.codecParams.video.vp9.maxFs : null
    );
    // Test returned output.
    expect(response.codecParams.video.vp9.maxFs).to.eql(
      skylink._initOptions.codecParams.video.vp9.maxFs
    );
  });

  /**
   * Tests `success.codecParams.video.vp9.maxFs`.
   * Defaults: null
   */
  it('Returns success.codecParams.video.vp9.maxFs correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.codecParams.video.vp9.maxFs).to.eql(
      // When provided as `{ video: { vp9: { maxFs: 20 } } }`.
      options.codecParams && options.codecParams.video && options.codecParams.video.vp9 &&
      typeof options.codecParams.video.vp9.maxFs === 'number' ?
      options.codecParams.video.vp9.maxFs : null
    );
    // Test returned output.
    expect(response.codecParams.video.vp9.maxFs).to.eql(
      skylink._initOptions.codecParams.video.vp9.maxFs
    );
  });

  /**
   * Tests `success.codecParams.audio.opus.stereo`.
   * Defaults: null
   */
  it('Returns success.codecParams.audio.opus.stereo correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.codecParams.audio.opus.stereo).to.eql(
      // When provided as `{ audio: { opus: { stereo: false } } }`.
      options.codecParams && options.codecParams.audio && options.codecParams.audio.opus &&
      typeof options.codecParams.audio.opus.stereo === 'boolean' ?
      options.codecParams.audio.opus.stereo : null
    );
    // Test returned output.
    expect(response.codecParams.audio.opus.stereo).to.eql(
      skylink._initOptions.codecParams.audio.opus.stereo
    );
  });

  /**
   * Tests `success.codecParams.audio.opus.sprop-stereo`.
   * Defaults: null
   */
  it('Returns success.codecParams.audio.opus.sprop-stereo correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.codecParams.audio.opus['sprop-stereo']).to.eql(
      // When provided as `{ audio: { opus: { sprop-stereo: false } } }`.
      options.codecParams && options.codecParams.audio && options.codecParams.audio.opus &&
      typeof options.codecParams.audio.opus['sprop-stereo'] === 'boolean' ?
      options.codecParams.audio.opus['sprop-stereo'] : null
    );
    // Test returned output.
    expect(response.codecParams.audio.opus['sprop-stereo']).to.eql(
      skylink._initOptions.codecParams.audio.opus['sprop-stereo']
    );
  });

  /**
   * Tests `success.codecParams.audio.opus.usedtx`.
   * Defaults: null
   */
  it('Returns success.codecParams.audio.opus.usedtx correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.codecParams.audio.opus.usedtx).to.eql(
      // When provided as `{ audio: { opus: { usedtx: false } } }`.
      options.codecParams && options.codecParams.audio && options.codecParams.audio.opus &&
      typeof options.codecParams.audio.opus.usedtx === 'boolean' ?
      options.codecParams.audio.opus.usedtx : null
    );
    // Test returned output.
    expect(response.codecParams.audio.opus.usedtx).to.eql(
      skylink._initOptions.codecParams.audio.opus.usedtx
    );
  });

  /**
   * Tests `success.codecParams.audio.opus.useinbandfec`.
   * Defaults: null
   */
  it('Returns success.codecParams.audio.opus.useinbandfec correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.codecParams.audio.opus.useinbandfec).to.eql(
      // When provided as `{ audio: { opus: { useinbandfec: false } } }`.
      options.codecParams && options.codecParams.audio && options.codecParams.audio.opus &&
      typeof options.codecParams.audio.opus.useinbandfec === 'boolean' ?
      options.codecParams.audio.opus.useinbandfec : null
    );
    // Test returned output.
    expect(response.codecParams.audio.opus.useinbandfec).to.eql(
      skylink._initOptions.codecParams.audio.opus.useinbandfec
    );
  });

  /**
   * Tests `success.codecParams.audio.opus.maxplaybackrate`.
   * Defaults: null
   * Range: 8000 - 48000
   */
  it('Returns success.codecParams.audio.opus.maxplaybackrate correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.codecParams.audio.opus.maxplaybackrate).to.eql(
      // When provided as `{ audio: { opus: { maxplaybackrate: 9000 } } }`.
      options.codecParams && options.codecParams.audio && options.codecParams.audio.opus &&
      typeof options.codecParams.audio.opus.maxplaybackrate === 'number' &&
      options.codecParams.audio.opus.maxplaybackrate >= 8000 &&
      options.codecParams.audio.opus.maxplaybackrate <= 48000 ?
      options.codecParams.audio.opus.maxplaybackrate : null
    );
    // Test returned output.
    expect(response.codecParams.audio.opus.maxplaybackrate).to.eql(
      skylink._initOptions.codecParams.audio.opus.maxplaybackrate
    );
  });

  /**
   * Tests `success.codecParams.audio.opus.minptime`.
   * Defaults: null
   */
  it('Returns success.codecParams.audio.opus.minptime correctly', function () {
    // Test the configured settings.
    expect(skylink._initOptions.codecParams.audio.opus.minptime).to.eql(
      // When provided as `{ audio: { opus: { minptime: 10 } } }`.
      options.codecParams && options.codecParams.audio && options.codecParams.audio.opus &&
      typeof options.codecParams.audio.opus.minptime === 'number' ?
      options.codecParams.audio.opus.minptime : null
    );
    // Test returned output.
    expect(response.codecParams.audio.opus.minptime).to.eql(
      skylink._initOptions.codecParams.audio.opus.minptime
    );
  });

};
