(function() {

'use strict';

var exports = require('../config.js');
var sw = new Skylink();

console.log('BOT Stream intiailized');

sw.init(apikey, function(){
  sw.joinRoom();
});

console.log('This test requires you to click allow on all occassions ' +
  'when media access is asked for. No streams are displayed in this process');

console.log('Peer "PEER1" is joining the room');

sw.on('peerJoined', function (peerId, peerInfo, isSelf) {
	if (isSelf) {
		console.log('User "PEER1" has joined the room');
	} else {
		console.log('Peer "PEER2" has joined the room');
	}
});

sw.on('peerLeft', function (peerId, peerInfo, isSelf) {
  if (isSelf) {
    console.log('User "PEER1" has left the room');
  } else {
    console.log('User "PEER2" has left the room');
  }
});

sw.on('incomingMessage', function (message, peerId, peerInfo, isSelf) {
  if (!isSelf) {
    console.log('Received "' + message.content + '"');
    if (message.content === 'RESTART-PEER-DEFAULT') {
      sw.sendStream({
        audio: true,
        video: true
      });
      console.log('Sending { audio: true, video: true }');
    }
    if (message.content === 'RESTART-PEER-SETTINGS') {
      sw.sendStream({
        audio: {
          stereo: true,
          mute: true
        },
        video: {
          resolution: {
            width: 1000,
            height: 500
          },
          frameRate: 55
        }
      });
      console.log('Sending { audio: { stereo: true }, video: {' +
        '  resolution: sw.VIDEO_RESOLUTION.HD,' +
        '  frameRate: 55' +
        '} }');
    }
    if (message.content === 'RESTART-PEER-FALSE') {
      sw.sendStream({
        audio: false,
        video: false
      });
      console.log('Sending { audio: false, video: false }');
    }
  }
});

})();