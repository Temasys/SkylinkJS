(function() {

'use strict';

// Dependencies
var exports = require('../config.js');
var sw = new Skylink();


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
      console.error('Failed getting user media for sendStream() - success callback Test 2', error);
      t.fail('Failed getting user media for sendStream() - success callback Test 2');
    });
  };

  sw.init(apikey,function(initError, initSuccess){
    if (initError) {
      console.log('ERROR: Failed initialising for sendStream() - success callback tests');
      console.error('sendStream() - success callback: Initialising error', initError);
    } else {
      sw.joinRoom({userData: 'PEER1'}, function (jRError, jRSuccess) {
        if (jRError) {
          console.log('ERROR: Failed joining room for sendStream() - success callback tests');
          console.error('sendStream() - success callback: Joining room error', jRError);
        } else {
          test1();
        }
      });
    }
  });

  setTimeout(function () {
    sw.leaveRoom(function (lRError, lRSuccess) {
      if (lRError) {
        console.log('ERROR: Failed leaving the room for sendStream() - success callback tests');
        console.error('sendStream() - success callback: Leave room error', lRError);
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

  sw.init(apikey,function(initError, initSuccess){
    if (initError) {
      console.log('ERROR: Failed initialising for sendStream() - failure callback tests');
      console.error('sendStream() - failure callback: Initialising error', initError);
    } else {
      sw.joinRoom({userData: 'PEER1'}, function (jRError, jRSuccess) {
        if (jRError) {
          console.log('ERROR: Failed joining room for sendStream() - failure callback tests');
          console.error('sendStream() - failure callback: Joining room error', jRError);
        } else {
          test1();
        }
      });
    }
  });

  setTimeout(function () {
    sw.leaveRoom(function (lRError, lRSuccess) {
      if (lRError) {
        console.log('ERROR: Failed leaving the room for sendStream() - failure callback tests');
        console.error('sendStream() - failure callback: Leave room error', lRError);
      }
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

test('init() - callback: Testing success callback', function(t){
  t.plan(46);

  var init_callback = function(error, success, options){
    t.deepEqual([error, typeof success],
      [null, 'object'], 'Callback returns a success instead of error');

    t.deepEqual(typeof success.serverUrl, 'string',
      'Callback success.serverUrl returns a string');
    t.deepEqual(typeof success.readyState, 'number',
      'Callback success.readyState returns a number');
    t.deepEqual(typeof success.appKey, 'string',
      'Callback success.appKey returns a string');
    t.deepEqual(typeof success.roomServer, 'string',
      'Callback success.roomServer returns a string');
    t.deepEqual(typeof success.defaultRoom, 'string',
      'Callback success.defaultRoom returns a string');
    t.deepEqual(typeof success.selectedRoom, 'string',
      'Callback success.selectedRoom returns a string');
    t.deepEqual(success.serverRegion, null,
      'Callback success.serverRegion returns null');
    t.deepEqual(typeof success.enableDataChannel, 'boolean',
      'Callback success.enableDataChannel returns a boolean');
    t.deepEqual(typeof success.enableIceTrickle, 'boolean',
      'Callback success.enableIceTrickle returns a boolean');
    t.deepEqual(typeof success.enableTURNServer, 'boolean',
      'Callback success.enableTURNServer returns a boolean');
    t.deepEqual(typeof success.enableSTUNServer, 'boolean',
      'Callback success.enableSTUNServer returns a boolean');
    t.deepEqual(typeof success.TURNTransport, 'string',
      'Callback success.TURNTransport returns a string');
    t.deepEqual(typeof success.audioFallback, 'boolean',
      'Callback success.audioFallback returns a boolean');
    t.deepEqual(typeof success.forceSSL, 'boolean',
      'Callback success.forceSSL returns a boolean');
    t.deepEqual(typeof success.forceTURNSSL, 'boolean',
      'Callback success.forceTURNSSL returns a boolean');
    t.deepEqual(typeof success.socketTimeout, 'number',
      'Callback success.socketTimeout returns a number');
    t.deepEqual(typeof success.audioCodec, 'string',
      'Callback success.audioCodec returns a string');
    t.deepEqual(typeof success.videoCodec, 'string',
      'Callback success.videoCodec returns a string');

    if (typeof options === 'object') {
      t.deepEqual(success.defaultRoom, options.defaultRoom,
        'Callback success.defaultRoom returned matches the defaultRoom provided');
      t.deepEqual(success.selectedRoom, options.defaultRoom,
        'Callback success.selectedRoom returned matches the defaultRoom (fallback) provided');
      t.deepEqual(success.appKey, options.apiKey,
        'Callback success.appKey returned matches the apiKey provided');
    } else {
      t.deepEqual(success.defaultRoom, options,
        'Callback success.defaultRoom returned matches the apiKey (default fallback) provided');
      t.deepEqual(success.selectedRoom, options,
        'Callback success.selectedRoom returned matches the apiKey (default fallback) provided');
      t.deepEqual(success.appKey, options,
        'Callback success.appKey returned matches the apiKey provided');
    }
  };

  var test1 = function () {
    console.log('Testing scenario 1: Init options "apiKey"');
    var options = apikey;

    sw.init(options, function (error, success) {
      init_callback(error, success, options);
      test2();
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: Init options { apiKey: "apiKey", defaultRoom: "testtest" }');
    var options = {
      apiKey: apikey,
      defaultRoom: 'testtest'
    };

    sw.init(options, function (error, success) {
      init_callback(error, success, options);
    });
  };

  test1();

  setTimeout(function () {
    t.end();
  }, 18000);
});

test('init() - callback: Testing failure callback', function(t){
  t.plan(15);

  var init_callback = function(error, success){
    console.log(JSON.stringify(error));
    t.deepEqual([typeof error, success],
      ['object', null], 'Callback returns an error instead of success');

    t.deepEqual(typeof error.error, 'object',
      'Callback error.error returns an object');
    t.deepEqual(typeof error.errorCode, 'number',
      'Callback error.errorCode returns a number');
  };

  var test1 = function () {
    console.log('Testing scenario 1: AdapterJS not loaded');

    window.tempAdapterJS = window.AdapterJS;
    window.AdapterJS = undefined;

    sw.init(apikey, function (error, success) {
      init_callback(error, success);
      window.AdapterJS = window.tempAdapterJS;
      window.tempAdapterJS = undefined;
      test2();
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: Socket.io not loaded');

    window.tempIo = window.io;
    window.io = undefined;

    sw.init(apikey, function (error, success) {
      init_callback(error, success);
      window.io = window.tempIo;
      window.tempIo = undefined;
      test3();
    });
  };

  var test3 = function () {
    console.log('Testing scenario 3: XMLHttpRequest does not exists');

    window.tempXMLHttpRequest = window.XMLHttpRequest;
    window.XMLHttpRequest = undefined;

    sw.init(apikey, function (error, success) {
      init_callback(error, success);
      window.XMLHttpRequest = window.tempXMLHttpRequest;
      window.tempXMLHttpRequest = undefined;
      test4();
    });
  };

  var test4 = function () {
    console.log('Testing scenario 4: RTCPeerConnection does not exists');

    window.tempRTCPeerConnection = window.RTCPeerConnection;
    window.RTCPeerConnection = undefined;

    sw.init(apikey, function (error, success) {
      init_callback(error, success);
      window.RTCPeerConnection = window.tempRTCPeerConnection;
      window.tempRTCPeerConnection = undefined;
      test5();
    });
  };

  var test5 = function () {
    console.log('Testing scenario 5: ApiKey is not provided');

    sw.init({}, function (error, success) {
      init_callback(error, success);
    });
  };

  test1();

  /*setTimeout(function () {
    t.end();
  }, 18000);*/
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

  sw.init(apikey,function(initError, initSuccess){
    if (initError) {
      console.log('ERROR: Failed initialising for sendBlobData() - success callback tests');
      console.error('sendBlobData() - success callback: Initialising error', initError);
    } else {
      sw.joinRoom({userData: 'self'}, function (jRError, jRSuccess) {
        if (jRError) {
          console.log('ERROR: Failed joining room for sendBlobData() - success callback tests');
          console.error('sendBlobData() - success callback: Joining room error', jRError);
        }
      });
    }
  });

  setTimeout(function () {
    sw.leaveRoom(function (lRError, lRSuccess) {
      if (lRError) {
        console.log('ERROR: Failed leaving the room for sendBlobData() - success callback tests');
        console.error('sendBlobData() - success callback: Leave room error', lRError);
      }
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

  sw.init(apikey,function(initError, initSuccess){
    if (initError) {
      console.log('ERROR: Failed initialising for sendBlobData() - failure callback tests');
      console.error('sendBlobData() - failure callback: Initialising error', initError);
    } else {
      // start test
      sw.joinRoom({userData: 'self'}, function (jRError, jRSuccess) {
        if (jRError) {
          console.log('ERROR: Failed joining room for sendBlobData() - failure callback tests');
          console.error('sendBlobData() - failure callback: Joining room error', jRError);
        }
      });
    }
  });

  setTimeout(function () {
    sw.leaveRoom(function (lRError, lRSuccess) {
      if (lRError) {
        console.log('ERROR: Failed leaving the room for sendBlobData() - failure callback tests');
        console.error('sendBlobData() - failure callback: Leave room error', lRError);
      }
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

  sw.init(apikey,function(initError, initSuccess){
    if (initError) {
      console.log('ERROR: Failed initialising for sendURLData() - success callback tests');
      console.error('sendURLData() - success callback: Initialising error', initError);
    } else {
      sw.joinRoom({userData: 'self'}, function (jRError, jRSuccess) {
        if (jRError) {
          console.log('ERROR: Failed joining room for sendURLData() - success callback tests');
          console.error('sendURLData() - success callback: Joining room error', jRError);
        }
      });
    }
  });

  var testEnd = setTimeout(function () {
    sw.leaveRoom(function (lRError, lRSuccess) {
      if (lRError) {
        console.log('ERROR: Failed leaving the room for sendURLData() - success callback tests');
        console.error('sendURLData() - success callback: Leave room error', lRError);
      }
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

  sw.init(apikey,function(initError, initSuccess){
    if (initError) {
      console.log('ERROR: Failed initialising for sendURLData() - failure callback tests');
      console.error('sendURLData() - failure callback: Initialising error', initError);
    }
    // start test
    sw.joinRoom({userData: 'self'}, function (jRError, jRSuccess) {
      if (jRError) {
        console.log('ERROR: Failed joining room for sendURLData() - failure callback tests');
        console.error('sendURLData() - failure callback: Joining room error', jRError);
      }
    });
  });

  setTimeout(function () {
    sw.leaveRoom(function (lRError, lRSuccess) {
      if (lRError) {
        console.log('ERROR: Failed leaving the room for sendURLData() - failure callback tests');
        console.error('sendURLData() - failure callback: Leave room error', lRError);
      }
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

  sw.init(apikey, function (initError, initSuccess) {
    if (initError) {
      console.log('ERROR: Failed initialising for joinRoom() - success callback tests');
      console.error('joinRoom() - success callback: Initialising error', initError);
    } else {
      test1();
    }
  });

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
  t.plan(28);
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
        console.log('ERROR: Failed joining room for leaveRoom() - success callback test 1');
        console.error('leaveRoom() - success callback (test1): Joining room error', jRError);
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
        console.log('ERROR: Failed joining room for leaveRoom() - success callback test 2');
        console.error('leaveRoom() - success callback (test2): Joining room error', jRError);
        t.fail('Failed joining room for Test 2');
        test3();
      }
    });
  };

  var test3 = function () {
    console.log('Testing scenario 3: Leaving room with options (false, callback) in defaultroom');

    sw.joinRoom(function(jRError, jRSuccess) {
      if (jRSuccess) {
        sw.leaveRoom(false, function(error, success){
          leave_callback(error, success, sw._defaultRoom, false);
          test4();
        });
      } else {
        console.log('ERROR: Failed joining room for leaveRoom() - success callback test 3');
        console.error('leaveRoom() - success callback (test3): Joining room error', jRError);
        t.fail('Failed joining room for Test 3');
        test4();
      }
    });
  };

  var test4 = function () {
    console.log('Testing scenario 4: Leaving room with options (false, callback) in "test4"');

    roomName = 'test4';

    sw.joinRoom(roomName, function(jRError, jRSuccess) {
      if (jRSuccess) {
        sw.leaveRoom(false, function(error, success){
          leave_callback(error, success, roomName, false);
          test5();
        });
      } else {
        console.log('ERROR: Failed joining room for leaveRoom() - success callback test 4');
        console.error('leaveRoom() - success callback (test4): Joining room error', jRError);
        t.fail('Failed joining room for Test 4');
        test5();
      }
    });
  };

  var test5 = function () {
    console.log('Testing scenario 5: Leaving room with options (true, callback) in defaultroom');

    sw.joinRoom(function(jRError, jRSuccess) {
      if (jRSuccess) {
        sw.leaveRoom(true, function(error, success){
          leave_callback(error, success, sw._defaultRoom, true);
          test6();
        });
      } else {
        console.log('ERROR: Failed joining room for leaveRoom() - success callback test 5');
        console.error('leaveRoom() - success callback (test5): Joining room error', jRError);
        t.fail('Failed joining room for Test 5');
        test6();
      }
    });
  };

  var test6 = function () {
    console.log('Testing scenario 6: Leaving room with options (true, callback) in "test6"');

    roomName = 'test6';

    sw.joinRoom(roomName, function(jRError, jRSuccess) {
      if (jRError) {
        sw.leaveRoom(true, function(error, success){
          leave_callback(error, success, roomName, true);
          test7();
        });
      } else {
        console.log('ERROR: Failed joining room for leaveRoom() - success callback test 6');
        console.error('leaveRoom() - success callback (test6): Joining room error', jRError);
        t.fail('Failed joining room for Test 6');
        test7();
      }
    });
  };

  var test7 = function () {
    console.log('Testing scenario 7: Leaving room with options ({}, callback) in "test7"');

    roomName = 'test7';

    sw.joinRoom(roomName, function(jRError, jRSuccess) {
      if (jRError) {
        sw.leaveRoom({}, function(error, success){
          leave_callback(error, success, roomName, true);
        });
      } else {
        console.log('ERROR: Failed joining room for leaveRoom() - success callback test 7');
        console.error('leaveRoom() - success callback (test7): Joining room error', jRError);
        t.fail('Failed joining room for Test 7');
      }
    });
  };

  sw.init(apikey, function (initError, initSuccess) {
    if (initError) {
      console.log('ERROR: Failed initialising for leaveRoom() - success callback tests');
      console.error('leaveRoom() - success callback: Initialising error', initError);
    } else {
      test1();
    }
  });

  setTimeout(function () {
    t.end();
  }, 28000);
});

test('leaveRoom() - callback: Testing failure callback', function(t){
  t.plan(3);
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
    console.log('Testing scenario 3: Leaving room when user is not in room');

    sw._inRoom = false;
    sw.leaveRoom(function(error, success){
      leave_callback(error, success);
    });
  };

  sw.init(apikey, function (initError, initSuccess) {
    if (initError) {
      console.log('ERROR: Failed initialising for leaveRoom() - failure callback tests');
      console.error('leaveRoom() - failure callback: Initialising error', initError);
    } else {
      test1();
    }
  });

  setTimeout(function () {
    if (sw._socket !== null) {
      sw._inRoom = true;
    }
    t.end();
  }, 8000);
});

test('refreshConnection() - callback: Testing success callback', function(t){
  t.plan(12);

  var targetPeer = null;
  var targetPeerId = null;
  var refresh_callback = function(error, success, targetPeerList){
    t.deepEqual([error, typeof success], [null, 'object'],
      'Callback returns a success instead of error');
    t.deepEqual(typeof success.listOfPeers, 'object',
      'Callback success.listOfPeers returns an "object"');
    t.deepEqual(success.listOfPeers instanceof Array, true,
      'Callback success.listOfPeers returns an "Array"');

    if (typeof targetPeerList === 'string') {
      t.deepEqual(success.listOfPeers, [targetPeerList],
        'Callback success.listOfPeers returns the correct list of peers (string)');
    } else if (targetPeerList instanceof Array) {
      t.deepEqual(success.listOfPeers, targetPeerList,
        'Callback success.listOfPeers returns the correct list of peers (array)');
    }
  };

  var test1 = function () {
    console.log('Testing scenario 1: Refresh connection with (callback)');
    sw.refreshConnection(function (error, success) {
      refresh_callback(error, success, Object.keys(sw._peerConnections));
      // due to throttle
      setTimeout(test2, 10000);
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: Refresh connection with (["' + targetPeerId + '"], callback)');

    targetPeer = [targetPeerId];

    sw.refreshConnection(targetPeer, function (error, success) {
      refresh_callback(error, success, targetPeer);
      // due to throttle
      setTimeout(test3, 10000);
    });
  };

  var test3 = function () {
    console.log('Testing scenario 2: Refresh connection with ("' + targetPeerId + '", callback)');

    targetPeer = targetPeerId;

    sw.refreshConnection(targetPeer, function (error, success) {
      refresh_callback(error, success, targetPeer);
    });
  };

  sw.once('iceConnectionState', test1, function (state, peerId) {
    return peerId === targetPeerId && state === sw.ICE_CONNECTION_STATE.COMPLETED;
  });

  sw.on('peerRestart', function (peerId, peerInfo, isSelf) {
    console.info('peerRestart is triggered', peerId, peerInfo, isSelf);
  })

  sw.once('peerJoined', function () {}, function (peerId, peerInfo, isSelf) {
    if (!isSelf) {
      targetPeerId = peerId;
      return true;
    }
  });

  sw.init(apikey,function(initError, initSuccess){
    if (initError) {
      console.log('ERROR: Failed initialising for refreshConnection() - success callback tests');
      console.error('refreshConnection() - success callback: Initialising error', initError);
    } else {
      sw.joinRoom(function (jRError, jRSuccess) {
        if (jRError) {
          console.log('ERROR: Failed joining room for refreshConnection() - success callback tests');
          console.error('refreshConnection() - success callback: Joining room error', jRError);
        }
      });
    }
  });

  setTimeout(function () {
    t.end();
  }, 28000);
});

test('refreshConnection() - callback: Testing failure callback', function(t){
  t.plan(18);

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
      // due to throttle
      setTimeout(test2, 5000);
    });
  };

  var test2 = function () {
    console.log('Testing scenario 2: No present present to restart connection with ("xxxx", callback) ' +
      'single targeted peer "' + targetPeer + '"');

    targetPeer = 'xxxxxxxx';
    sw.refreshConnection(targetPeer, function (error, success) {
      refresh_callback(error, success, targetPeer);
      // due to throttle
      setTimeout(test3, 5000);
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

  sw.init(apikey,function(initError, initSuccess){
    if (initError) {
      console.log('ERROR: Failed initialising for refreshConnection() - failure callback tests');
      console.error('refreshConnection() - failure callback: Initialising error', initError);
    } else {
      sw.leaveRoom(test1);
    }
  });

  setTimeout(function () {
    t.end();
  }, 20000);
});

})();
