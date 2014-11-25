var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');

var skylink = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

sw.setLogLevel(sw.LOG_LEVEL.DEBUG);

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';


test('Check socket connection', function(t) {
  t.plan(1);

  var pass_stage = 0;

  var finally_call = function () {
    sw.off('readyStateChange');
    sw.off('channelOpen');
    sw.off('channelClose');
    sw._closeChannel();
    clearTimeout(waitTimeout);
  };

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
    t.pass('Channel is closed');
    pass_stage = 2;
    finally_call();
  });

  setTimeout(function () {
    t.deepEqual(array, [1, 2], 'Channel connection opening and closing');
    sw.off('readyStateChange');
    sw.off('channelOpen');
    sw.off('channelClose');
  }, 2000);

  sw.init({
    apiKey: apikey,
    socketTimeout: 10000
  });
});

test('Check socket reconnection fallback', function(t) {
  t.plan(3);

  var port = (window.location.protocol === 'https:') ? 3443 : 3000;
  var array = [];
  var check_array = [];
  var errors = 0;

  var finally_call = function () {
    sw.off('channelConnectionError');
    sw.off('readyStateChange');
    sw._closeChannel();
    clearTimeout(waitTimeout);
  };

  // push to check array
  for (var i = 0; i < sw._socketReconnectionAttempts; i++) {
    check_array.push(i + 1);
  }

  sw._signalingServer = '192.167.23.123';

  sw._openChannel();

  sw.on('channelConnectionError', function (errorCode, attempts) {
    if (errorCode === sw.CHANNEL_CONNECTION_ERROR.CONNECTION_FAILED) {
      array.push(1);
    }
    if (errorCode === sw.CHANNEL_CONNECTION_ERROR.RECONNECTION_ATTEMPT) {
      t.deepEqual(sw._signalingServerPort, port,
        ((window.location.protocol === 'https:') ? 'HTTPS' : 'HTTP') +
        ' fallback port passed');
      array.push(2);
    }
    if (errorCode === sw.CHANNEL_CONNECTION_ERROR.RECONNECTION_FAILED) {
      array.push(3);
    }
  });

  setTimeout(function () {
    t.deepEqual(sw._socketTimeout, 10000, 'Socket timeout being set');
    t.deepEqual(array, [1, 2, 3], 'Socket events firing in order');
    sw.off('readyStateChange');
    sw.off('channelConnectionError');
    sw._closeChannel();
    sw._signalingServerPort = (window.location.protocol === 'https:') ? 443 : 80;
  }, 38000);
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
      sw.on('channelConnectionError', function (errorCode) {
        if (errorCode === sw.CHANNEL_CONNECTION_ERROR.RECONNECTION_ATTEMPT) {
          t.deepEqual(sw._signalingServerPort, 3443, 'ForceSSL fallback port is HTTPS port ' + sw._signalingServerPort);
          // start the false check
          sw.off('readyStateChange');
          sw.off('channelOpen');
          sw.off('channelClose');
          sw.off('channelConnectionError');
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
      sw.on('channelConnectionError', function (errorCode) {
        if (errorCode === sw.CHANNEL_CONNECTION_ERROR.RECONNECTION_ATTEMPT) {
          t.deepEqual(sw._signalingServerPort,
            (window.location.protocol === 'https:') ? 3443 : 3000,
            'ForceSSL fallback port is HTTPS port');
          // start the false check
          sw.off('readyStateChange');
          sw.off('channelOpen');
          sw.off('channelClose');
          sw.off('channelConnectionError');
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