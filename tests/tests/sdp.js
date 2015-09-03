(function() {

'use strict';

// Dependencies
var exports = require('../config.js');
var sw = new Skylink();

// Testing attributes
var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';


console.log('API: Tests that the sdp is modified correctly based on settings passed in joinRoom()');
console.log('===============================================================================================');

test('_setLocalAndSendMessage(): Testing SDP modification settings', function(t) {
  t.plan(6);

  var hasStereoFailed = false;

  sw.init({
    apiKey: apikey,
    audioCodec: sw.AUDIO_CODEC.ISAC,
    videoCodec: sw.VIDEO_CODEC.H264

  }, function(){
    sw.joinRoom({
      userData: 'PEER1',
      /*audio: true,
      video: true*/
      audio: {
        stereo: true
      },
      video: {
        frameRate: 60,
        resolution: {
          width: 400,
          height: 200
        }
      },
      bandwidth:{
        audio: 200,
        video: 250,
        data: 300
      }
    });
  });

  sw.on('peerConnectionState',function(state, peerId){
    if (state === sw.PEER_CONNECTION_STATE.STABLE) {
      var localDesc = (sw._peerConnections[peerId].localDescription || {}).sdp || '';

      console.log('Sdp-> ' + localDesc);

      var items = localDesc.split('\r\n');

      var hasStereo = false;
      var hasAudioBandwidth = false;
      var hasVideoBandwidth = false;
      var hasDataBandwidth = false;
      var hasSelectedAudioCodec = false;
      var hasSelectedVideoCodec = false;

      // NOTE: Firefox DOES support opus
      // test stereo
      (function () {
        var i, j;
        var opusPayload = 0;
        var line;

        for (i = 0; i < items.length; i += 1) {
          line = items[i];

          if (line.indexOf('a=rtpmap') === 0 && line.indexOf('opus') > 0) {
            opusPayload = (line.split(' '))[0].split(':')[1];
            break;
          }
        }

        for (j = 0; j < items.length; j += 1) {
          line = items[j];

          if (line.indexOf('a=fmtp:' + opusPayload) === 0) {
            hasStereo = line.indexOf('stereo=1') > 0;
            break;
          }
        }
      })();

      // test bandwidth (audio)
      (function () {
        var i;
        var line;

        for (i = 0; i < items.length; i += 1) {
          line = items[i];

          if (line.indexOf('m=audio') === 0 || line.indexOf('a=audio') === 0) {
            hasAudioBandwidth = items[i + 2] === 'b=AS:' + 200;
            break;
          }
        }
      })();

      // test bandwidth (video)
      (function () {
        var i;
        var line;

        for (i = 0; i < items.length; i += 1) {
          line = items[i];

          if (line.indexOf('m=video') === 0 || line.indexOf('a=video') === 0) {
            hasVideoBandwidth = items[i + 2] === 'b=AS:' + 250;
            break;
          }
        }
      })();

      // test bandwidth (data)
      (function () {
        var i;
        var line;

        for (i = 0; i < items.length; i += 1) {
          line = items[i];

          if (line.indexOf('m=application') === 0 || line.indexOf('a=application') === 0) {
            hasDataBandwidth = items[i + 2] === 'b=AS:' + 300;
            break;
          }
        }
      })();

      // test audio codec
      (function () {
        var i, j;
        var selectedCodecPayload = 0;
        var line;

        // check if use the selected codec or fallback
        var audioCodec = items.join(' ').indexOf(sw.AUDIO_CODEC.ISAC) > 0 ?
          sw.AUDIO_CODEC.ISAC : sw.AUDIO_CODEC.OPUS;

        // get the selected codec payload
        for (i = 0; i < items.length; i += 1) {
          line = items[i];

          if (line.indexOf('a=rtpmap:') === 0 && line.indexOf(audioCodec) > 0) {
            selectedCodecPayload = (line.split(' '))[0].split(':')[1];
            break;
          }
        }

        // if there is check if it's the first as option
        for (j = 0; j < items.length; j += 1) {
          line = items[j];

          if (line.indexOf('m=audio') === 0 || line.indexOf('a=audio') === 0) {
            hasSelectedAudioCodec = line.split(' ')[3] === selectedCodecPayload;
            break;
          }
        }
      })();

      // test video codec
      (function () {
        var i, j;
        var selectedCodecPayload = 0;
        var line;

        // check if use the selected codec or fallback
        var videoCodec = items.join(' ').indexOf(sw.VIDEO_CODEC.H264) > 0 ?
          sw.VIDEO_CODEC.H264 : sw.VIDEO_CODEC.VP8;

        // get the selected codec payload
        for (i = 0; i < items.length; i += 1) {
          line = items[i];

          if (line.indexOf('a=rtpmap:') === 0 && line.indexOf(videoCodec) > 0) {
            selectedCodecPayload = (line.split(' '))[0].split(':')[1];
            break;
          }
        }

        // if there is check if it's the first as option
        for (j = 0; j < items.length; j += 1) {
          line = items[j];

          if (line.indexOf('m=video') === 0 || line.indexOf('a=video') === 0) {
            hasSelectedVideoCodec = line.split(' ')[3] === selectedCodecPayload;
            break;
          }
        }
      })();

      t.deepEqual(hasStereo, true, 'Contains stereo flag when OPUS is enabled in sdp');
      t.deepEqual(hasAudioBandwidth, true, 'Contains the audio bandwidth b=AS: in sdp');
      t.deepEqual(hasVideoBandwidth, true, 'Contains the video bandwidth b=AS: in sdp');
      t.deepEqual(hasDataBandwidth, true, 'Contains the data bandwidth b=AS: in sdp');

      t.deepEqual(hasSelectedAudioCodec, true, 'Contains preferred audio codec when available');
      t.deepEqual(hasSelectedVideoCodec, true, 'Contains preferred video codec when available');

      t.end();

      sw.leaveRoom();
    }
  });

  /*sw.on('handshakeProgress',function(step,peerId,error){
    console.log('Handshake: '+step);
    if (step === 'answer'){
      setTimeout(function(){
        var remoteDesc = JSON.stringify(sw._peerConnections[peerId].localDescription);
        console.log('Sdp-> '+remoteDesc);
        if (remoteDesc.indexOf('max-fr=70;max-recv-width=500;max-recv-height=300')>-1){
          t.pass('SDP modified correctly');
        }
        else{
          t.fail('SDP modified incorrectly');
        }
      },3000);
      console.info(window.SkylinkLogs.getLogs());
    }
  });*/

});

})();