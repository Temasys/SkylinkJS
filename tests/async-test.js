(function() {

'use strict';

var test = require('tape');

window.io = require('socket.io-client');

window.AdapterJS = require('./../node_modules/adapterjs/publish/adapter.screenshare.js');
var skylink  = require('./../publish/skylink.debug.js');

window.sw = new skylink.Skylink();

//sw.setLogLevel(4);

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';


console.log('API: Tests the all the callbacks in functions');
console.log('===============================================================================================');



test('sendStream() - callback: Testing success callback', function(t){
  t.plan(18);

  var stream_callback = function(error, success, hasNoVideo){
    t.deepEqual([error, typeof success],
      [null, 'object'], 'Callback returns a success instead of error');

    t.deepEqual(typeof success.getAudioTracks, 'function',
      'Callback success.getAudioTracks returns a function');
    t.deepEqual(typeof success.getVideoTracks, 'function',
      'Callback success.getVideoTracks returns a function');
    t.deepEqual(success.getAudioTracks().length, 1,
      'Callback success.getAudioTracks() has a length of 1');
    t.deepEqual(typeof success.getAudioTracks()[0], 'object',
      'Callback success.getAudioTracks()[0] is an object');
    t.deepEqual(typeof success.getAudioTracks()[0].enabled, 'boolean',
      'Callback success.getAudioTracks()[0].enabled is a boolean');


    if (!hasNoVideo) {
      t.deepEqual(success.getVideoTracks().length, 1,
      'Callback success.getVideoTracks() has a length of 1');
      t.deepEqual(typeof success.getVideoTracks()[0], 'object',
        'Callback success.getVideoTracks()[0] is an object');
      t.deepEqual(typeof success.getVideoTracks()[0].enabled, 'boolean',
        'Callback success.getVideoTracks()[0].enabled is a boolean');
    } else {
      t.deepEqual(success.getVideoTracks().length, 0,
        'Callback success.getVideoTracks() has a length of 0');
      t.deepEqual(typeof success.getVideoTracks()[0], 'undefined',
        'Callback success.getVideoTracks()[0] is undefined');
      try {
        success.getVideoTracks()[0].enabled = false;
      } catch (error) {
        t.pass('Callback success.getVideoTracks()[0].enabled fails');
      }
    }
  };

  var test1 = function () {
    console.log('Testing scenario 1: Sending stream options { audio: true, video: true }');
    sw.sendStream({
      audio: true,
      video: true
    }, function (error, success) {
      stream_callback(error, success, false);
      test2();
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: Sending MediaStream stream');

    getUserMedia({ audio: true, video: false }, function (stream) {
      sw.sendStream(stream, function (error, success) {
        stream_callback(error, success, true);
      });
    }, function (error) {
      console.error('Failed with:', error);
    });
  };

  sw.init(apikey,function(initError, initSuccess){
    if (initSuccess) {
      sw.joinRoom({userData: 'PEER1'}, function (error, success) {
        test1();
      });
    } else {
      t.fail('')
    }
  });

  setTimeout(function () {
    sw.leaveRoom(function (error, success) {
      if (error) {
        console.error('sendStream() - callback: Leave room error', error);
      }
      t.end();
    });
  }, 18000);
});

test('sendStream() - callback: Testing failure callback', function(t){
  t.plan(2);

  var stream_callback = function(error, success){
    t.deepEqual([typeof error, success], ['object', null],
      'Callback returns an error instead of success')
  };

  var test1 = function () {
    console.log('Testing scenario 1: Sending non-object');
    sw.sendStream(1234, function (error, success) {
      stream_callback(error, success);
      test2();
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: Sending null');
    sw.sendStream(null, stream_callback);
  };

  sw.init(apikey,function(){
    sw.joinRoom({userData: 'PEER1'}, function () {
      test1();
    });
  });

  setTimeout(function () {
    sw.leaveRoom(function () {
      t.end();
    });
  }, 9000);
});

test('getUserMedia() - callback: Testing success callback', function(t){
  t.plan(15);

  var media_callback = function(error,success){
    t.deepEqual([error, typeof success],
      [null, 'object'], 'Callback returns a success instead of error');
    t.deepEqual(typeof success.getAudioTracks, 'function',
      'Callback success.getAudioTracks returns a function');
    t.deepEqual(typeof success.getVideoTracks, 'function',
      'Callback success.getVideoTracks returns a function');
    t.deepEqual(Array.isArray(success.getAudioTracks()), true,
      'Callback success.getAudioTracks() returns an array');
    t.deepEqual(Array.isArray(success.getVideoTracks()), true,
      'Callback success.getAudioTracks() returns an array');
  };

  var test1 = function () {
    console.log('Testing scenario 1: Constraints { audio: true, video: true }');
    sw.getUserMedia({
      audio: true,
      video: true
    }, function (error, success) {
      media_callback(error, success);
      test2();
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: Constraints { audio: true, video: false }');
    sw.getUserMedia({
      audio: true,
      video: false
    }, function (error, success) {
      media_callback(error, success);
      test3();
    });
  };

  var test3 = function () {
    console.log('Testing scenario 3: Constraints not provided');
    sw.getUserMedia(media_callback);
  };

  test1();

  setTimeout(function () {
    t.end();
  }, 5000);
});

test('getUserMedia() - callback: Testing failure callback', function(t){
  t.plan(3);

  var media_callback = function(error,success){
    t.deepEqual([typeof error, success],
      ['object', null], 'Callback returns an error instead of success');
  };

  var test1 = function () {
    console.log('Testing scenario 1: Constraints null');
    sw.getUserMedia(null, function (error, success) {
      media_callback(error, success);
      test2();
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: Constraints {}');
    sw.getUserMedia({}, function (error, success) {
      media_callback(error, success);
      test3();
    });
  };

  var test3 = function () {
    console.log('Testing scenario 3: Constraints { audio: false, video: false }');
    sw.getUserMedia({
      audio: false,
      video: false
    }, media_callback);
  };

  test1();

  setTimeout(function () {
    t.end();
  }, 5000);
});

test.skip('Test init callback', function(t){
  t.plan(1);
  var array=[];
  var init_callback = function(error,success){
    if (error){
      console.log('Error init');
      array.push(-1);
    }
    else{
      console.log('Success init');
      array.push(1);
    }
  };

  sw.init(init_callback);
  sw.init(apikey,init_callback);
  setTimeout(function () {
    t.deepEqual(array, [-1,1], 'Test init callback');
    t.end();
  }, 4000);
});

test('sendBlobData() - callback: Testing success callback', function(t){
  t.plan(14);

  var data = new Blob(['<a id="a"><b id="b">PEER1</b></a>']);
  data.name = 'accept';
  var targetPeer = null;
  var file_callback = function(error, success){
    t.deepEqual([error, typeof success], [null, 'object'],
      'Callback returns an success instead of error');
    t.deepEqual(typeof success.transferId, 'string',
      'Callback success.transferId returns a "string"');
    t.deepEqual(success.listOfPeers instanceof Array, true,
      'Callback success.listOfPeers returns an "Array"');
    t.deepEqual(typeof success.isPrivate, 'boolean',
      'Callback success.isPrivate returns a "boolean"');
    t.deepEqual(typeof success.transferInfo,
      'object', 'Callback success.transferInfo returns an "object"');

    // incase error
    var listOfPeers = success.listOfPeers || [];

    // single peer deprecated state
    if (listOfPeers.length === 1 && success.isPrivate) {
      t.deepEqual(typeof success.state, 'string',
        'Callback success.state returns a "string"');
      t.deepEqual(typeof success.peerId, 'string',
        'Callback success.peerId returns a "string"');

    // more than one peer
    } else {
      t.deepEqual(success.state, null,
        'Callback success.state returns null for non-single peer');
      t.deepEqual(success.peerId, null,
        'Callback success.peerId returns null for non-single peer');
    }
  };

  var test1 = function () {
    console.log('Testing scenario 1: Normal file sending');
    sw.sendBlobData(data, function (error, success) {
      targetPeer = success.listOfPeers[0];
      file_callback(error, success);
      test2();
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: Normal file sending - ' +
      'single targeted peer "' + targetPeer + '"');
    sw.sendBlobData(data, targetPeer, file_callback);
  }

  sw.on('dataChannelState', function (state, peerId, error, name, type) {
    if (state === sw.DATA_CHANNEL_STATE.OPEN &&
      type === sw.DATA_CHANNEL_TYPE.MESSAGING) {
      test1();
      sw._EVENTS.dataChannelState = [];
    }
  });

  sw.init(apikey,function(){
    sw.joinRoom({userData: 'self'});
  });

  setTimeout(function () {
    if (!sw._inRoom) {
      t.fail('User was not in any room');
    }
    sw.leaveRoom(function () {
      t.end();
    });
  }, 12000);
});

test('sendBlobData() - callback: Testing failure callback', function(t){
  t.plan(40);

  var data = new Blob(['<a id="a"><b id="b">PEER1</b></a>']);
  data.name = 'reject';
  var targetPeer = null;
  var displayCloseChannel = true;
  var file_callback = function(error, success){
    t.deepEqual([typeof error, success], ['object', null],
      'Callback returns an error instead of success');
    t.deepEqual(typeof error.transferId, 'string',
      'Callback error.transferId returns a "string"');
    t.deepEqual(error.listOfPeers instanceof Array, true,
      'Callback error.listOfPeers returns an "Array"');
    t.deepEqual(typeof error.isPrivate, 'boolean',
      'Callback error.isPrivate returns a "boolean"');
    t.deepEqual(typeof error.transferErrors, 'object',
      'Callback error.transferErrors returns an "object"');
    t.deepEqual(Object.keys(error.transferErrors).length > 0,
      true, 'Callback error.transferErrors contains errors');
    t.deepEqual(typeof error.transferInfo,
      'object', 'Callback error.transferInfo returns an "object"');

    // incase error
    var listOfPeers = error.listOfPeers || [];

    // single peer deprecated state
    if (listOfPeers.length === 1 && error.isPrivate) {
      t.deepEqual(typeof error.state, 'string',
        'Callback error.state returns a "string"');
      t.deepEqual(typeof error.error, 'object',
        'Callback error.error returns an "object"');
      t.deepEqual(typeof error.peerId, 'string',
        'Callback error.peerId returns a "string"');

    // more than one peer
    } else {
      t.deepEqual(error.state, null,
        'Callback error.state returns null for non-single peer');
      t.deepEqual(error.error, null,
        'Callback error.error returns null for non-single peer');
      t.deepEqual(error.peerId, null,
        'Callback error.peerId returns null for non-single peer');
    }
  };

  // scenario 1: provided data is not a blob
  var test1 = function () {
    console.log('Testing scenario 1: Provided data is not a blob');
    sw.sendBlobData(null, function (error, success) {
      targetPeer = error.listOfPeers[0];
      file_callback(error, success);
      test2();
    });
  };

  // scenario 2: _enableDataChannel is false
  var test2 = function () {
    console.log('Testing scenario 2: Datachannel is not enabled');
    sw._enableDataChannel = false;
    sw.sendBlobData(data, function (error, success) {
      sw._enableDataChannel = true;
      file_callback(error, success);
      test3();
    });
  };

  // scenario 3: skip scenario: no available datachannels
  // scenario (possible): targeted Peer with failure case
  // to check that it returns a string

  // scenario 4: rejecton
  var test3 = function () {
    console.log('Testing scenario 3: Peer rejected file');
    sw.sendBlobData(data, function (error, success) {
      file_callback(error, success);
      test4();
    });
  };

  // scenario 5: rejecton - with targeted single peer
  var test4 = function () {
    console.log('Testing scenario 4: Peer rejected file - ' +
      'single targeted peer "' + targetPeer + '"');
    sw.sendBlobData(data, targetPeer, file_callback);
  };

  sw.on('dataChannelState', function (state, peerId, error, name, type) {
    if (state === sw.DATA_CHANNEL_STATE.OPEN &&
      type === sw.DATA_CHANNEL_TYPE.MESSAGING) {
      test1();
      sw._EVENTS.dataChannelState = [];
    }

    if (state === sw.DATA_CHANNEL_STATE.CLOSED &&
      type === sw.DATA_CHANNEL_TYPE.MESSAGING && displayCloseChannel) {
      console.warn('Data channel has closed', peerId, name, type);
    }
  });

  sw.init(apikey,function(error, success){
    // start test
    sw.joinRoom({userData: 'self'});
  });

  setTimeout(function () {
    if (!sw._inRoom) {
      t.fail('User was not in any room');
    }
    sw.leaveRoom(function () {
      sw._EVENTS.dataChannelState = [];
      t.end();
    });
  }, 25000);
});

test('sendURLData() - callback: Testing success callback', function(t){
  t.plan(14);

  // accept - 77
  var data = 'data:image/77;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  var targetPeer = null;
  var file_callback = function(error, success){
    t.deepEqual([error, typeof success], [null, 'object'],
      'Callback returns an success instead of error');
    t.deepEqual(typeof success.transferId, 'string',
      'Callback success.transferId returns a "string"');
    t.deepEqual(success.listOfPeers instanceof Array, true,
      'Callback success.listOfPeers returns an "Array"');
    t.deepEqual(typeof success.isPrivate, 'boolean',
      'Callback success.isPrivate returns a "boolean"');
    t.deepEqual(typeof success.transferInfo,
      'object', 'Callback success.transferInfo returns an "object"');

    // incase error
    var listOfPeers = success.listOfPeers || [];

    // single peer deprecated state
    if (listOfPeers.length === 1 && success.isPrivate) {
      t.deepEqual(typeof success.state, 'string',
        'Callback success.state returns a "string"');
      t.deepEqual(typeof success.peerId, 'string',
        'Callback success.peerId returns a "string"');

    // more than one peer
    } else {
      t.deepEqual(success.state, null,
        'Callback success.state returns null for non-single peer');
      t.deepEqual(success.peerId, null,
        'Callback success.peerId returns null for non-single peer');
    }
  };

  var test1 = function () {
    console.log('Testing scenario 1: Normal dataURL sending');
    sw.sendURLData(data, function (error, success) {
      targetPeer = success.listOfPeers[0];
      file_callback(error, success);
      test2();
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: Normal dataURL sending - ' +
      'single targeted peer "' + targetPeer + '"');
    sw.sendURLData(data, targetPeer, file_callback);
  }

  sw.on('dataChannelState', function (state, peerId, error, name, type) {
    if (state === sw.DATA_CHANNEL_STATE.OPEN &&
      type === sw.DATA_CHANNEL_TYPE.MESSAGING) {
      test1();
      sw._EVENTS.dataChannelState = [];
    }
  });

  sw.init(apikey,function(){
    sw.joinRoom({userData: 'self'});
  });

  var testEnd = setTimeout(function () {
    if (!sw._inRoom) {
      t.fail('User was not in any room');
    }
    sw.leaveRoom(function () {
      t.end();
    });
  }, 12000);
});

test('sendURLData() - callback: Testing failure callback', function(t){
  t.plan(40);

  // reject - 78
  var data = 'data:image/078;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  var targetPeer = null;
  var displayCloseChannel = true;
  var file_callback = function(error, success){
    t.deepEqual([typeof error, success], ['object', null],
      'Callback returns an error instead of success');
    t.deepEqual(typeof error.transferId, 'string',
      'Callback error.transferId returns a "string"');
    t.deepEqual(error.listOfPeers instanceof Array, true,
      'Callback error.listOfPeers returns an "Array"');
    t.deepEqual(typeof error.isPrivate, 'boolean',
      'Callback error.isPrivate returns a "boolean"');
    t.deepEqual(typeof error.transferErrors, 'object',
      'Callback error.transferErrors returns an "object"');
    t.deepEqual(Object.keys(error.transferErrors).length > 0,
      true, 'Callback error.transferErrors contains errors');
    t.deepEqual(typeof error.transferInfo,
      'object', 'Callback error.transferInfo returns an "object"');

    // incase error
    var listOfPeers = error.listOfPeers || [];

    // single peer deprecated state
    if (listOfPeers.length === 1 && error.isPrivate) {
      t.deepEqual(typeof error.state, 'string',
        'Callback error.state returns a "string"');
      t.deepEqual(typeof error.error, 'object',
        'Callback error.error returns an "object"');
      t.deepEqual(typeof error.peerId, 'string',
        'Callback error.peerId returns a "string"');

    // more than one peer
    } else {
      t.deepEqual(error.state, null,
        'Callback error.state returns null for non-single peer');
      t.deepEqual(error.error, null,
        'Callback error.error returns null for non-single peer');
      t.deepEqual(error.peerId, null,
        'Callback error.peerId returns null for non-single peer');
    }
  };

  // scenario 1: provided data is not a blob
  var test1 = function () {
    console.log('Testing scenario 1: Provided data is not a dataURL');
    sw.sendURLData(null, function (error, success) {
      targetPeer = error.listOfPeers[0];
      file_callback(error, success);
      test2();
    });
  };

  // scenario 2: _enableDataChannel is false
  var test2 = function () {
    console.log('Testing scenario 2: Datachannel is not enabled');
    sw._enableDataChannel = false;
    sw.sendURLData(data, function (error, success) {
      sw._enableDataChannel = true;
      file_callback(error, success);
      test3();
    });
  };

  // scenario 3: skip scenario: no available datachannels
  // scenario (possible): targeted Peer with failure case
  // to check that it returns a string

  // scenario 4: rejecton
  var test3 = function () {
    console.log('Testing scenario 3: Peer rejected dataURL');
    sw.sendURLData(data, function (error, success) {
      file_callback(error, success);
      test4();
    });
  };

  // scenario 5: rejecton - with targeted single peer
  var test4 = function () {
    console.log('Testing scenario 4: Peer rejected dataURL - ' +
      'single targeted peer "' + targetPeer + '"');
    sw.sendURLData(data, targetPeer, file_callback);
  };

  sw.on('dataChannelState', function (state, peerId, error, name, type) {
    if (state === sw.DATA_CHANNEL_STATE.OPEN &&
      type === sw.DATA_CHANNEL_TYPE.MESSAGING) {
      test1();
      sw._EVENTS.dataChannelState = [];
    }

    if (state === sw.DATA_CHANNEL_STATE.CLOSED &&
      type === sw.DATA_CHANNEL_TYPE.MESSAGING && displayCloseChannel) {
      console.warn('Data channel has closed', peerId, name, type);
    }
  });

  sw.init(apikey,function(error, success){
    // start test
    sw.joinRoom({userData: 'self'});
  });

  setTimeout(function () {
    if (!sw._inRoom) {
      t.fail('User was not in any room');
    }
    sw.leaveRoom(function () {
      sw._EVENTS.dataChannelState = [];
      t.end();
    });
  }, 25000);
});

test('joinRoom() - callback: Testing success callback', function(t){
  t.plan(20);
  var roomName;
  var join_callback = function(error, success, roomName){
    t.deepEqual([error, typeof success],
      [null, 'object'], 'Callback returns a success instead of error');
    t.deepEqual(typeof success.room,
      'string', 'Callback success.room returns a string');
    t.deepEqual(success.room,
      roomName, 'Callback success.room equals the expected roomname');
    t.deepEqual(typeof success.peerId,
      'string', 'Callback success.peerId returns a string');
    t.deepEqual(typeof success.peerInfo,
      'object', 'Callback success.peerInfo returns an object');
  };

  var test1 = function () {
    console.log('Testing scenario 1: Joining room with options (callback)');

    sw.joinRoom(function(error, success) {
      join_callback(error, success, sw._defaultRoom);
      test2();
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: Joining room with options (roomName, callback)');

    roomName = 'test2';

    sw.joinRoom(roomName, function (error, success) {
      join_callback(error, success, roomName);
      test3();
    });
  };

  var test3 = function () {
    console.log('Testing scenario 3: Joining room with options (roomName, mediaOptions, callback)');

    roomName = 'test3';

    sw.joinRoom(roomName, {
      audio: true,
      video: true
    }, function (error, success) {
      join_callback(error, success, roomName);
      test4();
    });
  };

  var test4 = function () {
    console.log('Testing scenario 4: Joining room with options (mediaOptions, callback)');

    sw.joinRoom({
      audio: true,
      video: true
    }, function (error, success) {
      join_callback(error, success, sw._defaultRoom);
    });
  };

  sw.init(apikey, test1);

  setTimeout(function () {
    t.end();
  }, 18000);
});

test('joinRoom() - callback: Testing failure callback', function(t){
  t.plan(20);
  var roomName;
  var join_callback = function(error, success, roomName){
    t.deepEqual([typeof error, success],
      ['object', null], 'Callback returns an error instead of success');
    t.deepEqual(typeof error.room,
      'string', 'Callback error.room returns a string');
    t.deepEqual(error.room,
      roomName, 'Callback error.room equals the expected roomname');
    t.deepEqual(typeof error.errorCode,
      'number', 'Callback error.errorCode returns a number');
    t.deepEqual(typeof error.error,
      'object', 'Callback error.error returns an object');
  };

  var test1 = function () {
    console.log('Testing scenario 1: Joining room with options (null, callback)');

    sw.joinRoom(null, function(error, success) {
      join_callback(error, success, sw._defaultRoom);
      test2();
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: Joining room with options (null, null, callback)');

    sw.joinRoom(null, null, function (error, success) {
      join_callback(error, success, sw._defaultRoom);
      test3();
    });
  };

  var test3 = function () {
    console.log('Testing scenario 3: Joining room with options (roomName, null, callback)');

    roomName = 'test3';

    sw.joinRoom(roomName, null, function (error, success) {
      join_callback(error, success, roomName);
      test4();
    });
  };

  var test4 = function () {
    console.log('Testing scenario 4: Joining room with options (null, mediaOptions, callback)');

    sw.joinRoom(null, {
      audio: true,
      video: true
    }, function (error, success) {
      join_callback(error, success, sw._defaultRoom);
    });
  };

  test1();

  setTimeout(function () {
    t.end();
  }, 18000);
});

test('leaveRoom() - callback: Testing success callback', function(t){
  t.plan(24);
  var roomName;
  var leave_callback = function(error, success, roomName, noMedia){
    t.deepEqual([error, typeof success],
      [null, 'object'], 'Callback returns a success instead of error');
    t.deepEqual(typeof success.peerId,
      'string', 'Callback success.peerId returns a string');
    t.deepEqual(typeof success.previousRoom,
      'string', 'Callback success.previousRoom returns a string');
    t.deepEqual(success.previousRoom,
      roomName, 'Callback success.previousRoom equals the expected roomname');
  };

  var test1 = function () {
    console.log('Testing scenario 1: Leaving room with options (callback) in defaultroom');

    sw.joinRoom(function(jRError, jRSuccess) {
      if (jRSuccess) {
        sw.leaveRoom(function(error, success){
          leave_callback(error, success, sw._defaultRoom, true);
          test2();
        });
      } else {
        t.fail('Failed joining room for Test 1');
        test2();
      }
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: Leaving room with options (callback) in "test2"');

    roomName = 'test2';

    sw.joinRoom(roomName, function(jRError, jRSuccess) {
      if (jRSuccess) {
        sw.leaveRoom(function(error, success){
          leave_callback(error, success, roomName, true);
          test3();
        });
      } else {
        t.fail('Failed joining room for Test 2');
      }
    });
  };

  var test3 = function () {
    console.log('Testing scenario 3: Leaving room with options (false, callback) in defaultroom');

    sw.joinRoom(function() {
      sw.leaveRoom(false, function(error, success){
        leave_callback(error, success, sw._defaultRoom, false);
        test4();
      });
    });
  };

  var test4 = function () {
    console.log('Testing scenario 4: Leaving room with options (false, callback) in "test4"');

    roomName = 'test4';

    sw.joinRoom(roomName, function() {
      sw.leaveRoom(false, function(error, success){
        leave_callback(error, success, roomName, false);
        test5();
      });
    });
  };

  var test5 = function () {
    console.log('Testing scenario 5: Leaving room with options (true, callback) in defaultroom');

    sw.joinRoom(function() {
      sw.leaveRoom(true, function(error, success){
        leave_callback(error, success, sw._defaultRoom, true);
        test6();
      });
    });
  };

  var test6 = function () {
    console.log('Testing scenario 6: Leaving room with options (true, callback) in "test6"');

    roomName = 'test6';

    sw.joinRoom(roomName, function() {
      sw.leaveRoom(true, function(error, success){
        leave_callback(error, success, roomName, true);
      });
    });
  };

  sw.init(apikey, test1);

  setTimeout(function () {
    t.end();
  }, 28000);
});

test('leaveRoom() - callback: Testing failure callback', function(t){
  t.plan(4);
  var leave_callback = function(error, success){
    t.deepEqual([typeof error, success],
      ['object', null], 'Callback returns an error instead of success');
  };

  var test1 = function () {
    console.log('Testing scenario 1: Leaving room with options (null, callback)');

    sw.leaveRoom(null, function(error, success){
      leave_callback(error, success);
      test2();
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: Leaving room with options ({}, callback)');

    sw.leaveRoom({}, function(error, success){
      leave_callback(error, success);
      test3();
    });
  };

  var test3 = function () {
    console.log('Testing scenario 3: Leaving room with options ("string", callback)');

    sw.leaveRoom('string', function(error, success){
      leave_callback(error, success);
      test4();
    });
  };

  var test4 = function () {
    console.log('Testing scenario 4: Leaving room when user is not in room');

    sw._inRoom = false;
    sw.leaveRoom(function(error, success){
      leave_callback(error, success);
    });
  };

  sw.init(apikey, test1);

  setTimeout(function () {
    t.end();
  }, 8000);
});

test('refreshConnection() - callback: Testing success callback', function(t){
  t.plan(12);

  var targetPeer = null;
  var refresh_callback = function(error, success, targetPeerList){
    t.deepEqual([error, typeof success], [null, 'object'],
      'Callback returns a success instead of error');
    t.deepEqual(typeof error.listOfPeers, 'object',
      'Callback error.listOfPeers returns an "object"');
    t.deepEqual(error.listOfPeers instanceof Array, true,
      'Callback error.listOfPeers returns an "Array"');

    if (typeof targetPeerList === 'string') {
      t.deepEqual(listOfPeers, [targetPeerList],
        'Callback success.listOfPeers returns the correct list of peers (string)');
    } else if (targetPeerList instanceof Array) {
      t.deepEqual(listOfPeers, targetPeerList,
        'Callback success.listOfPeers returns the correct list of peers (array)');
    }
  };

  var test1 = function () {
    console.log('Testing scenario 1: Refresh connection with (callback)');
    sw.joinRoom(function (jRError, jRSuccess) {
      if (jRError) {
        t.fail('Failed joining room for Test 1');
      } else {
        sw.refreshConnection(function (error, success) {
          refresh_callback(error, success, Object.keys(sw._peerConnections));
          test2();
        });
      }
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: Refresh connection with (["xxxx"], callback)');
    sw.joinRoom(function (jRError, jRSuccess) {
      if (jRError) {
        t.fail('Failed joining room for Test 2');
      } else {
        targetPeer = [targetPeerId];
        sw.refreshConnection(function (error, success) {
          refresh_callback(error, success, targetPeer);
          test2();
        });
      }
    });
  };

  var test3 = function () {
    console.log('Testing scenario 2: Refresh connection with ("xxxx", callback)');
    sw.joinRoom(function (jRError, jRSuccess) {
      if (jRError) {
        t.fail('Failed joining room for Test 2');
      } else {
        targetPeer = targetPeerId;
        sw.refreshConnection(function (error, success) {
          refresh_callback(error, success, targetPeer);
          test2();
        });
      }
    });
  };

  sw.once('peerJoined', test1, function (peerId, peerInfo, isSelf) {
    if (!isSelf) {
      targetPeerId = peerId;
      return true;
    }
  });

  sw.init(apikey,function(){
    sw.joinRoom();
  });

  setTimeout(function () {
    t.end();
  }, 12000);
});

test('refreshConnection() - callback: Testing failure callback', function(t){
  t.plan(14);

  var targetPeer = null;
  var refresh_callback = function(error, success, targetPeerList){
    t.deepEqual([typeof error, success], ['object', null],
      'Callback returns an error instead of success');
    t.deepEqual(typeof error.listOfPeers, 'object',
      'Callback error.listOfPeers returns an "object"');
    t.deepEqual(error.listOfPeers instanceof Array, true,
      'Callback error.listOfPeers returns an "Array"');
    t.deepEqual(typeof error.refreshErrors, 'object',
      'Callback success.refreshErrors returns an "object"');
    t.deepEqual(Object.keys(error.refreshErrors).length,
      1, 'Callback error.refreshErrors has a length of 1');

    if (typeof targetPeerList === 'string') {
      t.deepEqual(Object.keys(error.refreshErrors), [targetPeerList],
        'Callback error.refreshErrors returns the correct list of peers (string)');
    } else if (targetPeerList instanceof Array) {
      t.deepEqual(Object.keys(error.refreshErrors), targetPeerList,
        'Callback error.refreshErrors returns the correct list of peers (array)');
    } else {
      t.deepEqual(Object.keys(error.refreshErrors), ['self'],
        'Callback error.refreshErrors returns the correct list of peers (undefined)');
    }
  };

  var test1 = function () {
    console.log('Testing scenario 1: No peers present to restart connection with (callback)');
    sw.refreshConnection(function (error, success) {
      refresh_callback(error, success);
      test2();
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: No present present to restart connection with ("xxxx", callback) ' +
      'single targeted peer "' + targetPeer + '"');

    targetPeer = 'xxxxxxxx';
    sw.refreshConnection(targetPeer, function (error, success) {
      refresh_callback(error, success, targetPeer);
    });
  };

  var test3 = function () {
    console.log('Testing scenario 3: No present present to restart connection with (["xxxx"], callback) ' +
      'single targeted peer "' + targetPeer + '"');

    targetPeer = ['xxxxxxxx'];
    sw.refreshConnection(targetPeer, function (error, success) {
      refresh_callback(error, success, targetPeer);
    });
  };

  sw.init(apikey,function(){
    sw.leaveRoom(test1);
  });

  setTimeout(function () {
    t.end();
  }, 12000);
});

})();
