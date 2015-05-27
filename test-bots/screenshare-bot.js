(function() {

'use strict';

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = 'fa152f2f-ad7a-46d1-a3be-cb0dffc617b5';

console.log('BOT Stream intiailized');

sw.init(apikey, function(){
  sw.joinRoom({
    audio: true,
    video: true
  });
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
    if (message.content === 'SCREENSHARE') {
      sw.shareScreen();
      console.log('Sending screensharing stream');
    }
  }
});

})();