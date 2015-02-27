(function() {

'use strict';

var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');

var skylink = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

test('Testing SDP settings', function(t){
  t.plan(1);

  sw.init(apikey);

  sw.joinRoom('defaultroom',{
    userData: 'PEER1',
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

  sw.on('peerConnectionState',function(state,peerId){
    console.log('Connection state: '+state);
    if (state === 'stable'){
      setTimeout(function(){
        var remoteDesc = JSON.stringify(sw._peerConnections[peerId].localDescription);
        console.log('Sdp-> '+remoteDesc);
        if (remoteDesc.indexOf('stereo=1')>-1 &&
          remoteDesc.indexOf('b=AS:200')>-1 &&
          remoteDesc.indexOf('b=AS:250')>-1 &&
          remoteDesc.indexOf('b=AS:300')>-1){
            t.pass('SDP modified correctly');
            t.end();
        }
        else{
          t.fail('SDP modified incorrectly');
          t.end();
        }
      },3000);
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