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
  t.plan(6);

  var reconnectionAttempts = 5;
  var hasReachedLimit = false;
  var reconnectionAttempt = 0;
  var timeout = 1000;
  var array = [];
  var originalSigServer = '';

  sw.on('channelConnectionError', function (errorCode, attempts) {
    console.info('err', errorCode, attempts);
    if (errorCode === sw.CHANNEL_CONNECTION_ERROR.CONNECTION_FAILED) {
      sw._wait(function () {
        var checkArray = [];
        reconnectionAttempt += 1;

        for (var i = 0; i < reconnectionAttempt; i++) {
          checkArray.push(i + 1);
        }

        t.deepEqual(array, checkArray, 'Reconnection attempts are ' +
          reconnectionAttempt + ' / ' + reconnectionAttempts);

      }, function () {
        return reconnectionAttempt === reconnectionAttempts;
      // add 250 to the timeout because actual code processing takes time
      }, timeout + 250);

    }
    if (errorCode === sw.CHANNEL_CONNECTION_ERROR.RECONNECTION_FAILED) {
      array.push(attempts);
    }
    hasReachedLimit = errorCode === sw.CHANNEL_CONNECTION_ERROR.RECONNECTION_ABORTED
      && attempts === (reconnectionAttempts + 1);
  });

  sw._condition('channelClose', function () {
    sw.on('readyStateChange', function (state) {
      if (state === sw.READY_STATE_CHANGE.COMPLETED) {
        originalSigServer = sw._signalingServer;
        sw._signalingServer = '192.167.23.123';
        sw.joinRoom();
      }
    });

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

  setTimeout(function () {
    t.deepEqual(hasReachedLimit, true, 'Throws aborted when all reconnection attempts failed');
  // add 1000 to the timeout because actual code processing takes time
  }, 7000);
});