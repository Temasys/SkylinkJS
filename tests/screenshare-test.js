(function() {

'use strict';

// Dependencies
var test = require('tape');
window.io = require('socket.io-client');
window.AdapterJS = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');
var sw = new skylink.Skylink();

// Testing attributes
var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

console.log('API: Tests the shareScreen() and stopScreen() and muting of screensharing streams');
console.log('===============================================================================================');

test('Test screensharing during a connected session', function (t) {
  t.plan(2);

  var mas_array = [];
  var is_array = [];
  var justConnected = false;

  console.log('> Please install the screensharing extension and allow a screenshare item when prompt is called');

  sw.on('mediaAccessSuccess', function (stream, isScreenShare) {
    mas_array.push([typeof stream.getAudioTracks === 'function', isScreenShare]);
  });

  sw.on('incomingStream', function (peerId, stream, isSelf, peerInfo, isScreenShare) {
    if (isSelf) {
      is_array.push([typeof stream.getAudioTracks === 'function', isScreenShare]);

    } else {
      if (!justConnected) {
        justConnected = true;
        sw.shareScreen();
      }
    }
  });

  sw.joinRoom({
    audio: true,
    video: true
  });

  setTimeout(function () {
    t.deepEqual(mas_array, [
      [true, false],
      [true, true]
    ], 'Is screensharing flag defined locally');

    t.deepEqual(is_array, [
      [true, false],
      [true, true]
    ], 'Is screensharing flag defined locally');

    sw.off('mediaAccessSuccess');
    sw.off('incomingStream');

    t.end();
  }, 60000);
});

test('Stopping screensharing session', function (t) {
  t.plan(2);

  var mas_array = [];
  var is_array = [];
  var justConnected = false;

  sw.on('mediaAccessStopped', function (isScreenShare) {
    mas_array.push(isScreenShare);
  });

  sw.on('mediaAccessSuccess', function (stream, isScreenShare) {
    mas_array.push(isScreenShare);
  });

  sw.on('incomingStream', function (peerId, stream, isSelf, peerInfo, isScreenShare) {
    if (isSelf) {
      is_array.push([typeof stream.getAudioTracks === 'function', isScreenShare]);

    } else {
      if (!justConnected) {
        justConnected = true;
        sw.shareScreen();
      }
    }
  });

  setTimeout(function () {
    t.deepEqual(mas_array, [
      true
    ], 'Is screensharing stream stopped');

    t.deepEqual(is_array, [
      [true, false]
    ], 'Is normal stream received instead');

    sw.off('mediaAccessStopped');
    sw.off('mediaAccessSuccess');
    sw.off('incomingStream');

    t.end();
  }, 60000);
});

test('Test screensharing before a connected session', function (t) {
  t.plan(2);

  var mas_array = [];
  var is_array = [];

  console.log('> Please install the screensharing extension and allow a screenshare item when prompt is called');

  sw.on('mediaAccessSuccess', function (stream, isScreenShare) {
    mas_array.push([typeof stream.getAudioTracks === 'function', isScreenShare]);
  });

  sw.on('incomingStream', function (peerId, stream, isSelf, peerInfo, isScreenShare) {
    if (isSelf) {
      is_array.push([typeof stream.getAudioTracks === 'function', isScreenShare]);
    }
  });


  sw.leaveRoom(function () {
    sw.shareScreen(function () {
      sw.joinRoom({
        audio: true,
        video: true
      });
    });
  });

  setTimeout(function () {
    t.deepEqual(mas_array, [
      [true, true]
    ], 'Is screensharing flag defined locally');

    t.deepEqual(is_array, [
      [true, true]
    ], 'Is screensharing flag defined locally');

    sw.off('mediaAccessSuccess');
    sw.off('incomingStream');

    t.end();
  }, 60000);
});

test('Test receiving screensharing stream', function (t) {
  t.plan(1);

  var is_array = [];

  sw.on('incomingStream', function (peerId, stream, isSelf, peerInfo, isScreenShare) {
    if (!isSelf) {
      is_array.push([stream.getAudioTracks().length, stream.getVideoTracks().length, isScreenShare]);
    }
  });


  sw.joinRoom(function () {
    sw.sendMessage('SCREENSHARE');
  });

  setTimeout(function () {
    t.deepEqual(is_array, [
      [true, false],
      [true, true]
    ], 'Is screensharing flag defined remotely and tracks received correctly');

    sw.off('incomingStream');

    t.end();
  }, 60000);
});

test('Muting of streams should work', function (t) {
  t.plan(20);

  var is_array = [];

  sw.muteStream({
    audioMuted: true
  });

  t.deepEqual(sw._mediaScreen.getAudioTracks()[0].enabled, false, 'Is screensharing stream audio muted');
  t.deepEqual(sw._mediaStream.getAudioTracks()[0].enabled, false, 'Is normal stream audio muted');
  t.deepEqual(sw._mediaScreen.getVideoTracks()[0].enabled, true, 'Is screensharing stream video not muted');
  t.deepEqual(sw._mediaStream.getVideoTracks()[0].enabled, true, 'Is normal stream stream video not muted');

  sw.muteStream({
    audioMuted: false
  });

  t.deepEqual(sw._mediaScreen.getAudioTracks()[0].enabled, true, 'Is screensharing stream audio not muted');
  t.deepEqual(sw._mediaStream.getAudioTracks()[0].enabled, true, 'Is normal stream audio not muted');
  t.deepEqual(sw._mediaScreen.getVideoTracks()[0].enabled, true, 'Is screensharing stream video not muted');
  t.deepEqual(sw._mediaStream.getVideoTracks()[0].enabled, true, 'Is normal stream stream video not muted');

  sw.muteStream({
    videoMuted: true
  });

  t.deepEqual(sw._mediaScreen.getAudioTracks()[0].enabled, true, 'Is screensharing stream audio not muted');
  t.deepEqual(sw._mediaStream.getAudioTracks()[0].enabled, true, 'Is normal stream audio not muted');
  t.deepEqual(sw._mediaScreen.getVideoTracks()[0].enabled, false, 'Is screensharing stream video muted');
  t.deepEqual(sw._mediaStream.getVideoTracks()[0].enabled, false, 'Is normal stream stream video muted');

  sw.muteStream({
    videoMuted: false
  });

  t.deepEqual(sw._mediaScreen.getAudioTracks()[0].enabled, true, 'Is screensharing stream audio not muted');
  t.deepEqual(sw._mediaStream.getAudioTracks()[0].enabled, true, 'Is normal stream audio not muted');
  t.deepEqual(sw._mediaScreen.getVideoTracks()[0].enabled, true, 'Is screensharing stream video not muted');
  t.deepEqual(sw._mediaStream.getVideoTracks()[0].enabled, true, 'Is normal stream stream video not muted');

  sw.muteStream({
    audioMuted: true,
    videoMuted: true
  });

  t.deepEqual(sw._mediaScreen.getAudioTracks()[0].enabled, false, 'Is screensharing stream audio muted');
  t.deepEqual(sw._mediaStream.getAudioTracks()[0].enabled, false, 'Is normal stream audio muted');
  t.deepEqual(sw._mediaScreen.getVideoTracks()[0].enabled, false, 'Is screensharing stream video muted');
  t.deepEqual(sw._mediaStream.getVideoTracks()[0].enabled, false, 'Is normal stream stream video muted');

  t.end();
});

test('Stopping of streams should not affect screensharing stream', function (t) {
  t.plan(3);

  var mas_array = [];

  sw.on('mediaAccessStopped', function (isScreenShare) {
    mas_array.push(isScreenShare);
  });

  sw.stopStream();

  setTimeout(function () {
    t.deepEqual(mas_array, [false], 'Normal stream stopped should not affect screensharing stream');
    t.deepEqual(sw._mediaStream, null, 'Stream object should be empty');
    t.deepEqual(typeof sw._mediaScreen.getAudioTracks, 'function', 'Screensharing stream object should not be empty');

    sw.off('mediaAccessStopped');

    sw.leaveRoom(function () {
      t.end();
    });
  }, 60000);
});

test('Stopping of screensharing streams should not affect normal stream', function (t) {
  t.plan(3);

  var mas_array = [];

  sw.on('mediaAccessStopped', function (isScreenShare) {
    mas_array.push(isScreenShare);
  });

  sw.joinRoom({
    audio: true,
    video: true
  }, function () {
    sw.stopStream();
  });

  setTimeout(function () {
    t.deepEqual(mas_array, [true], 'Screensharing stream stopped should not affect normal stream');
    t.deepEqual(sw._mediaScreen, null, 'Screensharing stream object should be empty');
    t.deepEqual(typeof sw._mediaStream.getAudioTracks, 'function', 'Stream object should not be empty');

    sw.off('mediaAccessStopped');

    sw.leaveRoom(function () {
      t.end();
    });
  }, 60000);
});


sw.init(apikey);

sw.joinRoom();

})();
