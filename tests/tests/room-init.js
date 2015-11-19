(function() {

'use strict';

// Dependencies
var exports = require('../config.js');
var test = require('tape');
var sw = new Skylink();
var CryptoJS = require('crypto-js');


test('#constant_READY_STATE_CHANGE', function (t) {
  t.plan(3);

  t.deepEqual(typeof sw.READY_STATE_CHANGE, 'object', 'To be defined');
  t.deepEqual(sw.READY_STATE_CHANGE, {
    INIT: 0,
    LOADING: 1,
    COMPLETED: 2,
    ERROR: -1
  }, 'To match documentation for any changes');
  t.deepEqual(sw._readyState, sw.READY_STATE_CHANGE.INIT, 'Defaults is set correctly');

});

test('#constant_READY_STATE_CHANGE_ERROR', function (t) {
  t.plan(2);

  t.deepEqual(typeof sw.READY_STATE_CHANGE_ERROR, 'object', 'To be defined');
  t.deepEqual(sw.READY_STATE_CHANGE_ERROR, {
    API_INVALID: 4001,
    API_DOMAIN_NOT_MATCH: 4002,
    API_CORS_DOMAIN_NOT_MATCH: 4003,
    API_CREDENTIALS_INVALID: 4004,
    API_CREDENTIALS_NOT_MATCH: 4005,
    API_INVALID_PARENT_KEY: 4006,
    API_NO_MEETING_RECORD_FOUND: 4010,
    XML_HTTP_REQUEST_ERROR: -1,
    NO_SOCKET_IO: 1,
    NO_XMLHTTPREQUEST_SUPPORT: 2,
    NO_WEBRTC_SUPPORT: 3,
    NO_PATH: 4,
    ADAPTER_NO_LOADED: 7
  }, 'To match documentation for any changes');

});

/* Deprecated */
test('#constant_REGIONAL_SERVER', function (t) {
  t.plan(3);

  t.deepEqual(typeof sw.REGIONAL_SERVER, 'object', 'To be defined');
  t.deepEqual(sw.REGIONAL_SERVER, {
    APAC1: 'sg',
    US1: 'us2'
  }, 'To match documentation for any changes');
  t.deepEqual(sw._serverRegion, null,' Defaults is set correctly');

});

test('#method_init()', function(t) {
  t.plan(2);//(3);

  t.test('Testing parameters', function (st) {
    st.plan(4);

    st.test('When parameters is ()', function (sst) {
      sst.plan(1);

      var called = false;
      sw.on('readyStateChange', function () {
        called = true;
      });

      sw.init();

      setTimeout(function () {
        sw.off('readyStateChange');
        sst.deepEqual(called, false, 'Does not trigger event');
      }, 1000);
    });

    st.test('When parameters is (callback)', function (sst) {
      sst.plan(1);

      var called = false;
      sw.on('readyStateChange', function () {
        called = true;
      });

      sw.init(function () {});

      setTimeout(function () {
        sw.off('readyStateChange');
        sst.deepEqual(called, false, 'Does not trigger event');
      }, 1000);
    });

    st.test('When parameters is (options)', function (sst) {
      sst.plan(2);

      // NOTE: without waiting can throw an error to the other connection..
      sw.on('readyStateChange', function (state) {
        if (state === sw.READY_STATE_CHANGE.COMPLETED) {
          sw.off('readyStateChange');
          sst.pass('Triggers event');
          sst.pass('Triggers completed since its valid');
        }
      });

      sw.init(apikey);
    });

    st.test('When parameters is (options, callback)', function (sst) {
      sst.plan(2);

      sw.on('readyStateChange', function (state) {
        if (state === sw.READY_STATE_CHANGE.COMPLETED) {
          sw.off('readyStateChange');
          sst.pass('Triggers event');
          sst.pass('Triggers completed since its valid');
        }
      });

      sw.init(apikey, function () {});
    });
  });

  t.test('Testing callback error states', function(st) {
    st.plan(5);

    var testItem = function(options) {
      st.test('When options is ' + JSON.stringify(options), function(sst) {
        sst.plan(2);

        var states = [];
        var expected = {
          errorCode: sw.READY_STATE_CHANGE_ERROR.API_INVALID,
          error: 'object',
          status: 401
        };

        sw.init(options, function(err, success) {
          console.info('hey there', err, success);
          if (err) {
            sst.deepEqual(success, null, 'Success should be empty');
            sst.deepEqual({
              errorCode: err.errorCode,
              error: typeof err.error,
              status: err.status
            }, expected, 'Should match expected error');
          } else {
            sst.fail('Received success instead of error ' + JSON.stringify(success));
            sst.end();
          }
        });
      });
    };

    testItem('fake one');
    testItem({
      apiKey: 'fake'
    });
    testItem({
      appKey: 'fake',
      apiKey: apikey
    });
    testItem({
      appKey: 'sofake',
      apiKey: 'fake'
    });
    testItem({
      appKey: null
    });
  });

  /*t.test('Testing callback success states', function(st) {
    st.plan(25);

    var testItem = function(options) {
      st.test('When options is ' + JSON.stringify(options), function(sst) {
        sst.plan(7);

        var expected = {
          appKey: apikey,
          defaultRoom: apikey,
          roomServer: '//api.temasys.com.sg',
          region: null,
          enableIceTrickle: true,
          enableDataChannel: true,
          enableTURNServer: true,
          enableSTUNServer: true,
          TURNServerTransport: sw.TURN_TRANSPORT.ANY,
          audioFallback: false,
          forceSSL: false,
          forceTURNSSL: false,
          socketTimeout: 5000,
          audioCodec: sw.AUDIO_CODEC.AUTO,
          videoCodec: sw.VIDEO_CODEC.AUTO,
          forceTURN: false,
          usePublicSTUN: true
        };

        var keys = Object.keys(options) || [];

        // for only options.apiKey and where options === appKey case
        if (typeof options === 'string') {
          keys.push('appKey');
          options = {
            appKey: options
          };
        } else if (keys.indexOf('apiKey') > -1 && keys.indexOf('appKey') === -1) {
          keys.push('appKey');
          options.appKey = options.apiKey;
        }

        for (var i = 0; i < keys.length; i++) {
          if (expected.hasOwnProperty(keys[i])) {
            expected[keys[i]] = options[keys[i]];
          }
        }

        // reset to default if option.roomServer is not provided
        if (options && typeof options.roomServer !== 'string') {
          sw._roomServer = expected.roomServer;
        }

        // forceTURN makes enableSTUNServer === false
        if (options.forceTURN === true) {
          expected.enableSTUNServer = false;
        }

        sw.init(options, function(err, success) {
          if (err) {
            sst.fail('Received error instead of success ' + JSON.stringify(err));
            sst.end();
          } else {
            var expectedCreds = {
              duration: null,
              startDateTime: null,
              credentials: null
            };

            if (options.credentials &&
              typeof options.credentials.credentials === 'string' &&
              typeof options.credentials.duration === 'number' &&
              typeof options.credentials.startDateTime === 'string') {
              expectedCreds.credentials = options.credentials.credentials;
              expectedCreds.duration = options.credentials.duration;
              expectedCreds.startDateTime = options.credentials.startDateTime;
            }

            expected.TURNTransport = expected.TURNServerTransport;
            delete expected.TURNServerTransport;
            expected.serverRegion = expected.region;
            delete expected.region;
            expected.selectedRoom = expected.defaultRoom;
            expected.readyState = 2;
            expected.serverUrl = sw._path;

            sst.deepEqual(err, null, 'Error should be empty');
            sst.deepEqual(success, expected, 'Should match provided options');
            sst.ok(success.serverUrl.indexOf('rand') > -1, 'Should have a "rand" query in path');
            sst.deepEqual({
              duration: sw._roomDuration,
              startDateTime: sw._roomStart,
              credentials: sw._roomCredentials
            }, expectedCreds, (function () {
              if (expectedCreds.credentials === null) {
                return 'Should have empty credentials';
              } else {
                return 'Should match provided credentials';
              }
            })());

            var checkCredPath = expectedCreds.credentials && expectedCreds.duration && expectedCreds.startDateTime;

            sst.ok(success.serverUrl.split('?')[0], expected.roomServer + '/api/' + expected.appKey + '/' + expected.defaultRoom,
              'Should have a valid constructed path');

            if (checkCredPath) {
              sst.ok(success.serverUrl.indexOf('cred') > -1, 'Should have a "cred" query in path');
            } else {
              sst.ok(success.serverUrl.indexOf('cred') === -1, 'Should not have a "cred" query in path');
            }

            if (options.region) {
              sst.ok(success.serverUrl.indexOf('rg') > -1, 'Should have a "rg" query in path');
            } else {
              sst.ok(success.serverUrl.indexOf('rg') === -1, 'Should not have a "rg" query in path');
            }
          }
        });
      });
    };

    testItem({
      appKey: apikey
    });
    testItem({
      appKey: apikey,
      apiKey: apikey
    });
    testItem({
      appKey: apikey,
      apiKey: 'fake one'
    });
    testItem({
      apiKey: apikey
    });
    testItem({
      appKey: apikey,
      defaultRoom: 'mydefault'
    });
    testItem({
      appKey: apikey,
      region: sw.REGIONAL_SERVER.US1
    });
    testItem({
      appKey: apikey,
      roomServer: '//developer.temasys.com.sg'
    });
    testItem({
      appKey: apikey,
      enableIceTrickle: false
    });
    testItem({
      appKey: apikey,
      enableDataChannel: false
    });
    testItem({
      appKey: apikey,
      enableTURNServer: false
    });
    testItem({
      appKey: apikey,
      enableSTUNServer: false
    });
    testItem({
      appKey: apikey,
      TURNServerTransport: sw.TURN_TRANSPORT.ALL
    });
    testItem({
      appKey: apikey,
      forceSSL: true
    });
    testItem({
      appKey: apikey,
      forceTURNSSL: true
    });
    testItem({
      appKey: apikey,
      socketTimeout: 12000
    });
    testItem({
      appKey: apikey,
      audioFallback: true
    });
    testItem({
      appKey: apikey,
      videoCodec: sw.VIDEO_CODEC.VP8
    });
    testItem({
      appKey: apikey,
      audioCodec: sw.AUDIO_CODEC.OPUS
    });
    testItem({
      appKey: apikey,
      forceTURN: true
    });
    testItem({
      appKey: apikey,
      usePublicSTUN: false
    });
    testItem({
      appKey: apikey,
      credentials: {}
    });
    testItem({
      appKey: apikey,
      credentials: {
        credentials: 'xxx'
      }
    });
    testItem({
      appKey: apikey,
      credentials: {
        credentials: 'xxx',
        duration: 2
      }
    });
    testItem({
      appKey: apikey,
      credentials: {
        credentials: 'xxx',
        duration: '2',
        startDateTime: (new Date()).toISOString()
      }
    });
    testItem({
      appKey: apikey,
      credential: (function() {
        var len = Math.random() * 10;
        var start = new Date();
        var concatenatedString = 'theroom_' + len + '_' + start.toISOString();
        var hash = CryptoJS.HmacSHA1(concatenatedString, apisecret);
        var base64String = hash.toString(CryptoJS.enc.Base64);
        var credentials = encodeURIComponent(base64String);
        return {
          duration: len,
          startDateTime: start,
          credentials: credentials
        };
      })()
    });
  });*/
});

test('#event_readyStateChange', function(t) {
  t.plan(4);

  t.test('When XMLHttpRequest is not loaded', function(st) {
    st.plan(1);

    var states = [];
    var temp = window.XMLHttpRequest;
    window.XMLHttpRequest = null;

    sw.on('readyStateChange', function(state, error, room) {
      console.info('readyStateChange', state, error, room);
      states.push({
        state: state,
        error: error,
        room: room
      });
    });

    sw.init(apikey, function() {
      sw.off('readyStateChange');
      window.XMLHttpRequest = temp;
      st.deepEqual(states, [{
        state: 0,
        error: null,
        room: apikey
      }, {
        state: -1,
        error: {
          status: null,
          content: 'XMLHttpRequest not available',
          errorCode: sw.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT
        },
        room: apikey
      }], 'Received states are correct');
    });
  });

  t.test('When AdapterJS is not loaded', function(st) {
    st.plan(1);

    var states = [];
    var temp = window.AdapterJS;
    window.AdapterJS = null;

    sw.on('readyStateChange', function(state, error, room) {
      states.push({
        state: state,
        error: error,
        room: room
      });
    });

    sw.init(apikey, function() {
      sw.off('readyStateChange');
      window.AdapterJS = temp;
      st.deepEqual(states, [{
        state: 0,
        error: null,
        room: apikey
      }, {
        state: -1,
        error: {
          status: null,
          content: 'AdapterJS dependency is not loaded or incorrect AdapterJS dependency is used',
          errorCode: sw.READY_STATE_CHANGE_ERROR.ADAPTER_NO_LOADED
        },
        room: apikey
      }], 'Received states are correct');
    });
  });

  t.test('When socket.io-client is not loaded', function(st) {
    st.plan(1);

    var states = [];
    var temp = window.io;
    window.io = null;

    sw.on('readyStateChange', function(state, error, room) {
      states.push({
        state: state,
        error: error,
        room: room
      });
    });

    sw.init(apikey, function() {
      sw.off('readyStateChange');
      window.io = temp;
      st.deepEqual(states, [{
        state: 0,
        error: null,
        room: apikey
      }, {
        state: -1,
        error: {
          status: null,
          content: 'Socket.io not found',
          errorCode: sw.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO
        },
        room: apikey
      }], 'Received states are correct');
    });
  });

  t.test('Testing callback success states', function(st) {
    st.plan(1);

    var states = [];

    sw.on('readyStateChange', function(state, error, room) {
      states.push({
        state: state,
        error: error,
        room: room
      });
    });

    sw.init(apikey, function() {
      sw.off('readyStateChange');
      st.deepEqual(states, [{
        state: 0,
        error: null,
        room: apikey
      }, {
        state: 1,
        error: null,
        room: apikey
      }, {
        state: 2,
        error: null,
        room: apikey
      }], 'Received states are correct');
    });
  });
});

})();
