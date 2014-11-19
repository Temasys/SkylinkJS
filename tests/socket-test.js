var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');

var skylink = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

//sw.setLogLevel(sw.LOG_LEVEL.ERROR);

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';


test('Check socket connection', function(t) {
  t.plan(2);

  var array = [];

  sw.on('readyStateChange', function (state) {
    if (state === sw.READY_STATE_CHANGE.COMPLETED) {
      sw.joinRoom();
    }
  });

  sw.on('channelOpen', function () {
    array.push(1);
  });

  sw.on('channelClose', function () {
    array.push(2);
  });

  setTimeout(function () {
    t.deepEqual(array, [1], 'Channel is opened');
    sw.leaveRoom();
  }, 2000);

  setTimeout(function () {
    t.deepEqual(array, [1, 2], 'Channel is closed');
  }, 3500);

  sw.init(apikey);
});

test('Check socket reconnection fallback', function(t) {
  t.plan(1);

  sw._signalingServerPort = 800;
  sw.joinRoom();

  var isSSL = window.location.protocol === 'https:';
  var fallbackPort = (isSSL) ? 3443 : 3000;

  setTimeout(function () {
    t.deepEqual(sw._signalingServerPort, fallbackPort,
      ((isSSL) ? 'HTTPS' : 'HTTP') + ' fallback to ' + fallbackPort);

    sw.leaveRoom();
    sw._signalingServerPort = (window.location.protocol === 'https:') ? 443 : 80;
  }, 1000);
});

test('Test socket connection reconnection attempts', function(t) {
  t.plan(3);

  var reconnectionAttempts = 5;
  var hasConnectionError = false;
  var hasReachedLimit = false;
  var timeout = 1000;
  var array = [];
  var originalSigServer = '';

  sw._condition('channelClose', function () {
    sw.on('readyStateChange', function (state) {
      if (state === sw.READY_STATE_CHANGE.COMPLETED) {
        originalSigServer = sw._signalingServer;
        sw._signalingServer = '192.167.23.123';
        sw.joinRoom();
      }
    });

    setTimeout(function () {
      t.deepEqual(array, [1, 2, 3, 4, 5], 'Reconnection attempts are 5');
      t.deepEqual(hasReachedLimit, true, 'Throws aborted when all reconnection attempts failed');
    }, 35000);

    sw.init({
      apiKey: apikey,
      socketTimeout: timeout,
      socketReconnectionAttempts: reconnectionAttempts
    });
  }, function () {
    if(sw._channelOpen) {
      sw.leaveRoom();
      return false;
    }
    return true;
  }, function () {
    return true;
  });

  sw.on('channelConnectionError', function (errorCode, attempts) {
    console.info('err', errorCode, attempts);
    if (errorCode === sw.CHANNEL_CONNECTION_ERROR.CONNECTION_FAILED) {
      hasConnectionError = true;
    } else if (errorCode === sw.CHANNEL_CONNECTION_ERROR.RECONNECTION_FAILED) {
      array.push(attempts);
    }
    if (attempts === 5) {
      hasReachedLimit = errorCode === sw.CHANNEL_CONNECTION_ERROR.RECONNECTION_ABORTED;
    }
  });
});