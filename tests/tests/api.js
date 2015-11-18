(function() {

'use strict';

// Dependencies
var exports = require('../config.js');
var test    = require('tape');
var sw      = new Skylink();
var CryptoJS = require('crypto-js');
var seqqueue = require('seq-queue');

/* ---- Constants ---- */

/* ---- Methods ---- */
test('#init()', function (t) {
  t.plan(2);

  t.test('Testing parameters', function (st) {
    st.plan(4);

    st.test('When (), do nothing', function (cst) {
      cst.plan(1);

      var called = false;
      sw.on('readyStateChange', function () {
        called = true;
      });

      setTimeout(function () {
        sw._EVENTS.readyStateChange = [];
        cst.deepEqual(called, false, 'Does not trigger event');
      }, 1000);

      sw.init();
    });

    st.test('When (callback), do nothing', function (cst) {
      cst.plan(1);

      var called = false;
      sw.on('readyStateChange', function () {
        called = true;
      });

      setTimeout(function () {
        sw._EVENTS.readyStateChange = [];
        cst.deepEqual(called, false, 'Does not trigger event');
      }, 1000);

      sw.init(function () {});
    });

    st.test('When (options), trigger event', function (cst) {
      cst.plan(1);

      var called = false;
      sw.on('readyStateChange', function () {
        called = true;
      });

      setTimeout(function () {
        sw._EVENTS.readyStateChange = [];
        cst.deepEqual(called, true, 'Triggers event');
      }, 1000);

      sw.init(apikey);
    });

    st.test('When (options, callback), trigger event', function (cst) {
      cst.plan(1);

      var called = false;
      sw.on('readyStateChange', function () {
        called = true;
      });

      setTimeout(function () {
        sw._EVENTS.readyStateChange = [];
        cst.deepEqual(called, true, 'Triggers event');
      }, 1000);

      sw.init(apikey, function () {});
    });
  });

  t.test('Testing options', function (st) {
    st.plan(2);

    st.test('These options should pass', function (sst) {
      sst.plan(1); //sst.plan(26);

      sst.testItem = function (options) {
        this.test('When providing ' + JSON.stringify(options), function (csst) {
          csst.plan(7);

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
          if (typeof options === 'string' || (keys.indexOf('apiKey') > -1 && keys.indexOf('appKey') === -1)) {
            keys.push('appKey');
          }

          for (var i = 0; i < keys.length; i++) {
            if (expected.hasOwnProperty(keys[i])) {
              expected[keys[i]] = options[keys[i]];
            }
          }

          sw.init(options, function (err, success) {
            console.info('result', err, success);

            var expectedCreds = {
              duration: null,
              startDateTime: null,
              credentials: null
            };

            if (options.credential) {
              if (typeof options.credential.credentials === 'string') {
                expectedCreds.credentials = options.credential.credentials;
              }

              if (typeof options.credential.duration === 'number') {
                expectedCreds.duration = options.credential.duration;
              }

              if (typeof options.credential.startDateTime === 'string') {
                expectedCreds.startDateTime = options.credential.startDateTime;
              }
            }

            expected.TURNTransport = expected.TURNServerTransport;
            delete expected.TURNServerTransport;
            expected.serverRegion = expected.region;
            delete expected.region;
            expected.selectedRoom = expected.defaultRoom;
            expected.readyState = 2;
            expected.serverUrl = sw._path;

            csst.deepEqual(err, null, 'Error should be empty');
            csst.deepEqual(success, expected, 'Should match provided options');
            csst.ok(success.serverUrl.indexOf('rand') > -1, 'Should have a "rand" query in path');
            csst.deepEqual({
              duration: sw._roomDuration,
              startDateTime: sw._roomStart,
              credentials: sw._roomCredentials
            }, expectedCreds, 'Should match provided credentials');

            var checkCredPath = expectedCreds.credentials && expectedCreds.duration && expectedCreds.startDateTime;

            csst.ok(success.serverUrl.split('?')[0], expected.roomServer + '/api/' + expected.appKey + '/' + expected.defaultRoom,
              'Should have a valid constructed path');

            if (checkCredPath) {
              csst.ok(success.serverUrl.indexOf('cred') > -1, 'Should have a "cred" query in path');
            } else {
              csst.ok(success.serverUrl.indexOf('cred') === -1, 'Should not have a "cred" query in path');
            }

            if (options.region) {
              csst.ok(success.serverUrl.indexOf('rg') > -1, 'Should have a "rg" query in path');
            } else {
              csst.ok(success.serverUrl.indexOf('rg') === -1, 'Should not have a "rg" query in path');
            }
          });
        });
      };

      sst.testItem({ appKey: apikey });
      sst.testItem({ appKey: apikey, apiKey: apikey });
      sst.testItem({ appKey: apikey, apiKey: 'fake one' });
      sst.testItem({ apiKey: apikey });
      sst.testItem({ appKey: apikey, defaultRoom: 'mydefault' });
      sst.testItem({ appKey: apikey, region: sw.REGIONAL_SERVER.US1 });
      sst.testItem({ appKey: apikey, roomServer: '//staging-api.temasys.com.sg' });
      sst.testItem({ appKey: apikey, enableIceTrickle: false });
      sst.testItem({ appKey: apikey, enableDataChannel: false });
      sst.testItem({ appKey: apikey, enableTURNServer: false });
      sst.testItem({ appKey: apikey, enableSTUNServer: false });
      sst.testItem({ appKey: apikey, TURNServerTransport: sw.TURN_TRANSPORT.ALL });
      sst.testItem({ appKey: apikey, forceSSL: true });
      sst.testItem({ appKey: apikey, forceTURNSSL: true });
      sst.testItem({ appKey: apikey, socketTimeout: 12000 });
      sst.testItem({ appKey: apikey, audioFallback: true });
      sst.testItem({ appKey: apikey, videoCodec: sw.VIDEO_CODEC.VP8 });
      sst.testItem({ appKey: apikey, audioCodec: sw.AUDIO_CODEC.OPUS });
      sst.testItem({ appKey: apikey, forceTURN: true });
      sst.testItem({ appKey: apikey, usePublicSTUN: false });
      sst.testItem({ appKey: apikey, credential: {} });
      sst.testItem({ appKey: apikey, credential: { credentials: 'xxx' } });
      sst.testItem({ appKey: apikey, credential: { credentials: 'xxx', duration: 2 } });
      sst.testItem({ appKey: apikey, credential: { credentials: 'xxx', duration: '2', startDateTime: (new Date()).toISOString() } });
      sst.testItem({ appKey: apikey, credential: (function () {
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
      })() });
    });

    st.test('These options should fail', function (sst) {
      sst.plan(5);

      sst.testItem = function (options) {
        this.test('When providing ' + JSON.stringify(options), function (csst) {
          csst.plan(2);

          var expected = {
            errorCode: sw.READY_STATE_CHANGE_ERROR.API_INVALID,
            error: 'string',
            status: 401
          };

          sw.init(options, function (err, success) {
            csst.deepEqual(success, null, 'Success should be empty');
            csst.deepEqual({
              errorCode: err.errorCode,
              error: typeof err.error,
              status: err.status
            }, expected, 'Should match expected error');
          });
        })
      };

      sst.testItem('fake one');
      sst.testItem({ apiKey: 'fake' });
      sst.testItem({ appKey: 'fake', apiKey: apikey });
      sst.testItem({ appKey: 'sofake', apiKey: 'fake' });
      sst.testItem({ appKey: null });
    });
  });
});

/*console.log('Test API | Methods');
  test('#init()', function (t) {
    t.plan(4);

    t.deepEqual(typeof sw.init, 'function', 'To be defined');

    t.test('Parameters', function (st) {

    });

    (function () {
      console.log('- Based on options, callback should return success');



    });
    t.test

    t.test(, function (st) {
      st.plan(26 * 7);

      var queue = seqqueue.createQueue(1);




    });

    t.test('Based on options, callback should return error', function (st) {
      st.plan(5 * 2);




    });
  });

  test('#generateUUID()', function (t) {
    t.plan(3);

    t.deepEqual(typeof sw.generateUUID, 'function', 'To be defined');

    var uuid = sw.generateUUID();

    t.deepEqual(uuid, 'string', 'Returns a string');
    t.deepEqual(uuid.length, 36, 'Returns a string with length of 36');

    t.end();
  });
})();

/* ---- Events ---- */
/*(function () {

  console.log('Test API | Events');

  test('#on("readyStateChange")', function (t) {
    t.plan(2);

    t.test('Success case', function (st) {
      st.plan(7);

      var states = [];
      var expected = [0, 1, 2];

      var testCaseEvent = function (state, error, room) {
        states.push(state);
        st.deepEqual(error, null, 'No error occuring');
        st.deepEqual(room, apikey, 'Returns the correct room name');
      };

      sw.on('readyStateChange', testCaseEvent);
      sw.init(apikey, function () {
        st.deepEqual(states, expected, 'Trigger states in order');
        sw.off('readyStateChange', testCaseEvent);
      });
    });

    t.test('Failure case', function (st) {
      st.plan(3 * 5);

      var testCase = function (key, expectedError, fn) {
        var states = [];
        var expected = [0, 1, -1];

        var testCaseEvent = function (state, error, room) {
          states.push(state);
        };

        sw.on('readyStateChange', testCaseEvent);

        sw.init(key, function () {
          st.deepEqual(error, expectedError, 'Returns the correct error states');
          st.deepEqual(room, null, 'Returns an empty room');
          st.deepEqual(states, expected, 'Trigger states in order');
          sw.off('readyStateChange', testCaseEvent);
          if (typeof fn === 'function') {
            fn();
          }
        });
      };

      var c1 = function () {
        var temp = window.io;
        window.io = null;
        testCase(apikey, {
          status: null,
          content: 'Socket.io not found',
          errorCode: sw.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO
        }, function () {
          window.io = temp;
          c2();
        });
      };

      var c2 = function () {
        var temp = window.AdapterJS;
        window.AdapterJS = null;
        testCase(apikey, {
          status: null,
          content: 'AdapterJS dependency is not loaded or incorrect AdapterJS dependency is used',
          errorCode: sw.READY_STATE_CHANGE_ERROR.ADAPTER_NO_LOADED
        }, function () {
          window.AdapterJS = temp;
          c3();
        });
      };

      var c3 = function () {
        var temp = window.RTCPeerConnection;
        window.RTCPeerConnection = null;
        testCase(apikey, {
          status: null,
          content: 'WebRTC not available',
          errorCode: sw.READY_STATE_CHANGE_ERROR.NO_WEBRTC_SUPPORT
        }, function () {
          window.AdapterJS = temp;
          c4();
        });
      };

      var c4 = function () {
        var temp = window.XMLHttpRequest;
        window.XMLHttpRequest = null;
        testCase(apikey, {
          status: null,
          content: 'XMLHttpRequest not available',
          errorCode: sw.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT
        }, function () {
          window.XMLHttpRequest = temp;
          c5();
        });
      };

      var c5 = function () {
        testCase(apikey, {
          status: 401,
          content: 'Your apiKey is not valid . Please go to developer.temasys.com.sg to manage your api keys.',
          errorCode: sw.READY_STATE_CHANGE_ERROR.API_INVALID
        });
      };

      c1();
    });
  });

  test('#on("systemAction")', function (t) {
    t.plan(2);

    t.test('When expired', function (st) {
      st.plan(3);

      sw.once('systemAction', function (action, message, reason) {
        st.deepEqual(action, sw.SYSTEM_ACTION.REJECT, 'Returns correct system action');
        st.deepEqual(reason, sw.SYSTEM_ACTION_REASON.EXPIRED, 'Returns correct reason');
        st.deepEqual(typeof message, 'string', 'Returns a message in string');
      });

      var len = 0.15;
      var start = new Date('12/09/2015'); // so dead
      var concatenatedString = 'theroom_' + len + '_' + start.toISOString();
      var hash = CryptoJS.HmacSHA1(concatenatedString, apisecret);
      var base64String = hash.toString(CryptoJS.enc.Base64);
      var credentials = encodeURIComponent(base64String);

      sw.init({
        appKey: apikey,
        credential: {
          startDateTime: start.toISOString(),
          duration: len,
          credentials: credentials
        }
      });
    });

    t.test.skip('When room is locked', function (st) {
      // can't test this in here
    });

  });
})();*/

})();
