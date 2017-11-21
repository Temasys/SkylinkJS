/**
 * Tests the init() method.
 */
describe('init() - Parameters', function() {

  var returnSuccess = {

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
        expect(scope.skylink._initOptions.enableSTUNServer).to.eql(
          // Setting `options.forceTURN` force sets this value to false.
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
            // Check if property value exists.
            for (var property in Skylink.prototype.PRIORITY_WEIGHT_SCHEME) {
              if (Skylink.prototype.PRIORITY_WEIGHT_SCHEME[property] === scope.options.priorityWeightScheme) {
                return scope.options.priorityWeightScheme;
              }
            }
          }

          // Return default property value.
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
            // Check if property value exists.
            for (var property in Skylink.prototype.TURN_TRANSPORT) {
              if (Skylink.prototype.TURN_TRANSPORT[property] === scope.options.TURNServerTransport) {
                return scope.options.TURNServerTransport;
              }
            }
          }

          // Return default property value.
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
        // Test the configured `.host` settings.
        expect(scope.skylink._initOptions.filterCandidatesType.host).to.eql(
          // Setting `options.forceTURN` force sets this value to true.
          scope.skylink._initOptions.forceTURN ? true :
          scope.options.filterCandidatesType.host && scope.options.filterCandidatesType.host === true);
        // Test the configured `.srflx` settings.
        expect(scope.skylink._initOptions.filterCandidatesType.srflx).to.eql(
          // Setting `options.forceTURN` force sets this value to true.
          scope.skylink._initOptions.forceTURN ? true :
          scope.options.filterCandidatesType.srflx && scope.options.filterCandidatesType.srflx === true);
        // Test the configured `.relay` settings.
        expect(scope.skylink._initOptions.filterCandidatesType.relay).to.eql(
          // Setting `options.forceTURN` force sets this value to true.
          scope.skylink._initOptions.forceTURN ? false :
          scope.options.filterCandidatesType.relay && scope.options.filterCandidatesType.relay === true);
        // Test returned `.host` output.
        expect(scope.result.success.filterCandidatesType.host).to.eql(scope.skylink._initOptions.filterCandidatesType.host);
        // Test returned `.srflx` output.
        expect(scope.result.success.filterCandidatesType.srflx).to.eql(scope.skylink._initOptions.filterCandidatesType.srflx);
        // Test returned `.relay` output.
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
        // Test the configured `.shareScreen` settings.
        expect(scope.skylink._initOptions.throttleIntervals.shareScreen).to.eql(
          scope.options.throttleIntervals && scope.options.throttleIntervals.shareScreen ?
          scope.options.shareScreen : 10000);
        // Test the configured `.refreshConnection` settings.
        expect(scope.skylink._initOptions.throttleIntervals.refreshConnection).to.eql(
          scope.options.throttleIntervals && scope.options.throttleIntervals.refreshConnection ?
          scope.options.refreshConnection : 5000);
        // Test the configured `.getUserMedia` settings.
        expect(scope.skylink._initOptions.throttleIntervals.getUserMedia).to.eql(
          scope.options.throttleIntervals && scope.options.throttleIntervals.getUserMedia ?
          scope.options.getUserMedia : 0);
        // Test returned `.shareScreen` output.
        expect(scope.result.success.throttleIntervals.shareScreen).to.eql(scope.skylink._initOptions.throttleIntervals.shareScreen);
        // Test returned `.refreshConnection` output.
        expect(scope.result.success.throttleIntervals.refreshConnection).to.eql(scope.skylink._initOptions.throttleIntervals.refreshConnection);
        // Test returned `.getUserMedia` output.
        expect(scope.result.success.throttleIntervals.getUserMedia).to.eql(scope.skylink._initOptions.throttleIntervals.getUserMedia);
      });
    },

    /**
     * Tests `success.iceServer`.
     * Defaults: null
     * Returned as JSON when configured as Array or String: {
     *   urls: []
     * }
     */
    iceServer: function (scope) {
      it('Configures & returns success.iceServer correctly', function () {
        var output = null;

        // When provided as `['turn:xxxx1.com', 'turn:xxxx2.com']`. Requires a length greater than 0.
        if (Array.isArray(scope.options.iceServer) && scope.options.iceServer.length > 0) {
          output = {
            urls: scope.options.iceServer
          };

        // When provided as `'turn:xxxx1.com'`.
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
     * Returned as String when configured as String: `https://sig-xxxx.com`
     * Returned as JSON when configured as JSON. Requires `.url` to be defined: {
     *   url: 'sig-xxx.com',
     *   ports: [443, 3443],
     *   protocol: 'https:'
     * }
     */
    socketServer: function (scope) {
      it('Configures & returns success.socketServer correctly', function () {
        var output = null;

        // When provided as `{ url: 'sig-xxx.com' }`.
        if (scope.options.socketServer && scope.options.socketServer.url) {
          output = {
            url: scope.options.socketServer.url,
            // When provided as `{ ports: [xxx] }`. Requires a length greater than 0.
            ports: Array.isArray(scope.options.socketServer.ports) &&
              // Should it be defined as `[]` or `null`. Ambigious documentation here.
              scope.options.socketServer.ports.length > 0 ? scope.options.socketServer.ports : [],
            // When provided as `{ protocol: 'https:' }.
            protocol: scope.options.socketServer.protocol || null
          };

        // When provided as `'https://sig-xxx.com'`.
        } else if (scope.options.socketServer && typeof scope.options.socketServer === 'string') {
          output = scope.options.socketServer;
        }

        // Test the configured settings.
        expect(scope.skylink._initOptions.socketServer).to.eql(output);
        // Test returned output.
        expect(scope.result.options.socketServer).to.eql(scope.skylink._initOptions.socketServer);
      });
    },

    /**
     * Tests `success.audioCodec`.
     * Defaults: AUDIO_CODEC.AUTO
     */
    audioCodec: function (scope) {
      it('Configures & returns success.audioCodec correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.audioCodec).to.eql((function () {
          if (scope.options.audioCodec) {
            // Check if property value exists.
            for (var property in Skylink.prototype.AUDIO_CODEC) {
              if (Skylink.prototype.AUDIO_CODEC[property] === scope.options.audioCodec) {
                return scope.options.audioCodec;
              }
            }
          }

          // Return default property value.
          return Skylink.prototype.AUDIO_CODEC.AUTO;
        })());
        // Test returned output.
        expect(scope.result.success.audioCodec).to.eql(scope.skylink._initOptions.audioCodec);
      });
    },

    /**
     * Tests `success.videoCodec`.
     * Defaults: VIDEO_CODEC.AUTO
     */
    videoCodec: function (scope) {
      it('Configures & returns success.videoCodec correctly', function () {
        // Test the configured settings.
        expect(scope.skylink._initOptions.videoCodec).to.eql((function () {
          if (scope.options.videoCodec) {
            // Check if property value exists.
            for (var property in Skylink.prototype.VIDEO_CODEC) {
              if (Skylink.prototype.VIDEO_CODEC[property] === scope.options.videoCodec) {
                return scope.options.videoCodec;
              }
            }
          }

          // Return default property value.
          return Skylink.prototype.VIDEO_CODEC.AUTO;
        })());
        // Test returned output.
        expect(scope.result.success.videoCodec).to.eql(scope.skylink._initOptions.videoCodec);
      });
    },

    /**
     * Tests `success.codecParams`.
     * Defaults: {
     *   video: { h264: {}, vp8: {}, vp9: {} },
     *   audio: { opus: {} }
     * }
     */
    codecParams: function (scope) {
      it('Configures & returns success.codecParams correctly', function () {
        var output = {
          video: { h264: {}, vp8: {}, vp9: {} },
          audio: { opus: {} }
        };

        // When provided as `{ .. }`.
        if (scope.skylink.options.codecParams) {
          // When provided as `{ video: { .. } }`.
          if (scope.skylink.options.codecParams.video) {
            // When provided as `{ video: { h264: { .. } } }`.
            if (scope.skylink.options.codecParams.video.h264) {
              output.video.h264 = {
                // When provided as `{ profileLevelId: 'xxx' }`.
                profileLevelId: scope.skylink.options.codecParams.video.h264.profileLevelId || null,
                // When provided as `{ levelAsymmetryAllowed: false }`.
                levelAsymmetryAllowed: typeof scope.skylink.options.codecParams.video.h264.levelAsymmetryAllowed === 'boolean' ?
                  scope.skylink.options.codecParams.video.h264.levelAsymmetryAllowed : null,
                // When provided as `{ packetizationMode: 1 }`.
                packetizationMode: typeof scope.skylink.options.codecParams.video.h264.packetizationMode === 'number' ?
                  scope.skylink.options.codecParams.video.h264.packetizationMode : null,
              };
            }

            // When provided as `{ video: { vp8: { .. } } }`.
            if (scope.skylink.options.codecParams.video.vp8) {
              output.video.vp8 = {
                // When provided as `{ maxFr: 100 }`.
                maxFr: typeof scope.skylink.options.codecParams.video.vp8.maxFr === 'number' ?
                  scope.skylink.options.codecParams.video.vp8.maxFr : null,
                // When provided as `{ maxFs: 100 }`.
                maxFs: typeof scope.skylink.options.codecParams.video.vp8.maxFs === 'number' ?
                  scope.skylink.options.codecParams.video.vp8.maxFs : null
              };
            }

            // When provided as `{ video: { vp9: { .. } } }`.
            if (scope.skylink.options.codecParams.video.vp9) {
              output.video.vp9 = {
                // When provided as `{ maxFr: 100 }`.
                maxFr: typeof scope.skylink.options.codecParams.video.vp9.maxFr === 'number' ?
                  scope.skylink.options.codecParams.video.vp9.maxFr : null,
                // When provided as `{ maxFs: 100 }`.
                maxFs: typeof scope.skylink.options.codecParams.video.vp9.maxFs === 'number' ?
                  scope.skylink.options.codecParams.video.vp9.maxFs : null
              };
            }
          }

          // When provided as `{ audio: { .. } }`.
          if (scope.skylink.options.codecParams.audio) {
            // When provided as `{ audio: { opus: { .. } } }`.
            if (scope.skylink.options.codecParams.audio.opus) {
              output.audio.opus = {
                // When provided as `{ stereo: false }`.
                stereo: typeof scope.skylink.options.codecParams.audio.opus.stereo === 'boolean' ?
                  scope.skylink.options.codecParams.audio.opus.stereo : null,
                // When provided as `{ sprop-stereo: false }`.
                'sprop-stereo': typeof scope.skylink.options.codecParams.audio.opus['sprop-stereo'] === 'boolean' ?
                  scope.skylink.options.codecParams.audio.opus['sprop-stereo'] : null,
                // When provided as `{ usedtx: false }`.
                usedtx: typeof scope.skylink.options.codecParams.audio.opus.usedtx === 'boolean' ?
                  scope.skylink.options.codecParams.audio.opus.usedtx : null,
                // When provided as `{ useinbandfec: false }`.
                useinbandfec: typeof scope.skylink.options.codecParams.audio.opus.useinbandfec === 'boolean' ?
                  scope.skylink.options.codecParams.audio.opus.useinbandfec : null,
                // When provided as `{ maxplaybackrate: 8000 }`. Range: 8000 - 48000.
                maxplaybackrate: typeof scope.skylink.options.codecParams.audio.opus.maxplaybackrate === 'number' &&
                  scope.skylink.options.codecParams.audio.opus.maxplaybackrate >= 8000 &&
                  scope.skylink.options.codecParams.audio.opus.maxplaybackrate <= 48000 ?
                  scope.skylink.options.codecParams.audio.opus.maxplaybackrate : null,
                // When provided as `{ minptime: 10 }`.
                minptime: typeof scope.skylink.options.codecParams.audio.opus.minptime === 'number' ?
                  scope.skylink.options.codecParams.audio.opus.minptime : null
              };
            }
          }
        }

        // Test the configured settings.
        expect(scope.skylink._initOptions.codecParams).to.eql(output)
        // Test returned output.
        expect(scope.result.success.codecParams).to.eql(scope.skylink._initOptions.codecParams);
      });
    }

  };


  var returnError = {

    /**
     * Tests `error.errorCode`.
     */
    errorCode: function (scope, expected) {

    },

    /**
     * Tests `error.error`.
     */
    error: function (scope) {

    },

    /**
     * Tests `error.status`.
     */
    status: function (scope) {

    }

  };

  /**
   * Tests `init(callback)`
   */
  /*describe('When provided as (callback)', function () {
    var scope = this;

    /**
     * Starts the test.
     */
    /*it('Should return as (error, ...)', function (done) {
      // Stores the init() options.
      scope.config = undefined;
      // Stores the init() callback result.
      scope.result = {};
      // Invokes the init() method.
      scope.skylink = new Skylink();
      scope.skylink.init(function (error, success) {
        scope.result.error = error;
        scope.result.success = success;
        // error should be defined.
        assert.isN(scope.result.error);
        // success should not be defined.
        assert.isNull(scope.result.success);
        done();
      });
    });

    returnError.errorCode(scope);
    returnError.error(scope);
    returnError.status(scope);
  });

  /**
   * Tests `init(appKey, callback)`
   */
  describe('When provided as (appKey, callback)', function () {
    var scope = this;

    /**
     * Starts the test.
     */
    it('Should return as (.., success)', function (done) {
      // Stores the init() options.
      scope.options = config.p2p.appKey;
      // Stores the init() callback result.
      scope.result = {};
      // Invokes the init() method.
      scope.skylink = new Skylink();
      scope.skylink.init(scope.options, function (error, success) {
        scope.result.error = error;
        scope.result.success = success;
        // error should be null.
        assert.isNull(scope.result.error);
        // success should not be null.
        assert.isNotNull(scope.result.success);
        console.error(JSON.stringify(scope.result.success));
        done();
      });
    });

    returnSuccess.appKey(scope);
    returnSuccess.defaultRoom(scope);
    returnSuccess.selectedRoom(scope);

    /*describe('Test defaults parameters', function () {
      returnSuccess.serverUrl(scope);
      returnSuccess.readyState(scope);
      returnSuccess.useEdgeWebRTC(scope);
      returnSuccess.credentials(scope);
      returnSuccess.roomServer(scope);
      returnSuccess.enableIceTrickle(scope);
      returnSuccess.enableDataChannel(scope);
      returnSuccess.enableSTUNServer(scope);
      returnSuccess.enableTURNServer(scope);
      returnSuccess.audioFallback(scope);
      returnSuccess.forceSSL(scope);
      returnSuccess.socketTimeout(scope);
      returnSuccess.apiTimeout(scope);
      returnSuccess.forceTURNSSL(scope);
      returnSuccess.forceTURN(scope);
      returnSuccess.usePublicSTUN(scope);
      returnSuccess.disableVideoFecCodecs(scope);
      returnSuccess.disableComfortNoiseCodec(scope);
      returnSuccess.disableREMB(scope);
      returnSuccess.throttleShouldThrowError(scope);
      returnSuccess.mcuUseRenegoRestart(scope);
      returnSuccess.enableSimultaneousTransfers(scope);
      returnSuccess.priorityWeightScheme(scope);
      returnSuccess.TURNServerTransport(scope);
      returnSuccess.filterCandidatesType(scope);
      returnSuccess.throttleIntervals(scope);
      returnSuccess.iceServer(scope);
      returnSuccess.socketServer(scope);
      returnSuccess.audioCodec(scope);
      returnSuccess.videoCodec(scope);
      returnSuccess.codecParams(scope);
    });*/
  });

  /**
   * Tests `init({ appKey: .. }, callback)`
   */
  /*describe('When provided as ({ appKey: .. }, callback)', function () {
    var scope = this;

    /**
     * Starts the test.
     */
    /*it('Should return as (.., success)', function (done) {
      // Stores the init() options.
      scope.config = {
        appKey: config.p2p.appKey
      };
      // Stores the init() callback result.
      scope.result = {};
      // Invokes the init() method.
      scope.skylink = new Skylink();
      scope.skylink.init(scope.config, function (error, success) {
        scope.result.error = error;
        scope.result.success = success;
        // error should not be defined.
        assert.isUndefined(scope.result.error);
        // success should be defined.
        assert.isDefined(scope.result.success);
        done();
      });
    });

    returnSuccess.appKey(scope);
    returnSuccess.defaultRoom(scope);
    returnSuccess.selectedRoom(scope);
  });

  /**
   * Tests `init({ apiKey: .. }, callback)`
   */
  /*describe('When provided as ({ apiKey: .. }, callback)', function () {
    var scope = this;

    /**
     * Starts the test.
     */
    /*it('Should return as (.., success)', function (done) {
      // Stores the init() options.
      scope.config = {
        apiKey: config.p2p.appKey
      };
      // Stores the init() callback result.
      scope.result = {};
      // Invokes the init() method.
      scope.skylink = new Skylink();
      scope.skylink.init(scope.config, function (error, success) {
        scope.result.error = error;
        scope.result.success = success;
        // error should not be defined.
        assert.isUndefined(scope.result.error);
        // success should be defined.
        assert.isDefined(scope.result.success);
        done();
      });
    });

    returnSuccess.appKey(scope);
    returnSuccess.defaultRoom(scope);
    returnSuccess.selectedRoom(scope);
  });

  /**
   * Tests `init({ appKey: .., defaultRoom: .. }, callback)`
   */
  /*describe('When provided as ({ appKey: .., defaultRoom: .. }, callback)', function () {
    var scope = this;

    /**
     * Starts the test.
     */
    /*it('Should return as (.., success)', function (done) {
      // Stores the init() options.
      scope.config = {
        appKey: config.p2p.appKey,
        defaultRoom: 'test_' + (new Date()).getTime()
      };
      // Stores the init() callback result.
      scope.result = {};
      // Invokes the init() method.
      scope.skylink = new Skylink();
      scope.skylink.init(scope.config, function (error, success) {
        scope.result.error = error;
        scope.result.success = success;
        // error should not be defined.
        assert.isUndefined(scope.result.error);
        // success should be defined.
        assert.isDefined(scope.result.success);
        done();
      });
    });

    returnSuccess.defaultRoom(scope);
    returnSuccess.selectedRoom(scope);
  });


  /**
   * Tests `init({ appKey: .., useEdgeWebRTC: .. }, callback)`
   */
  /*describe('When provided as ({ appKey: .., useEdgeWebRTC: .. }, callback)', function () {
    var scope = this;

    /**
     * Starts the test.
     */
    /*it('Should return as (.., success)', function (done) {
      // Stores the init() options.
      scope.config = {
        appKey: config.p2p.appKey,
        useEdgeWebRTC: true
      };
      // Stores the init() callback result.
      scope.result = {};
      // Invokes the init() method.
      scope.skylink = new Skylink();
      scope.skylink.init(scope.config, function (error, success) {
        scope.result.error = error;
        scope.result.success = success;
        // error should not be defined.
        assert.isUndefined(scope.result.error);
        // success should be defined.
        assert.isDefined(scope.result.success);
        done();
      });
    });

    returnSuccess.useEdgeWebRTC(scope);
  });

  /**
   * Tests `init({ appKey: .., defaultRoom: .. }, callback)`
   */
  /*describe('When provided as ({ appKey: .., defaultRoom: .. }, callback)', function () {
    var scope = this;

    /**
     * Starts the test.
     */
    /*it('Should return as (.., success)', function (done) {
      // Stores the init() options.
      scope.config = {
        appKey: config.p2p.appKey,
        defaultRoom: 'test_' + (new Date()).getTime()
      };
      // Stores the init() callback result.
      scope.result = {};
      // Invokes the init() method.
      scope.skylink = new Skylink();
      scope.skylink.init(scope.config, function (error, success) {
        scope.result.error = error;
        scope.result.success = success;
        // error should not be defined.
        assert.isUndefined(scope.result.error);
        // success should be defined.
        assert.isDefined(scope.result.success);
        done();
      });
    });

    returnSuccess.useEdgeWebRTC(scope);
    returnSuccess.credentials(scope);
    returnSuccess.roomServer(scope);
    returnSuccess.enableIceTrickle(scope);
    returnSuccess.enableDataChannel(scope);
    returnSuccess.enableSTUNServer(scope);
    returnSuccess.enableTURNServer(scope);
    returnSuccess.audioFallback(scope);
    returnSuccess.forceSSL(scope);
    returnSuccess.socketTimeout(scope);
    returnSuccess.apiTimeout(scope);
    returnSuccess.forceTURNSSL(scope);
    returnSuccess.forceTURN(scope);
    returnSuccess.usePublicSTUN(scope);
    returnSuccess.disableVideoFecCodecs(scope);
    returnSuccess.disableComfortNoiseCodec(scope);
    returnSuccess.disableREMB(scope);
    returnSuccess.throttleShouldThrowError(scope);
    returnSuccess.mcuUseRenegoRestart(scope);
    returnSuccess.enableSimultaneousTransfers(scope);
    returnSuccess.priorityWeightScheme(scope);
    returnSuccess.TURNServerTransport(scope);
    returnSuccess.filterCandidatesType(scope);
    returnSuccess.throttleIntervals(scope);
    returnSuccess.iceServer(scope);
    returnSuccess.socketServer(scope);
    returnSuccess.audioCodec(scope);
    returnSuccess.videoCodec(scope);
    returnSuccess.codecParams(scope);
  });*/


});