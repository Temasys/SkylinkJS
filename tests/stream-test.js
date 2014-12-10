(function() {

'use strict';

var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

console.log('This test requires you to click allow on all occassions ' +
  'when media access is asked for. No streams are displayed in this process');

// get user media tests
test('Get user media', function(t) {
  t.plan(10);

  // 1. test the default settings and making sure it's called before init
  var test_default = function () {
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
      if (typeof sw._streamSettings.audio === 'object' &&
        sw._streamSettings.audio.stereo === false) {
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
      if (typeof sw._getUserMediaSettings.video === 'object') {
        video_array.push(3);
      }
      t.deepEqual(audio_array, [1, 2, 3], 'Set audio settings correct (settings=default)');
      t.deepEqual(video_array, [1, 2, 3], 'Set video settings correct (settings=default)');

      // turn off all events
      sw.off('mediaAccessSuccess');
      sw.off('mediaAccessError');

      test_false();
    });

    sw.on('mediaAccessError', function (error) {
      t.fail('Get user media failed');
      t.fail('Set audio settings failed to parse');
      t.fail('Set video settings failed to parse');

      // turn off all events
      sw.off('mediaAccessSuccess');
      sw.off('mediaAccessError');

      test_false();
    });

    console.log(': Test default settings');
    console.log('> Requesting audio and video');

    sw.getUserMedia();
  };

  // 2. test that getUserMedia should not be called if all settings is false
  var test_false = function () {
    var getUserMediaCalled = false;

    sw.on('mediaAccessSuccess', function (stream) {
      getUserMediaCalled = true;
      t.fail('Get user media is called');
    });

    sw.on('mediaAccessError', function (error) {
      getUserMediaCalled = true;
      t.fail('Get user media is called');
    });

    console.log(': Test false settings');
    console.log('> Requesting no audio or video');

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
      sw.off('mediaAccessError');

      test_settings();
    }, 2500);
  };

  // 2. test that video resolutions
  var test_settings = function () {
    var settings = {
      audio: { stereo: true },
      video: {
        resolution: {
          width: 1500,
          height: 800
        },
        frameRate: 55
      }
    };

    sw.on('mediaAccessSuccess', function (stream) {
      t.deepEqual({
        audio: sw._streamSettings.audio,
        video: sw._streamSettings.video
      }, settings, 'Stream settings set in getUserMedia is correct');

      // check stream retrieval options
      t.deepEqual([
        stream.getAudioTracks().length,
        stream.getVideoTracks().length
      ], [1, 1], 'Stream audio and video tracks retrieved');

      // check the set stream settings
      t.deepEqual(sw._getUserMediaSettings.audio, true, 'Set audio getUserMedia is correct');
      t.deepEqual(sw._getUserMediaSettings.video, {
        mandatory: {
          //minWidth: settings.video.resolution.width,
          //minHeight: settings.video.resolution.height,
          maxWidth: settings.video.resolution.width,
          maxHeight: settings.video.resolution.height,
          //minFrameRate: settings.video.frameRate,
          maxFrameRate: settings.video.frameRate
        },
        optional: []
      }, 'Set video getUserMedia is correct');

      // turn off all events
      sw.off('mediaAccessSuccess');
      sw.off('mediaAccessError');

      t.end();
    });

    sw.on('mediaAccessError', function (error) {
      t.fail('Failed to get user media and parse stream settings');

      // turn off all events
      sw.off('mediaAccessSuccess');
      sw.off('mediaAccessError');

      t.end();
    });

    console.log(': Test user set settings');
    console.log('> Requesting audio and video');

    sw.getUserMedia(settings);
  };

  // call the first test
  test_default();

});


// join room media constraints test
test('Joining room constraints', function(t) {
  t.plan(9);

  var test_default = function () {
    var getUserMediaCalled = false;

    sw.on('mediaAccessSuccess', function () {
      getUserMediaCalled = true;
    });

    sw.on('mediaAccessError', function () {
      getUserMediaCalled = true;
    });

    console.log(': Test joinRoom with no settings');
    sw.joinRoom();

    setTimeout(function () {
      t.deepEqual(getUserMediaCalled, false, 'Get user media is not called');

      // turn off all events
      sw.off('mediaAccessSuccess');
      sw.off('mediaAccessError');

      sw.leaveRoom(function () {
        test_false();
      });
    }, 2500);
  };

  var test_false = function () {
    var getUserMediaCalled = false;

    sw.on('mediaAccessSuccess', function () {
      getUserMediaCalled = true;
    });

    sw.on('mediaAccessError', function () {
      getUserMediaCalled = true;
    });

    console.log(': Test joinRoom with no audio and video');
    sw.joinRoom({
      audio: false,
      video: false
    });

    sw.on('peerJoined', function (peerId) {
      t.deepEqual(getUserMediaCalled, false, 'Get user media is not called');
      t.deepEqual({
        audio: sw._streamSettings.audio,
        video: sw._streamSettings.video
      }, {
        video: false,
        audio: false
      }, 'Stream settings are false');

      // turn off all events
      sw.off('mediaAccessSuccess');
      sw.off('mediaAccessError');
      sw.off('peerJoined');

      sw.leaveRoom(function () {
        test_settings();
      });
    });
  };

  var test_settings = function () {
    var audio_array = [];
    var video_array = [];

    sw.on('incomingStream', function (peerId, stream, isSelf) {
      if (isSelf) {
        // check stream retrieval options
        // check stream retrieval options
        if (stream.getAudioTracks().length > 0) {
          audio_array.push(1);
        }
        if (stream.getVideoTracks().length > 0) {
          video_array.push(1);
        }
        // check the set stream settings
        if (typeof sw._streamSettings.audio === 'object' &&
          sw._streamSettings.audio.stereo === false) {
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

        t.deepEqual(audio_array, [1, 2, 3], 'Set audio settings correct (settings=userset)');
        t.deepEqual(video_array, [2, 3], 'Set video settings correct (settings=userset)');

        // turn off all events
        sw.off('incomingStream');
        sw.off('mediaAccessError');

        sw.leaveRoom(function () {
          test_bandwidth();
        });
      }
    });

    sw.on('mediaAccessError', function () {
      t.fail('Failed getting user media');

      // turn off all events
      sw.off('incomingStream');
      sw.off('mediaAccessError');

      sw.leaveRoom(function () {
        test_bandwidth();
      });
    });

    console.log(': Test joinRoom with audio only');
    console.log('> Requesting audio only');

    sw.joinRoom({
      audio: true
    });
  };

  var test_bandwidth = function () {
    var settings = {
      audio: { stereo: true },
      video: {
        resolution: {
          width: 1280,
          height: 720
        },
        frameRate: 55
      },
      bandwidth: {
        audio: 1234,
        video: 56733,
        data: 1232443
      }
    };

    sw.on('incomingStream', function (peerId, stream, isSelf) {
      if (isSelf) {
        t.deepEqual([
          stream.getAudioTracks().length,
          stream.getVideoTracks().length
        ], [1, 1], 'Stream tracks retrieved in joinRoom is correct');
        t.deepEqual(sw._streamSettings, settings,
          'Stream settings set in joinRoom is correct');

        // check the set stream settings
        t.deepEqual(sw._getUserMediaSettings.audio, true,
          'Set audio in joinRoom is correct');
        t.deepEqual(sw._getUserMediaSettings.video, {
          mandatory: {
            //minWidth: settings.video.resolution.width,
            //minHeight: settings.video.resolution.height,
            maxWidth: settings.video.resolution.width,
            maxHeight: settings.video.resolution.height,
            //minFrameRate: settings.video.frameRate,
            maxFrameRate: settings.video.frameRate
          },
          optional: []
        }, 'Set video in joinRoom is correct');

        // turn off all events
        sw.off('incomingStream');
        sw.off('mediaAccessError');

        sw.leaveRoom(function () {
          t.end();
        });
      }
    });

    sw.on('mediaAccessError', function (error) {
      t.fail('Failed to get user media and parse stream settings');

      // turn off all events
      sw.off('incomingStream');
      sw.off('mediaAccessError');

      sw.leaveRoom(function () {
        t.end();
      });
    });

    console.log(': Test user set settings');
    console.log('> Requesting audio and video');

    sw.joinRoom(settings);
  };

  // call the first test
  sw.init(apikey);
  test_default();

});

test('Send stream settings', function(t) {
  t.plan(3);

  // 1. test the default settings and making sure it's called before init
  var test_default = function () {
    var array = [];

    sw.on('iceConnectionState', function (state, peerId) {
      if (state === sw.ICE_CONNECTION_STATE.COMPLETED) {
        // turn off all events
        sw.off('iceConnectionState');

        test_false();
      }
    });

    sw.on('peerRestart', function (peerId, peerInfo) {
      // check the set stream settings
      if (typeof peerInfo.settings.audio === 'object' &&
        peerInfo.settings.audio.stereo === false) {
        array.push(1);
      }
      if (typeof peerInfo.settings.video === 'boolean' ||
        typeof peerInfo.settings.video === 'object') {
        array.push(2);
      }
      t.deepEqual(array, [1, 2],
        'Set audio and video settings correct (settings=default)');
      // turn off all events
      sw.off('peerRestart');
    });

    console.log('Sending "RESTART-PEER-DEFAULT"');
    sw.sendMessage('RESTART-PEER-DEFAULT');
  };

  // 2. test that getUserMedia should not be called if all settings is false
  var test_false = function () {
    sw.on('iceConnectionState', function (state, peerId) {
      if (state === sw.ICE_CONNECTION_STATE.COMPLETED) {
        // turn off all events
        sw.off('iceConnectionState');

        test_settings();
      }
    });

    sw.on('peerRestart', function (peerId, peerInfo) {
      // check the set stream settings
      t.deepEqual([
        peerInfo.settings.audio,
        peerInfo.settings.video
      ], [false, false], 'Set audio and video settings correct (settings=false)');

      // turn off all events
      sw.off('peerRestart');
    });

    console.log('Sending "RESTART-PEER-FALSE"');
    sw.sendMessage('RESTART-PEER-FALSE');
  };

  // 2. test that video resolutions
  var test_settings = function () {
    sw.on('iceConnectionState', function (state, peerId) {
      if (state === sw.ICE_CONNECTION_STATE.COMPLETED) {
        // turn off all events
        sw.off('iceConnectionState');

        sw.leaveRoom(function () {
          t.end();
        });
      }
    });

    sw.on('peerRestart', function (peerId, peerInfo) {
      // check the set stream settings
      t.deepEqual({
        audio: { stereo: true },
        video: {
          resolution: {
            width: 1000,
            height: 500
          },
          frameRate: 55
        }
      }, {
        audio: peerInfo.settings.audio,
        video: peerInfo.settings.video
      }, 'Set audio and video settings correct (settings=userset)');
      // turn off all events
      sw.off('peerRestart');
    });

    console.log('Sending "RESTART-PEER-SETTINGS"');
    sw.sendMessage('RESTART-PEER-SETTINGS');
  };

  // call the first test
  sw.on('iceConnectionState', function (state, peerId) {
    if (state === sw.ICE_CONNECTION_STATE.COMPLETED) {
      // turn off all events
      sw.off('iceConnectionState');

      test_default();
    }
  });

  // join the room
  console.log('Peer "PEER1" is joining the room');
  sw.joinRoom();
});


test('Mute stream settings', function(t) {
  t.plan(2);

  var current_state = 0;

  sw.on('peerJoined', function (peerId, peerInfo, isSelf) {
    if (isSelf) {
      sw.muteStream({
        audioMuted: true
      });
      // turn off all events
      sw.off('peerJoined');
    }
  });

  sw.on('peerUpdated', function (peerId, peerInfo, isSelf) {
    if (isSelf) {
      if (current_state === 0) {
        t.deepEqual(peerInfo.mediaStatus.audioMuted, true,
          'Is audio muted and updated');
        current_state = 1;
        sw.muteStream({
          audioMuted: true,
          videoMuted: false,
          getEmptyStream: true
        });
      }
      if (current_state === 1) {
        t.deepEqual(peerInfo.mediaStatus.videoMuted, false,
          'Is video unmuted and updated');

        // turn off all events
        sw.off('peerUpdated');

        sw.leaveRoom(function () {
          t.end();
        });
      }
    }
  });

  // join the room
  console.log('Peer "PEER1" is joining the room');
  console.log('> Requesting audio and video');

  sw.joinRoom({
    audio: true
  });
});

test('Manual getUserMedia', function(t) {
  t.plan(2);

  sw.on('mediaAccessRequired', function () {
    t.pass('Triggers mediaAccessRequired');
  });

  sw.on('mediaAccessSuccess', function () {
    t.fail('Triggers getUserMedia without user retriving it it\'s own');
    sw.off('mediaAccessRequired');
    sw.off('mediaAccessSuccess');
    sw.off('mediaAccessError');
    t.end();
  });

  sw.on('mediaAccessError', function (error) {
    if (error === 'Waiting for stream timeout') {
      t.pass('Triggers mediaAccessError after 30 seconds');
    }
    sw.off('mediaAccessRequired');
    sw.off('mediaAccessSuccess');
    sw.off('mediaAccessError');
    t.end();
  });

  console.log(': Test joinRoom with no audio and video');
  sw.joinRoom({
    manualGetUserMedia: true,
    audio: true,
    video: true
  });
});

test('Media access stopped', function(t) {
  t.plan(1);

  sw.on('mediaAccessSuccess', function () {
    t.leaveRoom(function () {
      t.end();
    });
  });

  sw.on('mediaAccessStopped', function () {
    t.pass('Triggers mediaAccessStopped after media access stopped');

    sw.off('mediaAccessStopped');
    sw.off('mediaAccessSuccess');
    sw.off('mediaAccessError');
    t.end();
  });

  sw.on('mediaAccessError', function (error) {
    t.fail('Failed retriving stream');

    sw.off('mediaAccessStopped');
    sw.off('mediaAccessSuccess');
    sw.off('mediaAccessError');
    t.end();
  });

  console.log(': Test joinRoom with audio and video');

  sw.joinRoom({
    audio: true,
    video: true
  });
});

/* test should test
 * 1. joinRoom - getUserMedia constraints
 * - if user joins the room at first with getUserMedia, it should prompt for userMedia
 * - if user joins a room without usermedia options, it should just change the room
 * - if user joins a room with new usermedia options
 *   or about the same optins, it should prompt for usermedia
 * - if user has a manualGetUserMedia, the waitForStreams should continue
 *   process and getUserMedia should not be prompted.
 * - if user has a manualGetUserMedia false, the waitForStreams should check
 *   if there is constraints and prompt accordingly if not dont
 * 2. leaveRoom
 * - mediaAccess should stop
 * - getUserMedia to be called
 * 3. sendStream
 * - joinRoom should call sendStream to set the user stream instead
 * 4. getUserMedia
 * - it should only get the user media
 */
})();