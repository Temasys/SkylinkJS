var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');

var skylink = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

sw.setLogLevel(sw.LOG_LEVEL.DEBUG);

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';


test('Check socket connection', function(t) {
  t.plan(2);

  var pass_stage = 0;

  var finally_call = function () {
    sw.off('readyStateChange');
    sw.off('channelOpen');
    sw.off('channelClose');
    sw._closeChannel();
  };

  sw.on('readyStateChange', function (state) {
    if (state === sw.READY_STATE_CHANGE.COMPLETED) {
      sw._openChannel();
    }
  });

  sw.on('channelOpen', function () {
    t.pass('Channel is opened');
    pass_stage = 1;
    sw._closeChannel();
    console.info('leave room.');
  });

  sw.on('channelClose', function () {
    t.pass('Channel is closed');
    pass_stage = 2;
    finally_call();
  });

  setTimeout(function () {
    if (pass_stage === 0) {
      t.fail('Channel failed to opened');
      t.fail('Channel failed to close');
    }
    if (pass_stage === 1) {
      t.fail('Channel failed to close');
    }
    if (pass_stage !== 2) {
      finally_call();
    }
  }, 50000);

  sw.init(apikey);
});

test('Check socket reconnection fallback', function(t) {
  t.plan(1);

  var pass_stage = 0;

  var isSSL = window.location.protocol === 'https:';
  var fallbackPort = (isSSL) ? 3443 : 3000;

  var finally_call = function () {
    sw.off('readyStateChange');
    sw.off('channelConnectionError');
    sw._closeChannel();
    sw._signalingServerPort = (window.location.protocol === 'https:') ? 443 : 80;
  };

  sw._signalingServer = '192.167.23.123';

  sw._condition('readyStateChange', function () {
    sw._openChannel();
  }, function () {
    return sw._readyState === sw.READY_STATE_CHANGE.COMPLETED;
  }, function (state) {
    return state === sw.READY_STATE_CHANGE.COMPLETED;
  });

  sw.on('channelConnectionError', function (errorCode, attempts) {
    if (errorCode === sw.CHANNEL_CONNECTION_ERROR.RECONNECTION_ATTEMPT) {
      if (sw._signalingServerPort === fallbackPort) {
        pass_stage = 1;
        t.pass(((isSSL) ? 'HTTPS' : 'HTTP') + ' fallback port passed');
        finally_call();
      }
    }
  });

  setTimeout(function () {
    if (pass_stage === 0) {
      t.fail(((isSSL) ? 'HTTPS' : 'HTTP') + ' fallback port failed');
      finally_call();
    }
  }, 50000);
});

test('Test socket connection reconnection default attempts', function(t) {
  t.plan(4);

  var pass_stage = 0;

  var array = [];
  var check_array = [];

  var finally_call = function () {
    sw.off('channelConnectionError');
    sw.off('readyStateChange');
    sw._closeChannel();
  };

  // push to check array
  for (var i = 0; i < sw._socketReconnectionAttempts; i++) {
    check_array.push(i + 1);
  }

  sw.on('channelConnectionError', function (errorCode, attempts) {
    if (errorCode === sw.CHANNEL_CONNECTION_ERROR.CONNECTION_FAILED) {
      pass_stage = 1;
    }
    if (errorCode === sw.CHANNEL_CONNECTION_ERROR.RECONNECTION_ATTEMPT) {
      if (pass_stage !== 1) {
        t.fail('Channel error not triggering connection failed first before reconnection attempt');
        return;
      }
      array.push(attempts);

      if (array.length === check_array.length) {
        var notEqual = false;
        // loop out values
        for (var j = 0; j < array.length; j++) {
          if (check_array.indexOf(array[j]) === -1) {
            notEqual = true;
            break;
          }
        }
        if (!notEqual) {
          t.pass('Channel error reconnection attempts are triggered');
          pass_stage = 2;
        } else {
          t.fail('Channel error reconnection attempts are not triggered');
        }
      }
    }
    if (errorCode === sw.CHANNEL_CONNECTION_ERROR.RECONNECTION_ABORTED) {
      if (pass_stage === 2) {
        t.pass('Channel error throws reconnection aborted after all attempts failed');
        pass_stage = 3;
        finally_call();
      } else {
        t.fail('Channel error does not throw reconnection aborted after all attempts failed');
      }
    }
  });

  sw._signalingServer = '192.167.23.123';

  sw._condition('readyStateChange', function () {
    sw._openChannel();
  }, function () {
    return sw._readyState === sw.READY_STATE_CHANGE.COMPLETED;
  }, function (state) {
    return state === sw.READY_STATE_CHANGE.COMPLETED;
  });

  setTimeout(function () {
    if (pass_stage === 0) {
      t.fail('Channel error not triggering connection failed');
      t.fail('Channel error failed triggering reconnection attempt');
      t.fail('Channel error failed triggering all reconnection attempts');
      t.fail('Channel error failed triggering reconnection aborted after all attempts failed');
    } else if (pass_stage === 1) {
      t.fail('Channel error failed triggering all reconnection attempts');
      t.fail('Channel error failed triggering reconnection aborted after all attempts failed');
    } else if (pass_stage === 2) {
      t.fail('Channel error failed triggering reconnection aborted after all attempts failed');
    }
    if (pass_stage !== 3) {
      finally_call();
    }
  }, 180000);
});

test('Test socket connection reconnection attempts', function(t) {
  t.plan(4);

  var pass_stage = 0;

  var array = [];
  var check_array = [];

  var finally_call = function () {
    sw.off('channelConnectionError');
    sw.off('readyStateChange');
    sw._closeChannel();
  };

  sw.on('readyStateChange', function (state) {
    if (state === sw.READY_STATE_CHANGE.COMPLETED) {
      sw._openChannel();
    }
  });

  sw.on('channelConnectionError', function (errorCode, attempts) {
    if (errorCode === sw.CHANNEL_CONNECTION_ERROR.CONNECTION_FAILED) {
      pass_stage = 1;
    }
    if (errorCode === sw.CHANNEL_CONNECTION_ERROR.RECONNECTION_ATTEMPT) {
      if (pass_stage !== 1) {
        t.fail('Channel error not triggering connection failed first before reconnection attempt');
        return;
      }
      array.push(attempts);

      if (array.length === check_array.length) {
        var notEqual = false;
        // loop out values
        for (var j = 0; j < array.length; j++) {
          if (check_array.indexOf(array[j]) === -1) {
            notEqual = true;
            break;
          }
        }
        if (!notEqual) {
          t.pass('Channel error reconnection attempts are triggered');
          pass_stage = 2;
        } else {
          t.fail('Channel error reconnection attempts are not triggered');
        }
      }
    }
    if (errorCode === sw.CHANNEL_CONNECTION_ERROR.RECONNECTION_ABORTED) {
      if (pass_stage === 2) {
        t.pass('Channel error throws reconnection aborted after all attempts failed');
        pass_stage = 3;
        finally_call();
      } else {
        t.fail('Channel error does not throw reconnection aborted after all attempts failed');
      }
    }
  });

  sw._signalingServer = '192.167.23.125';

  sw.init({
    apiKey: apikey,
    socketTimeout: timeout,
    socketReconnectionAttempts: reconnectionAttempts
  });

  // push to check array
  for (var i = 0; i < sw._socketReconnectionAttempts; i++) {
    check_array.push(i + 1);
  }

  setTimeout(function () {
    if (pass_stage === 0) {
      t.fail('Channel error not triggering connection failed');
      t.fail('Channel error failed triggering reconnection attempt');
      t.fail('Channel error failed triggering all reconnection attempts');
      t.fail('Channel error failed triggering reconnection aborted after all attempts failed');
    } else if (pass_stage === 1) {
      t.fail('Channel error failed triggering all reconnection attempts');
      t.fail('Channel error failed triggering reconnection aborted after all attempts failed');
    } else if (pass_stage === 2) {
      t.fail('Channel error failed triggering reconnection aborted after all attempts failed');
    }
    if (pass_stage !== 3) {
      finally_call();
    }
  }, 180000);
});

test('Test socket connection forceSSL', function(t) {
  t.plan(3);

  var pass_stage = 0;

  sw.init({
    apiKey: apikey,
    forceSSL: true
  });
  sw.joinRoom();

  // do the check
  setTimeout(function () {
    if (sw._signalingServerPort === 443) {
      t.pass('Signaling server port is not SSL');
      pass_stage = 1;
    } else {
      t.fail('Signaling server port is SSL');
    }
    if (sw._signalingServerProtocol === 'https:') {
      t.pass('Signaling server protocol is HTTPS');
      pass_stage = 2;
    } else {
      t.fail('Signaling server protocol is not HTTPS');
    }
    sw._closeChannel();
    sw._signalingServer = '192.167.23.124';
    sw._openChannel();
  }, 4000);

  setTimeout(function () {
    if (sw._signalingServerPort === 3443) {
      t.pass('Signaling server port is SSL for fallback');
    } else {
      t.fail('Signaling server port is not SSL for fallback');
    }
    sw._closeChannel();
  }, 15000);
});