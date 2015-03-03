(function() {

'use strict';

// Dependencies
var test = require('tape');
window.io = require('socket.io-client');
var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink = require('./../publish/skylink.debug.js');
var sw = new skylink.Skylink();

// Testing attributes
var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';


console.log('API: Tests that the sdp is modified correctly based on settings passed in joinRoom()');
console.log('===============================================================================================');

test('_setLocalAndSendMessage(): Testing SDP modification settings', function(t) {
  t.plan(4);

  var hasStereoFailed = false;

  sw.init(apikey, function(){
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
      var i;

      console.log('items', items.length);

      for (i = 0; i < items.length; i += 1) {
        var item = items[i];

        if (typeof item !== 'undefined') {

          console.info(item, i);

          // Test stereo
          if (item.indexOf('stereo=1') > -1) {
            if (!hasStereo) {
              hasStereo = true;
            } else {
              t.fail('Contains an additional stereo flag');
              hasStereoFailed = true;
            }
          }

          // Test bandwidth 200 for audio
          if (item.indexOf('audio') > -1 && !hasAudioBandwidth) {
            var checkItem = items[i + 2] || '';

            if (checkItem.indexOf('b=AS:200') === 0) {
              hasAudioBandwidth = true;
            }
          }

          // Test bandwidth 250 for audio
          if (item.indexOf('video') > -1 && !hasVideoBandwidth) {
            var checkItem = items[i + 2] || '';

            if (checkItem.indexOf('b=AS:250') === 0) {
              hasVideoBandwidth = true;
            }
          }

          // Test bandwidth 300 for data
          if ((item.indexOf('data') > -1 || item.indexOf('application') > -1)
            && !hasDataBandwidth) {
            var checkItem = items[i + 2] || '';
            if (checkItem.indexOf('b=AS:300') === 0) {
              hasDataBandwidth = true;
            }
          }
        }
      }

      if (window.webrtcDetectedBrowser === 'firefox' && !hasStereo) {
        t.pass('Ignore this check as firefox does not have OPUS implemented to have stereo enabled in sdp');
      } else {
        t.deepEqual(hasStereo, true, 'Contains stereo flag when OPUS is enabled in sdp');
      }

      t.deepEqual(hasAudioBandwidth, true, 'Contains the audio bandwidth b=AS: in sdp');
      t.deepEqual(hasVideoBandwidth, true, 'Contains the video bandwidth b=AS: in sdp');
      t.deepEqual(hasDataBandwidth, true, 'Contains the data bandwidth b=AS: in sdp');

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