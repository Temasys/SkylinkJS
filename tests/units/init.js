/**
 * Tests the `init()` method.
 */
describe('init()', function() {

  /**
   * Test parameters.
   */
  describe('Parameters', function () {

    /**
     * Parameters: `init(undefined)`
     * Result: Error
     */
    describe('When provided as (undefined)', function () {
      var options = undefined;

      test.init.error(options, {
        errorCode: Skylink.prototype.READY_STATE_CHANGE_ERROR.NO_PATH,
        status: -2
      });
    });

    /**
     * Parameters: `init([String])`.
     * Result: Success
     */
    describe('When provided as ([String])', function () {
      var options = configs.p2p.appKey;

      test.init.success(options);
    });

    /**
     * Parameters: `init({})`.
     * Result: Error
     */
    describe('When provided as ({})', function () {
      var options = {};

      test.init.error(options, {
        errorCode: Skylink.prototype.READY_STATE_CHANGE_ERROR.NO_PATH,
        status: -2
      });
    });

    /**
     * Parameters: `init({ appKey: [String] })`.
     * Result: Success
     */
    describe('When provided as ({ appKey: [String] })', function () {
      var options = {
        appKey: configs.p2p.appKey
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ apiKey: [String] })`. This is deprecated.
     * Result: Success
     */
    describe('When provided as deprecated ({ apiKey: [String] })', function () {
      var options = {
        apiKey: configs.p2p.appKey
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ defaultRoom: [String] })`.
     * Result: Success
     */
    describe('When provided as ({ defaultRoom: [String] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        defaultRoom: 'test_' + (new Date()).getTime()
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ useEdgeWebRTC: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ useEdgeWebRTC: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        useEdgeWebRTC: true
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ credentials: [JSON] })`.
     * Result: Success
     */
    describe('When provided as ({ credentials: [JSON] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        defaultRoom: 'test_12345',
        credentials: {
          startDateTime: (new Date()).toISOString(),
          duration: 22,
          credentials: null
        }
      };

      options.credentials.credentials = encodeURIComponent(
        CryptoJS.HmacSHA1(
          options.defaultRoom + '_' + options.credentials.duration + '_' + options.credentials.startDateTime,
          configs.p2p.secret
        ).toString(CryptoJS.enc.Base64)
      );

      test.init.success(options);
    });

    /**
     * Parameters: `init({ roomServer: [String] })`.
     * Result: Success
     */
    describe('When provided as ({ roomServer: [String] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        roomServer: '//api.temasys.com.sg'
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ enableIceTrickle: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ enableIceTrickle: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        enableIceTrickle: false
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ enableDataChannel: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ enableDataChannel: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        enableDataChannel: false
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ enableSTUNServer: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ enableSTUNServer: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        enableSTUNServer: false
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ enableTURNServer: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ enableTURNServer: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        enableTURNServer: false
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ audioFallback: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ audioFallback: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        audioFallback: true
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ forceSSL: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ forceSSL: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        forceSSL: false
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ socketTimeout: [Number] })`.
     * Result: Success
     */
    describe('When provided as ({ socketTimeout: [Number] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        socketTimeout: 15100
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ apiTimeout: [Number] })`.
     * Result: Success
     */
    describe('When provided as ({ apiTimeout: [Number] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        apiTimeout: 1000
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ forceTURNSSL: [Boolean] })`
     * Result: Success
     */
    describe('When provided as ({ forceTURNSSL: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        forceTURNSSL: true
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ forceTURN: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ forceTURN: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        forceTURN: true,
        enableSTUNServer: true,
        enableTURNServer: false,
        filterCandidatesType: {
          srflx: false,
          relay: true,
          host: false
        }
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ usePublicSTUN: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ usePublicSTUN: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        usePublicSTUN: true
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ disableVideoFecCodecs: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ disableVideoFecCodecs: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        disableVideoFecCodecs: true
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ disableComfortNoiseCodec: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ disableComfortNoiseCodec: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        disableComfortNoiseCodec: true
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ disableREMB: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ disableREMB: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        disableREMB: true
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ throttleShouldThrowError: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ throttleShouldThrowError: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        throttleShouldThrowError: true
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ mcuUseRenegoRestart: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ mcuUseRenegoRestart: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        mcuUseRenegoRestart: true
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ enableSimultaneousTransfers: [Boolean] })`.
     * Result: Success
     */
    describe('When provided as ({ enableSimultaneousTransfers: [Boolean] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        enableSimultaneousTransfers: false
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ priorityWeightScheme: [String] })`.
     * Result: Success
     */
    describe('When provided as ({ priorityWeightScheme: [String] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        priorityWeightScheme: Skylink.prototype.PRIORITY_WEIGHT_SCHEME.ENFORCE_OFFERER
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ TURNServerTransport: [String] })`.
     * Result: Success
     */
    describe('When provided as ({ TURNServerTransport: [String] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        TURNServerTransport: Skylink.prototype.TURN_TRANSPORT.UDP
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ filterCandidatesType: [JSON] })`.
     * Result: Success
     */
    describe('When provided as ({ filterCandidatesType: [JSON] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        filterCandidatesType: {
          host: true,
          srflx: true,
          relay: true
        }
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ throttleIntervals: [JSON] })`.
     * Result: Success
     */
    describe('When provided as ({ throttleIntervals: [JSON] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        throttleIntervals: {
          getUserMedia: 1000,
          shareScreen: 500,
          refreshConnection: 12000
        }
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ iceServer: [String] })`.
     * Result: Success
     */
    describe('When provided as ({ iceServer: [String] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        iceServer: 'turn:turn.test-1.com'
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ iceServer: [JSON] })`.
     * Result: Success
     */
    describe('When provided as ({ iceServer: [JSON] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        iceServer: ['turn:turn.test-1.com', 'turn:turn.test-2.com']
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ socketServer: {} })`.
     * Result: Success
     */
    describe('When provided as ({ socketServer: {} })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        socketServer: {}
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ socketServer: { url: [String] } })`.
     * Result: Success
     */
    describe('When provided as ({ socketServer: { url: [String] } })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        socketServer: {
          url: 'signaling.temasys.com.sg',
          protocol: 'http:',
          ports: [542, 3782]
        }
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ socketServer: [String] })`.
     * Result: Success
     */
    describe('When provided as ({ socketServer: [String] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        socketServer: 'https://signaling.temasys.com.sg:3443'
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ audioCodec: [String] })`.
     * Result: Success
     */
    describe('When provided as ({ audioCodec: [String] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        audioCodec: Skylink.prototype.AUDIO_CODEC.OPUS
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ videoCodec: [String] })`.
     * Result: Success
     */
    describe('When provided as ({ videoCodec: [String] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        videoCodec: Skylink.prototype.VIDEO_CODEC.H264
      };

      test.init.success(options);
    });

    /**
     * Parameters: `init({ codecParams: [JSON] })`.
     * Result: Success
     */
    describe('When provided as ({ codecParams: [JSON] })', function () {
      var options = {
        appKey: configs.p2p.appKey,
        codecParams: {
          audio: {},
          video: {}
        }
      };

      options.codecParams.audio.opus = {
        stereo: true,
        'sprop-stereo': 123123,
        maxplaybackrate: 7000,
        minptime: 50,
        useinbandfec: true,
        usedtx: true
      };

      options.codecParams.video.h264 = {
        profileLevelId: 'xxxx',
        packetizationMode: 2,
        levelAsymmetryAllowed: false
      };

      options.codecParams.video.vp8 = {
        maxFr: false,
        maxFs: 23,
      };

      options.codecParams.video.vp9 = {
        maxFr: 'str',
        maxFs: 123
      };

      test.init.success(options);
    });

  });

  /**
   * Test scenarios.
   */
  describe('Scenarios', function () {

    /**
     * Scenario: App key is invalid.
     */
    describe('When invalid app key is provided', function () {
      var options = configs.p2p.appKey + '-invalid';

      test.init.error(options, {
        errorCode: 404,
        status: 404
      });
    });

    /**
     * Scenario: Parsing of codecs failed.
     *           Works only for Chrome, Opera, Safari & IE (plugin).
     * Result: Error
     */
    describe('When parsing of codecs failed', function () {
      var cached = Skylink.prototype._getCodecsSupport;
      var options = configs.p2p.appKey;

      before(function () {
        Skylink.prototype._getCodecsSupport = function (callback) {
          callback(new Error('Failed parsing codecs...'));
        };
      });

      test.init.error(options, {
        errorCode: Skylink.prototype.READY_STATE_CHANGE_ERROR.PARSE_CODECS,
        status: -2
      });

      after(function () {
        Skylink.prototype._getCodecsSupport = cached;
      });
    });

    /**
     * Scenario: No codecs are supported.
     *           Works only for Chrome, Opera, Safari & IE (plugin).
     * Result: Error
     */
    describe('When there are no codecs supported', function () {
      var cached = Skylink.prototype._getCodecsSupport
      var options = configs.p2p.appKey;

      before(function () {
        Skylink.prototype._getCodecsSupport = function (callback) {
          this._currentCodecSupport = { audio: {}, video: {} };
          callback(null);
        };
      });

      test.init.error(options, {
        errorCode: Skylink.prototype.READY_STATE_CHANGE_ERROR.PARSE_CODECS,
        status: -2
      });

      after(function () {
        Skylink.prototype._getCodecsSupport = cached;
      });
    });

    /**
     * Scenario: XMLHttpRequest returns error.
     * Result: Error
     */
    describe('When XMLHttpRequest returns error', function () {
      var cached = XMLHttpRequest;
      var options = configs.p2p.appKey;

      before(function () {
        XMLHttpRequest = function () {
          var self = this;
          self.open = function () {};
          self.setContentType = function () {};
          self.send = function () {
            setTimeout(function () {
              self.onerror();
            }, 0);
          };
        };
      });

      test.init.error(options, {
        errorCode: Skylink.prototype.READY_STATE_CHANGE_ERROR.XML_HTTP_REQUEST_ERROR,
        status: -1
      });

      after(function () {
        XMLHttpRequest = cached;
      });
    });

    /**
     * Scenario: XMLHttpRequest timeout.
     * Result: Error
     */
    describe('When XMLHttpRequest timeout', function () {
      var cached = XMLHttpRequest.prototype.send;
      var options = {
        appKey: configs.p2p.appKey,
        apiTimeout: 500
      };

      before(function () {
        XMLHttpRequest.prototype.send = function () {};
      });

      test.init.error(options, {
        errorCode: Skylink.prototype.READY_STATE_CHANGE_ERROR.XML_HTTP_NO_REPONSE_ERROR,
        status: -1
      });

      after(function () {
        XMLHttpRequest.prototype.send = cached;
      });
    });

    /**
     * Scenario: XMLHttpRequest returns empty response.
     * Result: Error
     */
    describe('When XMLHttpRequest returns empty response', function () {
      var cached = XMLHttpRequest.prototype.send;
      var options = configs.p2p.appKey;

      before(function () {
        XMLHttpRequest.prototype.send = function () {
          this.onload();
        };
      });

      test.init.error(options, {
        errorCode: 400,
        status: 400
      });

      after(function () {
        XMLHttpRequest.prototype.send = cached;
      });
    });

    /**
     * Scenario: AdapterJS is not loaded.
     * Result: Error
     */
    describe('When AdapterJS is not loaded', function () {
      var cached = AdapterJS;
      var options = configs.p2p.appKey;

      before(function () {
        AdapterJS = null;
      });

      test.init.error(options, {
        errorCode: Skylink.prototype.READY_STATE_CHANGE_ERROR.ADAPTER_NO_LOADED,
        status: -2
      });

      after(function () {
        AdapterJS = cached;
      });
    });

    /**
     * Scenario: socket.io-client is not loaded.
     * Result: Error
     */
    describe('When socket.io-client is not loaded', function () {
      var cached = io;
      var options = configs.p2p.appKey;

      before(function () {
        io = null;
      });

      test.init.error(options, {
        errorCode: Skylink.prototype.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO,
        status: -2
      });

      after(function () {
        io = cached;
      });
    });

    /**
     * Scenario: XMLHttpRequest API is not available.
     * Result: Error
     */
    describe('When XMLHttpRequest API is not available', function () {
      var cached = XMLHttpRequest;
      var options = configs.p2p.appKey;

      before(function () {
        XMLHttpRequest = null;
      });

      test.init.error(options, {
        errorCode: Skylink.prototype.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT,
        status: -2
      });

      after(function () {
        XMLHttpRequest = cached;
      });
    });

    /**
     * Scenario: RTCPeerConnection API is not available.
     * Result: Error
     */
    describe('When RTCPeerConnection API is not available', function () {
      var cached = RTCPeerConnection;
      var options = configs.p2p.appKey;

      before(function () {
        RTCPeerConnection = null;
      });

      test.init.error(options, {
        errorCode: Skylink.prototype.READY_STATE_CHANGE_ERROR.NO_WEBRTC_SUPPORT,
        status: -2
      });

      after(function () {
        RTCPeerConnection = cached;
      });
    });

  });

});