(function() {

'use strict';

window.io = require('socket.io-client');

window.AdapterJS = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = '5c111af5-03cd-4d6b-ba58-4334551fcb74';

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