(function() {

'use strict';

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

console.log('BOT SDP intiailized');

sw.init(apikey, function(){
  sw.joinRoom('defaultroom',{
    userData: 'PEER2',
    audio: {
      stereo: true
    },
    video: {
      frameRate: 70,
      resolution: {
        width: 500,
        height: 300
      }
    },
    bandwidth:{
      audio: 100,
      video: 100,
      data: 100
    }
  });
});

console.log('Peer "PEER2" is joining the room');

sw.on('peerJoined', function (peerId, peerInfo, isSelf) {
	if (isSelf) {
		console.log('User "' + peerInfo.userData + '" has joined the room');
	} else {
		console.log('Peer "' + peerInfo.userData + '" has joined the room');
	}
});

sw.on('peerLeft', function (peerId, peerInfo, isSelf) {
  if (isSelf) {
    console.log('User "' + peerInfo.userData + '" has left the room');
  } else {
    console.log('Peer "' + peerInfo.userData + '" has left the room');
  }
});

})();