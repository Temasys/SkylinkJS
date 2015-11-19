(function() {

'use strict';

var exports = require('../config.js');
var test    = require('tape');
var sw      = new Skylink();

console.log('BOT Peer intiailized');


sw.init(apikey);

sw.joinRoom({
  userData: 'PEER2'
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
    console.log('User "' + peerInfo.userData + '" has left the room');
  }
});

})();