(function() {

'use strict';

var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');

var skylink = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

sw.setLogLevel(sw.LOG_LEVEL.ERROR);

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';


test('Check socket connection', function(t) {
  t.plan(1);

  var array = [];

  sw.on('readyStateChange', function (state) {
    if (state === sw.READY_STATE_CHANGE.COMPLETED) {
      sw._openChannel();
    }
  });

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
  }, 2000);

  sw.init(apikey);
});

test('Check socket reconnection fallback', function(t) {
  t.plan(2);

  var port = (window.location.protocol === 'https:') ? 3443 : 3000;
  var array = [];

  sw._signalingServer = '192.167.23.123';

  sw._openChannel();

  sw.on('socketError', function (errorCode, attempts) {
    if (errorCode === sw.SOCKET_ERROR.CONNECTION_FAILED) {
      array.push(1);
    }
    if (errorCode === sw.SOCKET_ERROR.RECONNECTION_ATTEMPT) {
      t.deepEqual(sw._signalingServerPort, port,
        ((window.location.protocol === 'https:') ? 'HTTPS' : 'HTTP') +
        ' fallback port passed');
      array.push(2);
    }
    if (errorCode === sw.SOCKET_ERROR.RECONNECTION_FAILED) {
      array.push(3);
    }
  });

  setTimeout(function () {
    t.deepEqual(array, [1, 2, 3], 'Socket events firing in order');
    sw.off('readyStateChange');
    sw.off('socketError');
    sw._closeChannel();
    sw._signalingServerPort = (window.location.protocol === 'https:') ? 443 : 80;
    t.end();
  }, 62000);
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
      sw._signalingServer = '192.168.123.4';
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
      sw._signalingServer = '192.168.123.4';
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