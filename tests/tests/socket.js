(function() {

'use strict';

// Dependencies
var exports = require('../config.js');
var test    = require('tape');
window.sw = new Skylink();


(function () {
  test('#SOCKET_ERROR', function (t) {
    t.plan(2);

    t.deepEqual(typeof sw.SOCKET_ERROR, 'string', 'To be defined');
    t.deepEqual(sw.VERSION, '0.6.4', 'To be expected version for current release');

    t.end();
  });

  test('#SM_PROTOCOL_VERSION', function (t) {
    t.plan(2);

    t.deepEqual(typeof sw.SM_PROTOCOL_VERSION, 'string', 'To be defined');
    t.deepEqual(sw.SM_PROTOCOL_VERSION, '0.1.1', 'To be as expected version for current release');

    t.end();
  });

  test('#DT_PROTOCOL_VERSION', function (t) {
    t.plan(2);

    t.deepEqual(typeof sw.DT_PROTOCOL_VERSION, 'string', 'To be defined');
    t.deepEqual(sw.DT_PROTOCOL_VERSION, '0.1.0', 'To be as expected version for current release');

    t.end();
  });

  test('#READY_STATE_CHANGE', function (t) {
    t.plan(3);

    t.deepEqual(typeof sw.READY_STATE_CHANGE, 'object', 'To be defined');
    t.deepEqual(Object.keys(sw.READY_STATE_CHANGE).length, 4, 'To have a length of 4');
    t.deepEqual(sw.READY_STATE_CHANGE, {
      INIT: 0,
      LOADING: 1,
      COMPLETED: 2,
      ERROR: -1
    }, 'To be as what the documentation stated');

    t.end();
  });

  test('#READY_STATE_CHANGE_ERROR', function (t) {
    t.plan(3);

    t.deepEqual(typeof sw.READY_STATE_CHANGE_ERROR, 'object', 'To be defined');
    t.deepEqual(Object.keys(sw.READY_STATE_CHANGE_ERROR).length, 14, 'To have a length of 14');
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
      INVALID_XMLHTTPREQUEST_STATUS: 5,
      ADAPTER_NO_LOADED: 7
    }, 'To be as what the documentation stated');

    t.end();
  });

  /* Note: Deprecated */
  test('#REGIONAL_SERVER', function (t) {
    t.plan(3);

    t.deepEqual(typeof sw.REGIONAL_SERVER, 'object', 'To be defined');
    t.deepEqual(Object.keys(sw.REGIONAL_SERVER).length, 2, 'To have a length of 2');
    t.deepEqual(sw.REGIONAL_SERVER, {
      APAC1: 'sg',
      US1: 'us2'
    }, 'To be as what the documentation stated');
  });

  test('#SYSTEM_ACTION', function (t) {
    t.plan(3);

    t.deepEqual(typeof sw.SYSTEM_ACTION, 'object', 'To be defined');
    t.deepEqual(Object.keys(sw.SYSTEM_ACTION).length, 2, 'To have a length of 2');
    t.deepEqual(sw.SYSTEM_ACTION, {
      WARNING: 'warning',
      REJECT: 'reject'
    }, 'To be as what the documentation stated');
  });

  test('#SYSTEM_ACTION_REASON', function (t) {
    t.plan(3);

    t.deepEqual(typeof sw.SYSTEM_ACTION_REASON, 'object', 'To be defined');
    t.deepEqual(Object.keys(sw.SYSTEM_ACTION_REASON).length, 6, 'To have a length of 2');
    t.deepEqual(sw.SYSTEM_ACTION_REASON, {
      ROOM_LOCKED: 'locked',
      DUPLICATED_LOGIN: 'duplicatedLogin',
      SERVER_ERROR: 'serverError',
      EXPIRED: 'expired',
      ROOM_CLOSED: 'roomclose',
      ROOM_CLOSING: 'toclose'
    }, 'To be as what the documentation stated');
  });
})();

console.log('API: Tests the socket connection and fallback connections');
console.log('===============================================================================================');

sw.init({
  apiKey: apikey,
  socketTimeout: 5000
});



test('channelRetry, socketError: Check socket reconnection fallback', function(t) {
  t.plan(2);

  var originalSig = '';

  var firedErrorCounts = {
    '0': 0, //CONNECTION_FAILED: 0,
    '-1': 0, //RECONNECTION_FAILED: -1,
    '-2': 0, //CONNECTION_ABORTED: -2,
    '-3': 0, //RECONNECTION_ABORTED: -3,
    '-4': 0 //RECONNECTION_ATTEMPT: -4
  };

  var firedFallbackCounts = {
    'nonfallback': 0, //NON_FALLBACK: 'nonfallback',
    'fallbackPortNonSSL': 0, //FALLBACK_PORT: 'fallbackPortNonSSL',
    'fallbackPortSSL': 0, //FALLBACK_SSL_PORT: 'fallbackPortSSL',
    'fallbackLongPollingNonSSL': 0, //LONG_POLLING: 'fallbackLongPollingNonSSL',
    'fallbackLongPollingSSL': 0 //LONG_POLLING_SSL: 'fallbackLongPollingSSL'
  };

  var expectedFiredErrorCounts = {};
  var expectedFiredFallbackCounts = {};

  var fallback_port = (window.location.protocol === 'https:') ?
    sw.SOCKET_FALLBACK.FALLBACK_PORT_SSL : sw.SOCKET_FALLBACK.FALLBACK_PORT;

  var fallback_longpolling = (window.location.protocol === 'https:') ?
    sw.SOCKET_FALLBACK.LONG_POLLING_SSL : sw.SOCKET_FALLBACK.LONG_POLLING;


  if (window.location.protocol === 'https:') {
    expectedFiredErrorCounts = {
      '0': 10,
      '-1': 2,
      '-2': 0,
      '-3': 1,
      '-4': 4
    };
    expectedFiredFallbackCounts = {
      'nonfallback': 1, //NON_FALLBACK: 'nonfallback',
      'fallbackPortNonSSL': 0, //FALLBACK_PORT: 'fallbackPortNonSSL',
      'fallbackPortSSL': 1, //FALLBACK_SSL_PORT: 'fallbackPortSSL',
      'fallbackLongPollingNonSSL': 0, //LONG_POLLING: 'fallbackLongPollingNonSSL',
      'fallbackLongPollingSSL': 11 //LONG_POLLING_SSL: 'fallbackLongPollingSSL'
    };
  } else {
    expectedFiredErrorCounts = {
      '0': 11,
      '-1': 3,
      '-2': 0,
      '-3': 1,
      '-4': 4
    };
    expectedFiredFallbackCounts = {
      'nonfallback': 1, //NON_FALLBACK: 'nonfallback',
      'fallbackPortNonSSL': 2, //FALLBACK_PORT: 'fallbackPortNonSSL',
      'fallbackPortSSL': 0, //FALLBACK_SSL_PORT: 'fallbackPortSSL',
      'fallbackLongPollingNonSSL': 12, //LONG_POLLING: 'fallbackLongPollingNonSSL',
      'fallbackLongPollingSSL': 0 //LONG_POLLING_SSL: 'fallbackLongPollingSSL'
    };
  }


  sw.on('socketError', function (errorCode, error, fallback) {
    firedErrorCounts[errorCode] += 1;

    if (errorCode === sw.SOCKET_ERROR.RECONNECTION_ABORTED) {
      t.deepEqual(firedErrorCounts, expectedFiredErrorCounts, 'Socket error are firing in order');
      t.deepEqual(firedFallbackCounts, expectedFiredFallbackCounts, 'Socket retries are firing in order');

      sw.off('readyStateChange');
      sw.off('socketError');

      sw._signalingServer = originalSig;
      t.end();
    }
  });

  sw.on('channelRetry', function (fallback, attempts) {
    firedFallbackCounts[fallback] += 1;
  });

  // wait for ready state to be ready
  sw._condition('readyStateChange', function () {
    // change the value for fake value
    originalSig = sw._signalingServer;
    sw._signalingServer += 'x';

    sw._openChannel();

  }, function () {
    return sw._readyState === sw.READY_STATE_CHANGE.COMPLETED;
  }, function (state) {
    return state === sw.READY_STATE_CHANGE.COMPLETED;
  });
});

test('channelOpen, channelClose: Check socket connection', function(t) {
  t.plan(1);

  var array = [];

  sw.on('channelOpen', function () {
    array.push(1);
    sw._closeChannel();
  });

  sw.on('channelClose', function () {
    array.push(2);
  });

  setTimeout(function () {
    t.deepEqual(array, [1, 2], 'Channel connection opening and closing');
    sw.off('readyStateChange');
    sw.off('channelOpen');
    sw.off('channelClose');
    t.end();
  }, 45000);

  sw._openChannel();
});

test('init() - forceSSL: Test socket connection forceSSL', function(t) {
  t.plan(6);

  function forceSSLTrue () {
    sw.on('readyStateChange', function (state) {
      if (state === sw.READY_STATE_CHANGE.COMPLETED) {
        sw._openChannel();
      }
    });

    sw.on('channelOpen', function () {
      t.deepEqual(sw._signalingServerPort, 443, 'ForceSSL port is HTTPS port');
      t.deepEqual(sw._signalingServerProtocol, 'https:', 'ForceSSL port is HTTPS protocol');
      sw._closeChannel();
    });

    sw.on('channelClose', function () {
      //sw._signalingServer = '192.168.123.4';
      sw._openChannel();
      // place here because it's fired before channelOpen
      sw.on('socketError', function (errorCode) {
        if (errorCode === sw.SOCKET_ERROR.RECONNECTION_ATTEMPT) {
          t.deepEqual(sw._signalingServerPort, 3443, 'ForceSSL fallback port is HTTPS port');
          // start the false check
          sw.off('readyStateChange');
          sw.off('channelOpen');
          sw.off('channelClose');
          sw.off('socketError');
          forceSSLFalse();
        }
      });
    });

    sw.init({
      apiKey: apikey,
      forceSSL: true
    });
  }

  function forceSSLFalse () {
    sw.on('readyStateChange', function (state) {
      if (state === sw.READY_STATE_CHANGE.COMPLETED) {
        sw._openChannel();
      }
    });

    sw.on('channelOpen', function () {
      t.deepEqual(sw._signalingServerPort,
        (window.location.protocol === 'https:') ? 443 : 80, 'ForceSSL off is default port');
      t.deepEqual(sw._signalingServerProtocol, window.location.protocol,
        'ForceSSL off is default protocol');
      sw._closeChannel();
    });

    sw.on('channelClose', function () {
      //sw._signalingServer = '192.168.123.4';
      sw._openChannel();
      // place here because it's fired before channelOpen
      sw.on('socketError', function (errorCode) {
        if (errorCode === sw.SOCKET_ERROR.RECONNECTION_ATTEMPT) {
          t.deepEqual(sw._signalingServerPort,
            (window.location.protocol === 'https:') ? 3443 : 3000,
            'ForceSSL fallback port is HTTPS port');
          // start the false check
          sw.off('readyStateChange');
          sw.off('channelOpen');
          sw.off('channelClose');
          sw.off('socketError');
          t.end();
        }
      });
    });

    sw.init({
      apiKey: apikey,
      forceSSL: false
    });
  }

  // start witht this test
  forceSSLTrue();
});

})();