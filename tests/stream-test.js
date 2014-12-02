(function() {

'use strict';

var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

console.log('This test requires you to click allow on all occassions ' +
  'when media access is asked for. No streams are sent in this process');

// get user media tests
test('Get user media before init', function(t) {
  t.plan(3);

  var audio_array = [];
  var video_array = [];

  sw.on('mediaAccessSuccess', function (stream) {
    t.pass('Get user media success without calling before init');

    // check stream retrieval options
    if (stream.getAudioTracks().length > 0) {
      audio_array.push(1);
    }
    if (stream.getVideoTracks().length > 0) {
      video_array.push(1);
    }
    // check the set stream settings
    if (typeof sw._streamSettings.audio === 'boolean' ||
      typeof sw._streamSettings.audio === 'object') {
      audio_array.push(2);
    }
    if (typeof sw._streamSettings.video === 'boolean' ||
      typeof sw._streamSettings.video === 'object') {
      video_array.push(2);
    }
    // check the set getUserMedia settings
    if (typeof sw._getUserMediaSettings.audio === 'boolean') {
      audio_array.push(3);
    }
    if (typeof sw._getUserMediaSettings.video === 'boolean' ||
      typeof sw._getUserMediaSettings.video === 'object') {
      video_array.push(3);
    }
    t.deepEqual(audio_array, [1, 2, 3], 'Set audio settings correct');
    t.deepEqual(video_array, [1, 2, 3], 'Set video settings correct');

    // turn off all events
    sw.off('mediaAccessSuccess');
    sw.off('mediaAccessFailure');

    t.end();
  });

  sw.on('mediaAccessFailure', function (error) {
    t.fail('Get user media failed');
    t.fail('Set audio settings failed to parse');
    t.fail('Set video settings failed to parse');

    // turn off all events
    sw.off('mediaAccessSuccess');
    sw.off('mediaAccessFailure');

    t.end();
  });

  console.log('Requesting audio and video');
  sw.getUserMedia();
});

test('Get user media false', function(t) {
  t.plan(3);

  var getUserMediaCalled = false;

  sw.on('mediaAccessSuccess', function (stream) {
    getUserMediaCalled = true;
    t.fail('Get user media is called');
  });

  sw.on('mediaAccessFailure', function (error) {
    getUserMediaCalled = true;

    t.fail('Get user media is called');

    // turn off all events
    sw.off('mediaAccessSuccess');
    sw.off('mediaAccessFailure');

    t.end();
  });

  console.log('Requesting no audio or video');

  sw.getUserMedia({
    audio: false,
    video: false
  });

  setTimeout(function () {
    t.deepEqual(sw._streamSettings.audio, false, 'Set audio settings is false');
    t.deepEqual(sw._streamSettings.video, false, 'Set video settings is false');
    t.deepEqual(getUserMediaCalled, false, 'Get user media is not called');

    // turn off all events
    sw.off('mediaAccessSuccess');
    sw.off('mediaAccessFailure');

    t.end();
  }, 2500);
});

test('Get user media constraints', function(t) {
  t.plan(2);

  // this test could be improved more
  var audio_array = [];
  var video_array = [];

  sw.on('mediaAccessSuccess', function (stream) {
    // check stream retrieval options
    if (stream.getAudioTracks().length > 0) {
      audio_array.push(1);
    }
    if (stream.getVideoTracks().length === 0) {
      video_array.push(1);
    }
    console.info(sw._streamSettings);
    // check the set stream settings
    if (typeof sw._streamSettings.audio === 'object' && sw._streamSettings.audio.stereo === false) {
      audio_array.push(2);
    }
    if (sw._streamSettings.video === false) {
      video_array.push(2);
    }
    // check the set getUserMedia settings
    if (sw._getUserMediaSettings.audio === true) {
      audio_array.push(3);
    }
    if (sw._getUserMediaSettings.video === false) {
      video_array.push(3);
    }
    t.deepEqual(audio_array, [1, 2, 3], 'Set audio settings correct');
    t.deepEqual(video_array, [1, 2, 3], 'Set video settings correct');

    // turn off all events
    sw.off('mediaAccessSuccess');
    sw.off('mediaAccessFailure');

    t.end();
  });

  sw.on('mediaAccessFailure', function (error) {
    t.fail('Get user media for audio failed');
    t.fail('Get user media for video failed');

    // turn off all events
    sw.off('mediaAccessSuccess');
    sw.off('mediaAccessFailure');

    t.end();
  });

  console.log('Requesting audio');
  sw.getUserMedia({
    audio: true,
    video: false
  });
});


// join room media constraints test
test('Joining room media constraints (empty)', function(t) {
  t.plan(1);

  var getUserMediaCalled = false;

  sw.on('mediaAccessSuccess', function () {
    getUserMediaCalled = true;
  });

  sw.on('mediaAccessFailure', function () {
    getUserMediaCalled = true;
  });

  sw.joinRoom();

  setTimeout(function () {
    t.deepEqual(getUserMediaCalled, false, 'Get user media is not called');
  }, 2500);
});

test('Joining room media constraints', function(t) {
  t.plan(1);

  sw.on('mediaAccessSuccess', function (stream) {
    // check stream retrieval options
    if (stream.getAudioTracks().length > 0) {
      audio_array.push(1);
    }
    if (stream.getVideoTracks().length === 0) {
      video_array.push(1);
    }
    console.info(sw._streamSettings);
    // check the set stream settings
    if (typeof sw._streamSettings.audio === 'object' && sw._streamSettings.audio.stereo === false) {
      audio_array.push(2);
    }
    if (sw._streamSettings.video === false) {
      video_array.push(2);
    }
    // check the set getUserMedia settings
    if (sw._getUserMediaSettings.audio === true) {
      audio_array.push(3);
    }
    if (sw._getUserMediaSettings.video === false) {
      video_array.push(3);
    }
  });

  sw.on('mediaAccessFailure', function () {
    getUserMediaCalled = true;
  });

  console.log('Requesting audio only')
  sw.joinRoom({
    audio: true
  });
});

/* test should test
 * 1. joinRoom - getUserMedia constraints
 * - if user joins the room at first with getUserMedia, it should prompt for userMedia
 * - if user joins a room without usermedia options, it should just change the room
 * - if user joins a room with new usermedia options or about the same optins, it should prompt for usermedia
 * - if user has a manualGetUserMedia, the waitForStreams should continue process and getUserMedia should not be prompted.
 * - if user has a manualGetUserMedia false, the waitForStreams should check if there is constraints and prompt accordingly if not dont
 * 2. leaveRoom
 * - mediaAccess should stop
 * - getUserMedia to be called
 * 3. sendStream
 * - joinRoom should call sendStream to set the user stream instead
 * 4. getUserMedia
 * - it should only get the user media
 */
})();