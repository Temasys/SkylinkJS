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

test('Check socket reconnection fallback', function(t) {
  t.plan(2);

  var array_error = [];
  var array_fallback = [];

  var fallback_port = (window.location.protocol === 'https:') ?
    sw.SOCKET_FALLBACK.FALLBACK_PORT_SSL : sw.SOCKET_FALLBACK.FALLBACK_PORT;

  var fallback_longpolling = (window.location.protocol === 'https:') ?
    sw.SOCKET_FALLBACK.LONG_POLLING_SSL : sw.SOCKET_FALLBACK.LONG_POLLING;

  sw.on('socketError', function (errorCode, attempts, fallback) {
    console.error(errorCode, attempts, fallback);
    if (fallback === sw.SOCKET_FALLBACK.NON_FALLBACK) {
      array_error.push(1);
    }
    if (fallback === fallback_port) {
      if (errorCode === sw.SOCKET_ERROR.RECONNECTION_ATTEMPT) {
        array_error.push(2);
      }
      if (errorCode === sw.SOCKET_ERROR.RECONNECTION_ABORTED) {
        array_error.push(3);
      }
    }
    if (fallback === fallback_longpolling) {
      if (errorCode === sw.SOCKET_ERROR.RECONNECTION_ATTEMPT) {
        array_error.push(4);
      }
    }
  });

  sw.on('channelRetry', function (fallback) {
    array_fallback.push(fallback);
  });

  sw._condition('readyStateChange', function () {
    sw._openChannel();

    setTimeout(function () {
      t.deepEqual(array_error, [1, 2, 3, 4], 'Socket error are firing in order');

      t.deepEqual(array_fallback, [
        fallback_port,
        fallback_longpolling
      ], 'Socket retries are firing in order');

      sw.off('readyStateChange');
      sw.off('socketError');
      sw._closeChannel();
      sw._signalingServerPort = (window.location.protocol === 'https:') ? 443 : 80;
      t.end();
    }, 16000);

  }, function () {
    return sw._readyState === sw.READY_STATE_CHANGE.COMPLETED;
  }, function (state) {
    return state === sw.READY_STATE_CHANGE.COMPLETED;
  });
});

test('Check socket connection', function(t) {
  t.plan(1);

  var array = [];

  sw.on('channelOpen', function () {
    array.push(1);
    sw._closeChannel();
  });

  sw.on('channelClose', function () {
    array.push(2);
  });

  sw._openChannel();

  setTimeout(function () {
    t.deepEqual(array, [1, 2], 'Channel connection opening and closing');
    sw.off('readyStateChange');
    sw.off('channelOpen');
    sw.off('channelClose');
    t.end();
  }, 21000);
});

test('Test socket connection forceSSL', function(t) {
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