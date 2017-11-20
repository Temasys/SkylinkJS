/**
 * Tests the init() method.
 */
describe('init()', function() {

  var success = {

    /**
     * Tests `success.selectedRoom`.
     */
    selectedRoom: function (scope) {
      it('Configures & returns success.selectedRoom correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._selectedRoom).to.eql(scope.skylink._initOptions.defaultRoom);
        // Test returned output.
        expect(scope.result.success.selectedRoom).to.eql(scope.skylink._selectedRoom);
      });
    },

    /**
     * Tests `success.serverUrl`.
     */
    serverUrl: function (scope) {
      it('Returns success.serverUrl correctly', function () {
        // Test the returned output to contain the base construct: <room server>/api/<my app key>/<room>
        expect(scope.result.success.serverUrl.indexOf(
          scope.skylink._initOptions.roomServer + '/api/' +
          scope.skylink._initOptions.appKey + '/' +
          scope.skylink._selectedRoom)).to.eql(0);

        // Test the returned output to contain the credentials construct: /<start>/<duration>?cred=<creds>
        if (scope.skylink._initOptions.credentials) {
          expect(scope.result.success.serverUrl).match(new RegExp(
            '.*\/' + scope.skylink._initOptions.credentials.startDateTime + '\/' +
            scope.skylink._initOptions.credentials.duration + '[&|?]cred=' +
            scope.skylink._initOptions.credentials.credentials));
        }
      });
    },

    /**
     * Tests `success.readyState`.
     */
    readyState: function (scope) {
      it('Returns success.readyState correctly', function () {
        // Test the configured readyState.
        expect(scope.skylink._readyState).to.eql(Skylink.prototype.READY_STATE_CHANGE.COMPLETED);
        // Test returned output.
        expect(scope.result.success.readyState).to.eql(scope.skylink._readyState);
      });
    },

    /**
     * Tests `success.appKey`.
     * Requires to be defined always.
     */
    appKey: function (scope) {
      it('Configures & returns success.appKey correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.appKey).to.eql(
          // 1. Use configured `options.appKey` value.
          scope.options.appKey ||
          // 2. Use configured deprecated `options.apiKey` value.
          scope.options.apiKey ||
          // 3. Use `options` as the app key value.
          scope.options);
        // Test returned output.
        expect(scope.result.success.appKey).to.eql(scope.skylink._initOptions.appKey);
      });
    },

    /**
     * Tests `success.defaultRoom`.
     * Defaults: options.appKey
     */
    defaultRoom: function (scope) {
      it('Configures & returns success.defaultRoom correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.defaultRoom).to.eql(
          // 1. Use configured `options.defaultRoom` value.
          scope.options.defaultRoom ||
          // 2. Use configured `options.appKey` value as fallback.
          scope.skylink._initOptions.appKey);
        // Test returned output.
        expect(scope.result.success.defaultRoom).to.eql(scope.skylink._initOptions.defaultRoom);
      });
    },

    /**
     * Tests `success.useEdgeWebRTC`.
     * Defaults: false
     */
    useEdgeWebRTC: function (scope) {
      it('Configures & returns success.useEdgeWebRTC correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.useEdgeWebRTC).to.eql(scope.options.useEdgeWebRTC === true);
        // Test returned output.
        expect(scope.result.success.useEdgeWebRTC).to.eql(scope.skylink._initOptions.useEdgeWebRTC);
      });
    },

    /**
     * Tests `success.credentials`.
     * Defaults: null
     * Requires options.credentials.credentials,
     *   options.credentials.duration and
     *   options.credentials.startDateTime to be defined.
     */
    credentials: function (scope) {
      it('Configures & returns success.credentials correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.credentials).to.eql(
          scope.options.credentials &&
          scope.options.credentials.credentials &&
          scope.options.credentials.duration &&
          scope.options.credentials.startDateTime ? scope.options.credentials : null);
        // Test returned output.
        expect(scope.result.success.credentials).to.eql(scope.skylink._initOptions.credentials);
      });
    },

    /**
     * Tests `success.roomServer`.
     * Defaults: [Set by SDK]
     * Requires to be defined as `//` at the beginning.
     */
    roomServer: function (scope) {
      it('Configures & returns success.roomServer correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.roomServer).to.match(new RegExp(
          scope.options.roomServer && scope.options.roomServer.indexOf('//') === 0 ?
          scope.options.roomServer : '\/\/.*'));
        // Test returned output.
        expect(scope.result.success.roomServer).to.eql(scope.skylink._initOptions.roomServer);
      });
    },

    /**
     * Tests `success.enableIceTrickle`.
     * Defaults: true
     */
    enableIceTrickle: function (scope) {
      it('Configures & returns success.enableIceTrickle correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.enableIceTrickle).to.eql(scope.options.enableIceTrickle !== false);
        // Test returned output.
        expect(scope.result.success.enableIceTrickle).to.eql(scope.skylink._initOptions.enableIceTrickle);
      });
    },

    /**
     * Tests `success.enableDataChannel`.
     * Defaults: true
     */
    enableDataChannel: function (scope) {
      it('Configures & returns success.enableDataChannel correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.enableDataChannel).to.eql(scope.options.enableDataChannel !== false);
        // Test returned output.
        expect(scope.result.success.enableDataChannel).to.eql(scope.skylink._initOptions.enableDataChannel);
      });
    },

    /**
     * Tests `success.enableSTUNServer`.
     * Defaults: true
     */
    enableSTUNServer: function (scope) {
      it('Configures & returns success.enableSTUNServer correctly', function () {
        // Test the configured settings.
        // Setting `options.forceTURN` force sets this value to false.
        expect(scope.skylink._initOptions.enableSTUNServer).to.eql(
          scope.skylink._initOptions.forceTURN ? false : scope.options.enableSTUNServer !== false);
        // Test returned output.
        expect(scope.result.success.enableSTUNServer).to.eql(scope.skylink._initOptions.enableSTUNServer);
      });
    },

    /**
     * Tests `success.enableTURNServer`.
     * Defaults: true
     */
    enableTURNServer: function (scope) {
      it('Configures & returns success.enableTURNServer correctly', function () {
        // Test the configured settings.
        // Setting `options.forceTURN` force sets this value to true.
        expect(scope.skylink._initOptions.enableTURNServer).to.eql(
          scope.skylink._initOptions.forceTURN ? true : scope.options.enableTURNServer !== false);
        // Test returned output.
        expect(scope.result.success.enableTURNServer).to.eql(scope.skylink._initOptions.enableTURNServer);
      });
    },

    /**
     * Tests `success.audioFallback`.
     * Defaults: false
     */
    audioFallback: function (scope) {
      it('Configures & returns success.audioFallback correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.audioFallback).to.eql(scope.options.audioFallback === true);
        // Test returned output.
        expect(scope.result.success.audioFallback).to.eql(scope.skylink._initOptions.audioFallback);
      });
    },

    /**
     * Tests `success.forceSSL`.
     * Defaults: true
     */
    forceSSL: function (scope) {
      it('Configures & returns success.forceSSL correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.forceSSL).to.eql(scope.options.forceSSL !== false);
        // Test returned output.
        expect(scope.result.success.forceSSL).to.eql(scope.skylink._initOptions.forceSSL);
      });
    },

    /**
     * Tests `success.socketTimeout`.
     * Defaults: 7000
     * Requires to be defined 5000 and above.
     */
    socketTimeout: function (scope) {
      it('Configures & returns success.socketTimeout correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.socketTimeout).to.eql(
          scope.options.socketTimeout && scope.options.socketTimeout >= 5000 ?
          scope.options.socketTimeout : 7000);
        // Test returned output.
        expect(scope.result.success.socketTimeout).to.eql(scope.skylink._initOptions.socketTimeout);
      });
    },

    /**
     * Tests `success.apiTimeout`.
     * Defaults: 4000
     */
    apiTimeout: function (scope) {
      it('Configures & returns success.apiTimeout correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.apiTimeout).to.eql(
          scope.options.apiTimeout ? scope.options.apiTimeout : 4000);
        // Test returned output.
        expect(scope.result.success.apiTimeout).to.eql(scope.skylink._initOptions.apiTimeout);
      });
    },

    /**
     * Tests `success.forceTURNSSL`.
     * Defaults: false
     */
    forceTURNSSL: function (scope) {
      it('Configures & returns success.forceTURNSSL correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.forceTURNSSL).to.eql(scope.options.forceTURNSSL === true);
        // Test returned output.
        expect(scope.result.success.forceTURNSSL).to.eql(scope.skylink._initOptions.forceTURNSSL);
      });
    },

    /**
     * Tests `success.forceTURN`.
     * Defaults: false
     */
    forceTURN: function (scope) {
      it('Configures & returns success.forceTURN correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.forceTURN).to.eql(scope.options.forceTURN === true);
        // Test returned output.
        expect(scope.result.success.forceTURN).to.eql(scope.skylink._initOptions.forceTURN);
      });
    },

    /**
     * Tests `success.usePublicSTUN`.
     * Defaults: false
     */
    usePublicSTUN: function (scope) {
      it('Configures & returns success.usePublicSTUN correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.usePublicSTUN).to.eql(scope.options.usePublicSTUN === true);
        // Test returned output.
        expect(scope.result.success.usePublicSTUN).to.eql(scope.skylink._initOptions.usePublicSTUN);
      });
    },

    /**
     * Tests `success.disableVideoFecCodecs`.
     * Defaults: false
     */
    disableVideoFecCodecs: function (scope) {
      it('Configures & returns success.disableVideoFecCodecs correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.disableVideoFecCodecs).to.eql(scope.options.disableVideoFecCodecs === true);
        // Test returned output.
        expect(scope.result.success.disableVideoFecCodecs).to.eql(scope.skylink._initOptions.disableVideoFecCodecs);
      });
    },

    /**
     * Tests `success.disableComfortNoiseCodec`.
     * Defaults: false
     */
    disableComfortNoiseCodec: function (scope) {
      it('Configures & returns success.disableComfortNoiseCodec correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.disableComfortNoiseCodec).to.eql(scope.options.disableComfortNoiseCodec === true);
        // Test returned output.
        expect(scope.result.success.disableComfortNoiseCodec).to.eql(scope.skylink._initOptions.disableComfortNoiseCodec);
      });
    },

    /**
     * Tests `success.disableREMB`.
     * Defaults: false
     */
    disableREMB: function (scope) {
      it('Configures & returns success.disableREMB correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.disableREMB).to.eql(scope.options.disableREMB === true);
        // Test returned output.
        expect(scope.result.success.disableREMB).to.eql(scope.skylink._initOptions.disableREMB);
      });
    },

    /**
     * Tests `success.throttleShouldThrowError`.
     * Defaults: false
     */
    throttleShouldThrowError: function (scope) {
      it('Configures & returns success.throttleShouldThrowError correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.throttleShouldThrowError).to.eql(scope.options.throttleShouldThrowError === true);
        // Test returned output.
        expect(scope.result.success.throttleShouldThrowError).to.eql(scope.skylink._initOptions.throttleShouldThrowError);
      });
    },

    /**
     * Tests `success.mcuUseRenegoRestart`.
     * Defaults: false
     */
    mcuUseRenegoRestart: function (scope) {
      it('Configures & returns success.mcuUseRenegoRestart correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.mcuUseRenegoRestart).to.eql(scope.options.mcuUseRenegoRestart === true);
        // Test returned output.
        expect(scope.result.success.mcuUseRenegoRestart).to.eql(scope.skylink._initOptions.mcuUseRenegoRestart);
      });
    },

    /**
     * Tests `success.enableSimultaneousTransfers`.
     * Defaults: true
     */
    enableSimultaneousTransfers: function (scope) {
      it('Configures & returns success.enableSimultaneousTransfers correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.enableSimultaneousTransfers).to.eql(scope.options.enableSimultaneousTransfers !== false);
        // Test returned output.
        expect(scope.result.success.enableSimultaneousTransfers).to.eql(scope.skylink._initOptions.enableSimultaneousTransfers);
      });
    },

    /**
     * Tests `success.priorityWeightScheme`.
     * Defaults: PRIORITY_WEIGHT_SCHEME.AUTO
     */
    priorityWeightScheme: function (scope) {
      it('Configures & returns success.priorityWeightScheme correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.priorityWeightScheme).to.eql((function () {
          if (scope.options.priorityWeightScheme) {
            for (var property in Skylink.prototype.PRIORITY_WEIGHT_SCHEME) {
              if (Skylink.prototype.PRIORITY_WEIGHT_SCHEME[property] === scope.options.priorityWeightScheme) {
                return scope.options.priorityWeightScheme;
              }
            }
          }

          return Skylink.prototype.PRIORITY_WEIGHT_SCHEME.AUTO;
        })());
        // Test returned output.
        expect(scope.result.success.priorityWeightScheme).to.eql(scope.skylink._initOptions.priorityWeightScheme);
      });
    },

    /**
     * Tests `success.TURNServerTransport`.
     * Defaults: TURN_TRANSPORT.ANY
     */
    TURNServerTransport: function (scope) {
      it('Configures & returns success.TURNServerTransport correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.TURNServerTransport).to.eql((function () {
          if (scope.options.TURNServerTransport) {
            for (var property in Skylink.prototype.TURN_TRANSPORT) {
              if (Skylink.prototype.TURN_TRANSPORT[property] === scope.options.TURNServerTransport) {
                return scope.options.TURNServerTransport;
              }
            }
          }

          return Skylink.prototype.TURN_TRANSPORT.ANY;
        })());
        // Test returned output.
        expect(scope.result.success.TURNTransport).to.eql(scope.skylink._initOptions.TURNServerTransport);
      });
    },

    /**
     * Tests `success.filterCandidatesType`.
     * Defaults: {
     *   host: false,
     *   srflx: false,
     *   relay: false
     * }
     */
    filterCandidatesType: function (scope) {
      it('Configures & returns success.filterCandidatesType correctly', function () {
        // Test the configured settings.
        // Setting `options.forceTURN` force sets this value to true.
        expect(scope.skylink._initOptions.filterCandidatesType.host).to.eql(
          scope.skylink._initOptions.forceTURN ? true :
          scope.options.filterCandidatesType.host && scope.options.filterCandidatesType.host === true);
        // Setting `options.forceTURN` force sets this value to true.
        expect(scope.skylink._initOptions.filterCandidatesType.srflx).to.eql(
          scope.skylink._initOptions.forceTURN ? true :
          scope.options.filterCandidatesType.srflx && scope.options.filterCandidatesType.srflx === true);
        // Setting `options.forceTURN` force sets this value to false.
        expect(scope.skylink._initOptions.filterCandidatesType.relay).to.eql(
          scope.skylink._initOptions.forceTURN ? false :
          scope.options.filterCandidatesType.relay && scope.options.filterCandidatesType.relay === true);
        // Test returned output.
        expect(scope.result.success.filterCandidatesType.host).to.eql(scope.skylink._initOptions.filterCandidatesType.host);
        expect(scope.result.success.filterCandidatesType.srflx).to.eql(scope.skylink._initOptions.filterCandidatesType.srflx);
        expect(scope.result.success.filterCandidatesType.relay).to.eql(scope.skylink._initOptions.filterCandidatesType.relay);
      });
    },

    /**
     * Tests `success.throttleIntervals`.
     * Defaults: {
     *   shareScreen: 10000,
     *   refreshConnection: 5000,
     *   getUserMedia: 0
     * }
     */
    throttleIntervals: function (scope) {
      it('Configures & returns success.throttleIntervals correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.throttleIntervals.shareScreen).to.eql(
          scope.options.throttleIntervals && scope.options.throttleIntervals.shareScreen ?
          scope.options.shareScreen : 10000);
        expect(scope.skylink._initOptions.throttleIntervals.refreshConnection).to.eql(
          scope.options.throttleIntervals && scope.options.throttleIntervals.refreshConnection ?
          scope.options.refreshConnection : 5000);
        expect(scope.skylink._initOptions.throttleIntervals.getUserMedia).to.eql(
          scope.options.throttleIntervals && scope.options.throttleIntervals.getUserMedia ?
          scope.options.getUserMedia : 0);
        // Test returned output.
        expect(scope.result.success.throttleIntervals.shareScreen).to.eql(scope.skylink._initOptions.throttleIntervals.shareScreen);
        expect(scope.result.success.throttleIntervals.refreshConnection).to.eql(scope.skylink._initOptions.throttleIntervals.refreshConnection);
        expect(scope.result.success.throttleIntervals.getUserMedia).to.eql(scope.skylink._initOptions.throttleIntervals.getUserMedia);
      });
    },

    /**
     * Tests `success.iceServer`.
     * Defaults: null
     * Returned as `{ urls: [] }` when configured.
     */
    iceServer: function (scope) {
      it('Configures & returns success.iceServer correctly', function () {
        var output = null;

        // When provided as `['xxxx', 'xxxx']`. Requires a length greater than 0.
        if (Array.isArray(scope.options.iceServer) && scope.options.iceServer.length > 0) {
          output = {
            urls: scope.options.iceServer
          };

        // When provided as `'xxxx'`.
        } else if (scope.options.iceServer && typeof scope.options.iceServer === 'string') {
          output = {
            urls: [scope.options.iceServer]
          };
        }

        // Test the configured settings.
        expect(scope.skylink._initOptions.iceServer).to.eql(output);
        // Test returned output.
        expect(scope.result.options.iceServer).to.eql(scope.skylink._initOptions.iceServer);
      });
    },

    /**
     * Tests `success.socketServer`.
     * Defaults: null
     * Returned as `{ url: 'xxx', ports: [xx, xx], transports: [xx, xx] }` or as `'xxx'` as configured.
     */
    socketServer: function (scope) {
      it('Configures & returns success.socketServer correctly', function () {
        var output = null;

        // When provided as `['xxxx', 'xxxx']`. Requires a length greater than 0.
        if (Array.isArray(scope.options.iceServer) && scope.options.iceServer.length > 0) {
          output = {
            urls: scope.options.iceServer
          };

        // When provided as `'xxxx'`.
        } else if (scope.options.iceServer && typeof scope.options.iceServer === 'string') {
          output = {
            urls: [scope.options.iceServer]
          };
        }

        // Test the configured settings.
        expect(scope.skylink._initOptions.iceServer).to.eql(output);
        // Test returned output.
        expect(scope.result.options.iceServer).to.eql(scope.skylink._initOptions.iceServer);
      });
    },

  }


  function successFields (scope, options) {

    // Tests success.roomServer
    it('Returned success.roomServer is configured correctly', function () {
      var roomServer = scope.config.roomServer || scope.result.success.roomServer;

      expect(scope.result.success.credentials).to.eql(roomServer);
      expect(scope.skylink._initOptions.credentials).to.eql(roomServer);
    });

"socketServer":null,"audioCodec":"auto","videoCodec":"auto","codecParams":{"audio":{"opus":{"stereo":null,"sprop-stereo":null,"usedtx":null,"useinbandfec":null,"maxplaybackrate":null,"minptime":null}},"video":{"h264":{"profileLevelId":null,"levelAsymmetryAllowed":null,"packetizationMode":null},"vp8":{"maxFs":null,"maxFr":null},"vp9":{"maxFs":null,"maxFr":null}}}}


  }

  /**
   * Tests `init(appKey)`
   */
  describe('When provided as (appKey)', function () {
    var scope = this;
    scope.skylink = new Skylink();
    scope.config = {
      appKey: config.p2p.appKey
    };

    before(function (done) {
      skylink.init(scope.config.appKey, function (error, success) {
        scope.result.error = error;
        scope.result.success = success;
        done();
      });
    });

    fields.appKey(scope);


    successFields(scope);
  });



  /*describe('Error cases', function () {

    it('When app key is invalid', function (done) {
      var skylink = new Skylink();
      var testKey = appkeys.p2p.id + '-1';
      var states = [];

      skylink.on('readyStateChange', function (readyState, error, room) {

        states.push({
          readyState: readyState,
          error: error,
          room: room
        });

      });

      skylink.init(testKey, function (error, success) {

        it('readyStateChange[0] is INIT', function () {
          expect(states[0].readyState).to.eql(Skylink.prototype.READY_STATE_CHANGE.INIT);
          expect(states[0].error).to.eql(null);
          expect(states[0].room).to.eql(testKey);
        });

        it('readyStateChange[1] is ERROR', function () {
          expect(states[0].readyState).to.eql(Skylink.prototype.READY_STATE_CHANGE.ERROR);
          expect(states[0].error.status).to.not.eql(200);
          assert.isNumber(states[0].error.errorCode);
          assert.ifError(states[0].error.content);
          expect(states[0].room).to.eql(testKey);
        });

        done();

      });

    });

  });*/

});