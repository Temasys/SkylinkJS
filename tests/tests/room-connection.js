(function() {

'use strict';

// Dependencies
var exports = require('../config.js');
var test = require('tape');
var sw = new Skylink();
//sw.setLogLevel(4);
var CryptoJS = require('crypto-js');


test.skip('#constant_SYSTEM_ACTION', function (t) {
  t.plan(2);

  t.deepEqual(typeof sw.SYSTEM_ACTION, 'object', 'To be defined');
  t.deepEqual(sw.SYSTEM_ACTION, {
    WARNING: 'warning',
    REJECT: 'reject'
  }, 'To match documentation for any changes');

});

test.skip('#constant_SYSTEM_ACTION_REASON', function (t) {
  t.plan(2);

  t.deepEqual(typeof sw.SYSTEM_ACTION_REASON, 'object', 'To be defined');
  t.deepEqual(sw.SYSTEM_ACTION_REASON, {
    ROOM_LOCKED: 'locked',
    DUPLICATED_LOGIN: 'duplicatedLogin',
    SERVER_ERROR: 'serverError',
    EXPIRED: 'expired',
    ROOM_CLOSED: 'roomclose',
    ROOM_CLOSING: 'toclose'
  }, 'To match documentation for any changes');

});

test('#method_joinRoom()', function(t) {
  t.plan(3);

  t.test('Testing parameters', function (st) {
    st.plan(8);

    st.test('When called before init()', function (sst) {
      sst.plan(1);

      var called = false;
      sw.on('peerJoined', function () {
        called = true;
      });

      sw.joinRoom();

      setTimeout(function () {
        sw.off('peerJoined');
        sst.deepEqual(called, false, 'Does not trigger event');
      }, 2000);
    });

    st.test('When parameters is ()', function (sst) {
      sst.plan(2);

      sw.on('peerJoined', function () {
        sw.off('peerJoined');
        sst.deepEqual(sw._selectedRoom, sw._defaultRoom, 'Matches default room');
        sst.pass('Triggers event');
      });

      sw.init(apikey, function (err, success) {
        if (err) {
          t.fail('Failed initialising room ' + JSON.stringify(err));
        } else {
          sw.joinRoom();
        }
      });
    });

    st.test('When parameters is (room)', function (sst) {
      sst.plan(2);

      var room = 'test';
      sw.on('peerJoined', function () {
        sw.off('peerJoined');
        sst.deepEqual(sw._selectedRoom, room, 'Matches given room');
        sst.pass('Triggers event');
      });

      sw.joinRoom(room);
    });

    st.test('When parameters is (room, options)', function (sst) {
      sst.plan(2);

      var room = 'test2';
      sw.on('peerJoined', function () {
        sw.off('peerJoined');
        sst.deepEqual(sw._selectedRoom, room, 'Matches given room');
        sst.pass('Triggers event');
      });

      sw.joinRoom(room, {});
    });

    st.test('When parameters is (room, options, callback)', function (sst) {
      sst.plan(2);

      var room = 'test';
      sw.on('peerJoined', function () {
        sw.off('peerJoined');
        sst.deepEqual(sw._selectedRoom, room, 'Matches given room');
        sst.pass('Triggers event');
      });

      sw.joinRoom(room, {}, function () {});
    });

    st.test('When parameters is (room, callback)', function (sst) {
      sst.plan(2);

      var room = 'test';
      sw.on('peerJoined', function () {
        sw.off('peerJoined');
        sst.deepEqual(sw._selectedRoom, room, 'Matches given room');
        sst.pass('Triggers event');
      });

      sw.joinRoom(room, function () {});
    });

    st.test('When parameters is (options, callback)', function (sst) {
      sst.plan(2);

      sw.on('peerJoined', function () {
        sw.off('peerJoined');
        sst.deepEqual(sw._selectedRoom, sw._defaultRoom, 'Matches default room');
        sst.pass('Triggers event');
      });

      sw.joinRoom({}, function () {});
    });

    st.test('When parameters is (callback)', function (sst) {
      sst.plan(2);

      sw.on('peerJoined', function () {
        sw.off('peerJoined');
        sst.deepEqual(sw._selectedRoom, sw._defaultRoom, 'Matches default room');
        sst.pass('Triggers event');
      });

      sw.joinRoom(function () {});
    });
  });

  t.test('Testing callback error states', function(st) {
    st.plan(8);

    var testItem = function(params) {
      st.test('When paraemters is (' + JSON.stringify(params) + ')', function(sst) {
        sst.plan(2);

        var expectedRoom = sw._defaultRoom;

        if (params.length && (typeof params[0] === 'string' || params[0] === null)) {
          expectedRoom = params[0];
        }

        params.push(function (err, success) {
          console.info('result', err, success);
          if (success) {
            sst.fail('Received success instead of error ' + JSON.stringify(success));
            sst.end();
          } else {
            sst.deepEqual(success, null, 'Success should be empty');
            sst.deepEqual({
              room: err.room,
              errorCode: typeof err.errorCode,
              error: typeof err.error
            }, {
              room: expectedRoom,
              errorCode: 'number',
              error: 'object'
            }, 'Should match expected error');
          }
        });

        sw.joinRoom.apply(sw, params);
      });
    };

    testItem([null]);
    testItem([1232]);
    testItem([false]);
    testItem(['test', null]);
    testItem(['test2', false]);
    testItem(['test3', 1234]);
    testItem(['test4', 'test']);
    testItem([null, null]);
  });

  t.test('Testing callback success states', function (st) {
    st.plan(9);

    var testItem = function(params, hasMedia) {
      st.test('When paraemters is (' + JSON.stringify(params) + ')', function(sst) {
        sst.plan(3);

        var expected = {
          room: sw._defaultRoom,
          peerInfo: null,
          peerId: null
        };

        if (params.length > 0 && (typeof params[0] === 'string' || params[0] === null)) {
          expected.room = params[0];
        }

        if (hasMedia === null) {
          hasMedia = !!sw._mediaStream;
        }

        sw.once('peerJoined', function (peerId, peerInfo) {
          expected.peerId = peerId;
          expected.peerInfo = peerInfo;
        }, function (peerId, peerInfo, isSelf) {
          return isSelf;
        });

        params.push(function (err, success) {
          console.info('result', err, success);
          if (err) {
            sst.fail('Received error instead of success ' + JSON.stringify(err));
            sst.end();
          } else {
            sst.deepEqual(err, null, 'Error should be empty');
            sst.deepEqual(success, expected, 'Should match based on provided parameters');

            if (hasMedia) {
              sst.deepEqual(!!sw._mediaStream, true, 'Has MediaStream present');
            } else {
              sst.deepEqual(!!sw._mediaStream, false, 'Has no MediaStream present');
            }
          }
        });

        sw.joinRoom.apply(sw, params);
      });
    };

    testItem(['test'], null);
    testItem(['test', {}], null);
    testItem([{ audio: true, video: true }], true);
    testItem([{ userData: 'test', audio: true, video: true }], true);
    testItem([{ userData: { hoho:'test'}, audio: false, video: false }], false);
    testItem([{ userData: { hoho:'test'}, audio: { stereo: false }, video: true }], true);
    testItem([{ userData: { hoho:'test'} }], null);
    testItem([{ userData: { hoho:'test'}, audio: false, video: { frameRate: 10 } }], true);
    testItem([{ userData: { hoho:'test'}, audio: [{ test: 'xx' }], video: [{ test: '2323' }] }], true);
  });
});

test.skip('#method_leaveRoom()', function(t) {
  t.plan(3);

  sw.init(apikey, function () {

  t.test('Testing parameters', function (st) {
    st.plan(6);

    st.test('When parameters is ()', function (sst) {
      sst.plan(2);

      sw.once('peerLeft', function () {
        setTimeout(function () {
          sst.deepEqual(!!sw._mediaStream, false, 'Stops MediaStream');
        }, 1500);
        sst.pass('Triggers event');
      });

      sw.joinRoom({ audio: true, video: true }, function (err, success) {
        if (err) {
          sst.fail('Failed joining room ' + JSON.stringify(err));
          sst.end();
        } else {
          sw.leaveRoom();
        }
      });
    });

    st.test('When parameters is (false)', function (sst) {
      sst.plan(2);

      sw.once('peerLeft', function () {
        setTimeout(function () {
          sst.deepEqual(!!sw._mediaStream, true, 'Does not stop MediaStream');
        }, 1500);
        sst.pass('Triggers event');
      });

      sw.joinRoom({ audio: true, video: true }, function (err, success) {
        if (err) {
          sst.fail('Failed joining room ' + JSON.stringify(err));
          sst.end();
        } else {
          sw.leaveRoom(false);
        }
      });
    });

    st.test('When parameters is ({ userMedia: false })', function (sst) {
      sst.plan(2);

      sw.once('peerLeft', function () {
        setTimeout(function () {
          sst.deepEqual(!!sw._mediaStream, true, 'Does not stop MediaStream');
        }, 1500);
        sst.pass('Triggers event');
      });

      sw.joinRoom({ audio: true, video: true }, function (err, success) {
        if (err) {
          sst.fail('Failed joining room ' + JSON.stringify(err));
          sst.end();
        } else {
          sw.leaveRoom({ userMedia: false });
        }
      });
    });

    st.test('When parameters is ({ screenshare: false })', function (sst) {
      sst.plan(2);

      sw.once('peerLeft', function () {
        setTimeout(function () {
          sst.deepEqual(!!sw._mediaStream, false, 'Stops MediaStream');
        }, 1500);
        sst.pass('Triggers event');
      });

      sw.joinRoom({ audio: true, video: true }, function (err, success) {
        if (err) {
          sst.fail('Failed joining room ' + JSON.stringify(err));
          sst.end();
        } else {
          sw.leaveRoom({ screenshare: false });
        }
      });
    });

    st.test('When parameters is (false, callback)', function (sst) {
      sst.plan(2);

      sw.once('peerLeft', function () {
        setTimeout(function () {
          sst.deepEqual(!!sw._mediaStream, true, 'Does not stop MediaStream');
        }, 1500);
        sst.pass('Triggers event');
      });

      sw.joinRoom({ audio: true, video: true }, function (err, success) {
        if (err) {
          sst.fail('Failed joining room ' + JSON.stringify(err));
          sst.end();
        } else {
          sw.leaveRoom(false, function () {});
        }
      });
    });

    st.test('When parameters is (callback)', function (sst) {
      sst.plan(2);

      sw.once('peerLeft', function () {
        setTimeout(function () {
          sst.deepEqual(!!sw._mediaStream, false, 'Stops MediaStream');
        }, 1500);
        sst.pass('Triggers event');
      });

      sw.joinRoom({ audio: true, video: true }, function (err, success) {
        if (err) {
          sst.fail('Failed joining room ' + JSON.stringify(err));
          sst.end();
        } else {
          sw.leaveRoom(function () {});
        }
      });
    });
  });

  t.test('Testing callback error states', function(st) {
    st.plan(3);

    var testItem = function(params) {
      st.test('When paraemters is (' + JSON.stringify(params) + ')', function(sst) {
        sst.plan(2);

        params.push(function (err, success) {
          console.info('result', err, success);
          if (success) {
            sst.fail('Received success instead of error ' + JSON.stringify(success));
            sst.end();
          } else {
            sst.deepEqual(success, null, 'Success should be empty');
            sst.deepEqual(typeof err === 'object' && err !== null, true,
              'Should received error');
          }
        });

        sw.joinRoom({ audio: true, video: false }, function (err, success) {
          if (err) {
            sst.fail('Failed joining room ' + JSON.stringify(err));
            sst.end();
          }
          sw.leaveRoom.apply(sw, params);
        });
      });
    };

    testItem([null]);
    testItem([1232]);
    testItem(['test']);
  });

  t.test('Testing callback success states', function (st) {
    st.plan(7);

    var testItem = function(params) {
      st.test('When paraemters is (' + JSON.stringify(params) + ')', function(sst) {
        sst.plan(2);

        var expected = {};

        sw.once('peerJoined', function (peerId, peerInfo) {
          expected = {
            previousRoom: peerInfo.room,
            peerId: peerId
          };
        });

        params.push(function (err, success) {
          console.info('result', err, success);
          if (err) {
            sst.fail('Received error instead of success ' + JSON.stringify(err));
            sst.end();
          } else {
            sst.deepEqual(err, null, 'Error should be empty');
            sst.deepEqual(success, expected, 'Should match expected success');
          }
        });

        sw.joinRoom({ audio: true, video: false }, function (err, success) {
          if (err) {
            sst.fail('Failed joining room ' + JSON.stringify(err));
            sst.end();
          }
          sw.leaveRoom.apply(sw, params);
        });
      });
    };

    testItem([false]);
    testItem([true]);
    testItem([]);
    testItem([{ userMedia: true, screenshare: true }]);
    testItem([{ userMedia: true, screenshare: false }]);
    testItem([{ userMedia: false, screenshare: false }]);
    testItem([{ userMedia: false, screenshare: true }]);
  }); });
});

test('#method_lockRoom()', function (t) {
  t.plan(1);

  var states = [];

  sw.once('roomLock', function (locked) {
    states.push(sw._roomLocked);
    t.deepEqual(states, [false, true], 'Room locked states in order');
  });

  sw.joinRoom('lockme', function (err, success) {
    if (err) {
      t.fail('Failed joining room ' + JSON.stringify(err));
    } else {
      states.push(sw._roomLocked);
      sw.lockRoom();
    }
  });
});

test('#method_unlockRoom()', function (t) {
  t.plan(1);

  var states = [];

  sw.once('roomLock', function (locked) {
    states.push(sw._roomLocked);
    t.deepEqual(states, [true, false], 'Room locked states in order');
  });

  states.push(sw._roomLocked);
  setTimeout(function () {
    sw.unlockRoom();
  }, 1500);
});

test('#event_peerJoined', function(t) {
  t.plan(1);

  var peers = [];

  sw.on('peerJoined', function (peerId, peerInfo, isSelf) {
    console.info('joined1', peerId, peerInfo, isSelf);
    peers.push({
      peerId: typeof peerId,
      userData: peerInfo.userData,
      isSelf: isSelf
    });

    if (!isSelf) {
      sw.off('peerJoined');

      t.deepEqual(peers, [
        { peerId: 'string', userData: 'PEER1a', isSelf: true },
        { peerId: 'string', userData: 'PEER2', isSelf: false }
      ], 'Triggers in order');
    }
  });

  sw.joinRoom({
    video: false,
    audio: false,
    userData: 'PEER1a'
  });
});

test('#event_peerLeft', function(t) {
  t.plan(1);

  var peers = [];

  sw.once('peerJoined', function (peerId, peerInfo, isSelf) {
    console.info('joined1', peerId, peerInfo, isSelf);

    sw.on('peerLeft', function (peerId, peerInfo, isSelf) {
      console.info('I have left', peerId, peerInfo, isSelf);
      peers.push({
        peerId: typeof peerId,
        userData: peerInfo.userData,
        isSelf: isSelf
      });

      if (isSelf) {
        sw.off('peerLeft');
        t.deepEqual(peers, [
          { peerId: 'string', userData: 'PEER2', isSelf: false },
          { peerId: 'string', userData: 'PEER1b', isSelf: true }
        ], 'Triggers in order');
      }
    });
    sw.leaveRoom();
  }, function (peerId, peerInfo, isSelf) {
    return !isSelf;
  });

  sw.joinRoom({
    video: false,
    audio: false,
    userData: 'PEER1b'
  });
});

test('#event_roomLock', function (t) {
  t.plan(1);

  var states = [];

  // This doesnt test the other party
  sw.on('roomLock', function (isLocked, peerId, peerInfo, isSelf) {
    states.push({
      isLocked: isLocked,
      isSelf: true
    });

    if (states.length === 2) {
      sw.off('roomLock');
      t.deepEqual(states, [
        { isLocked: true, isSelf: true },
        { isLocked: false, isSelf: false }
      ], 'Triggers for self when room is locked');
    }
  });

  sw.lockRoom();
  sw.unlockRoom();
});

test('#event_systemAction', function (t) {
  t.plan(2);

  sw.once('systemAction', function (action, content, reason) {
    t.deepEqual(reason, sw.SYSTEM_ACTION_REASON.ROOM_LOCKED,
      'Matches expected reason');
    t.deepEqual(action, sw.SYSTEM_ACTION.REJECT,
      'Matches expected system action');
  });

  sw.once('iceConnectionState', function () {
    sw.joinRoom();
  }, function (state) {
    return state === sw.ICE_CONNECTION_STATE.COMPLETED;
  });

  sw.joinRoom({
    audio: false,
    video: false,
    userData: 'PEERLOCK'
  }, function (err) {
    if (err) {
      t.fail('Failed joining room ' + JSON.stringify(err));
    }
  });
});

})();
