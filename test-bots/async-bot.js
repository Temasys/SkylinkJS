(function() {

'use strict';

window.io = require('socket.io-client');

window.AdapterJS = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

//sw.setLogLevel(4);

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

console.log('BOT Async intiailized');


sw.init(apikey,function(){
  sw.joinRoom({
    userData: 'PEER2'
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

sw.on('dataTransferState', function (state, transferId, peerId, transferInfo) {
  if (state === sw.DATA_TRANSFER_STATE.UPLOAD_REQUEST) {

    if (transferInfo.name === 'accept'){
      sw.respondBlobRequest(peerId, true);
    }
    else if (transferInfo.name === 'reject'){
      sw.respondBlobRequest(peerId, false); 
    }
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