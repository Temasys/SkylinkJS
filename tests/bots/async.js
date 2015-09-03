(function() {

'use strict';

var exports = require('../config.js');
var sw = new Skylink();

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
  // sendBlobData
  if (state === sw.DATA_TRANSFER_STATE.UPLOAD_REQUEST) {
    if (transferInfo.dataType === 'blob') {
      if (transferInfo.name === 'accept'){
        console.log('Accepting transfer request "' + transferInfo.name + '"');
        sw.respondBlobRequest(peerId, transferId, true);
      }
      else if (transferInfo.name === 'reject'){
        console.log('Rejecting transfer request "' + transferInfo.name + '"');
        sw.respondBlobRequest(peerId, transferId, false);
      }
    // sendURLData
    } else {
      if (transferInfo.size === 77) {
        console.log('Accepting transfer dataURL request "' + transferInfo.name + '"');
        sw.respondBlobRequest(peerId, transferId, true);
      }
      else if (transferInfo.size === 78){
        console.log('Rejecting transfer dataURL request "' + transferInfo.name + '"');
        sw.respondBlobRequest(peerId, transferId, false);
      }
    }
  }
});

sw.on('peerLeft', function (peerId, peerInfo, isSelf) {
  console.info(peerId, peerInfo, isSelf);
  if (isSelf) {
    console.log('User "' + peerInfo.userData + '" has left the room');
  } else {
    console.log('Peer "' + peerInfo.userData + '" has left the room');
  }
});

})();