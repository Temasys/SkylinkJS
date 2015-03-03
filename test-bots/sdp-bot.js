(function() {

'use strict';

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();
sw.setLogLevel(4);

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

console.log('BOT SDP intiailized');

sw.init(apikey, function(){
  sw.joinRoom({
    userData: 'PEER2',
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