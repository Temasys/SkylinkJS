(function() {

'use strict';

var exports = require('../config.js');
var test    = require('tape');
var sw      = new Skylink();

console.log('BOT "room-connection" intiailized');


sw.init(apikey, function (err, success) {
  if (err) throw err;
  sw.joinRoom({
    userData: 'PEER2'
  }, function (err, success1) {
    if (err) throw err;
    console.log('Joined as "PEER2"');
  });
});

sw.on('peerJoined', function (peerId, peerInfo, isSelf) {
  console.info('peerJoined', peerId, peerInfo, isSelf);

  if (peerInfo.userData === 'PEERLOCK') {
    sw.lockRoom();
  }
});

sw.on('peerLeft', function (peerId, peerInfo, isSelf) {
  console.info('peerLeft', peerId, peerInfo, isSelf);

  if (peerInfo.userData === 'PEERLOCK') {
    setTimeout(function () {
      sw.unlockRoom();
    }, 1500);
  }
});

sw.on('peerRestart', function (peerId, peerInfo, isSelf) {
  console.info('peerRestart', peerId, peerInfo, isSelf);
});

})();