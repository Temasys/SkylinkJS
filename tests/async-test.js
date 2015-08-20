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
      [null, 'object'], 'Callback returns a success instead of error')

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
      sw.sendStream(stream, stream_callback);
    }, function (error) {
      console.error('Failed with:', error);
    });
  };

  sw.init(apikey,function(){
    sw.joinRoom({userData: 'PEER1'}, function (error, success) {
      test1();
    });
  });

  /*setTimeout(function () {
    sw.leaveRoom(function () {
      t.end();
    });
  }, 18000);*/
});

test('sendStream() - callback: Testing failure callback', function(t){
  t.plan(4);

  var stream_callback = function(error, success){
    t.deepEqual([typeof error, success], ['object', null],
      'Callback returns an error instead of success')
    t.deepEqual(typeof error, 'object',
      'Callback error returns an error object');
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

test.skip('getUserMedia() - callback: Testing callback', function(t){
  t.plan(1);

  var media_callback = function(error,success){
    if (error){
      t.fail('Get user media callback - failure');
    }
    else{
      t.pass('Get user media callback - success');
    }
    t.end();
  };

  sw.init(apikey,function(){
    sw.getUserMedia({
      audio: true,
      video: true
    },media_callback);
  });
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

<<<<<<< HEAD
  var testEnd = setTimeout(function () {
    if (!sw._inRoom) {
      t.fail('User was not in any room');
    }
=======
  setTimeout(function () {
>>>>>>> 8efb0c8... ESS-330 #comment Testing sendStream() payload (in-progress).
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

test.skip('joinRoom() - callback: Testing callback', function(t){
  t.plan(1);
  var array = [];
  var count = 0;
  var join_callback = function(error, success){
    if (error){
      array.push('error');
    }
    else{
      array.push(count);
      count++;
    }
  };

  sw.init(apikey,function(){
    sw.joinRoom(function(){
      join_callback();
      sw.joinRoom(join_callback);
    });
  });

  setTimeout(function () {
    t.deepEqual(array, [0,1], 'Test joinRoom callback');
    t.end();
  }, 8000);
});

test.skip('leaveRoom() - callback: Testing callback (in joinRoom() callback)', function(t){
  t.plan(1);
  var array = [];
  var leave_callback = function(error, success){
    if (error){
      array.push('leave_error');
      console.log(JSON.stringify(error));
    }
    else{
      array.push('leave_success');
    }
  };

  var join_callback = function(error, success){
    if (error){
      array.push('join_error');
    }
    else{
      array.push('join_success');
      sw.leaveRoom(leave_callback);
    }
  };

  sw.init(apikey,function(){
    sw.joinRoom(join_callback);
  });

  setTimeout(function () {
    t.deepEqual(array, ['join_success','leave_success'], 'Success callback called');
    sw.leaveRoom();
    t.end();
  }, 5000);
});

test.skip('refreshConnection() - callback: Testing callback', function(t){
  t.plan(1);
  var array = [];
  var callback = function(error, success){
    if (error){
      array.push(-1);
      console.log(error);
    }
    else{
      array.push(1);
    }
  };

  var peer = Object.keys(sw._peerConnections)[0];

  sw.refreshConnection(callback);
  sw.refreshConnection(['xxxxxxxxxx'], callback);
  sw.refreshConnection(peer, callback);
  sw.refreshConnection([peer], callback);

  setTimeout(function () {
    t.deepEqual(array, [-1, -1, 1, 1], 'Test refreshConnection callback called');
    sw.leaveRoom();
    t.end();
  },15000);
});

})();
