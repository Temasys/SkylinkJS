(function() {

'use strict';

// Dependencies
var test = require('tape');
window.TempWebSocket = window.WebSocket;
window.WebSocket = null;
window.io = require('socket.io-client');
var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink = require('./../publish/skylink.debug.js');
var sw = new skylink.Skylink();

// Testing attributes
var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

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