(function() {

'use strict';

// Dependencies
var exports = require('../config.js');
var test    = require('tape');
var sw      = new Skylink();

console.log('API: Tests peer data');
console.log('===============================================================================================');

test('getUserData(): Testing update of userdata', function (t) {
  t.plan(2);
  var hasPassed = false;

  //sample user data
  var testUserData = {
    displayName: "Test User 1",
      userId: "1111"
  };

  sw.init(apikey, function (error, success) {
    if (success) {
      console.log('---- Skylink init complete. Self Joining Room ---- ');
      sw.joinRoom();
    }
  });

  sw.on('peerJoined', function(peerId, peerInfo, isSelf){
    if (isSelf){
      console.log('---- Self Room join successful. Updating user data---- ');
      sw.setUserData(testUserData);
      t.deepEqual(sw.getUserData(), testUserData, 'self user data updated correctly');
      sw.leaveRoom();
    }
  });

  sw.once('peerLeft', function () {
    hasPassed = true;
    sw.off('peerJoined');
    sw.off('peerLeft');
      t.pass('Peer has left. Proceeding to next test');
    });

  setTimeout(function () {
    if (!hasPassed) {
      sw.off('peerJoined');
      sw.off('peerLeft');
      t.end();
    }
  }, 8000);


});

test('setUserData(): Testing receival of updated user data by peers', function (t) {
  t.plan(2);
  var hasPassed = false;

  //sample user data
  var testUserData = {
    displayName: "Test User 1",
      userId: "1111"
  };

  sw.init(apikey, function (error, success) {
    if (success) {
      console.log('---- Skylink init complete. Self Joining Room ---- ');
      sw.joinRoom();
    }
  });

  sw.on('peerJoined', function(peerId, peerInfo, isSelf){
    if (isSelf){
      console.log('---- Self Room join successful. Updating user data---- ');
      sw.setUserData(testUserData);
    }
  });

  sw.on('peerUpdated', function(peerId, peerInfo,isSelf){
    if(isSelf){
      console.log('peer update successful');
      t.deepEqual(peerInfo.userData, testUserData, 'Peer data update received correctly');
      sw.leaveRoom();
    }
  });

  sw.once('peerLeft', function () {
    hasPassed = true;
    sw.off('peerJoined');
    sw.off('peerUpdated');
    sw.off('peerLeft');
      t.pass('Peer has left. Proceeding to next test');
    });

  setTimeout(function () {
    if (!hasPassed) {
      sw.off('peerJoined');
      sw.off('peerUpdated');
      sw.off('peerLeft');
      t.end();
    }
  }, 8000);
});


test('getPeerInfo(): test peer info updation', function (t) {
  t.plan(6);
  var hasPassed = false;

  //sample user data
  var testUserData = {
    displayName: "Test User 1",
      userId: "1111"
  };

  sw.init(apikey, function (error, success) {
    if (success) {
      console.log('---- Skylink init complete. Self Joining Room ---- ');
      sw.joinRoom();
    }
  });

  sw.on('peerJoined', function(peerId, peerInfo, isSelf){
    var INVALID_ID = "INVALID_ID";
    if (isSelf){
      console.log('---- Self Room join successful. Updating user data---- ');
      sw.setUserData(testUserData);
    }
  });

  sw.on('peerUpdated', function(peerId, peerInfo,isSelf){
    var INVALID_ID = "INVALID_ID";
    if (isSelf){
      t.deepEqual(sw.getPeerInfo().userData, testUserData, 'Peer data info received correctly');
      t.deepEqual(sw.getPeerInfo().userData, sw.getUserData(),'Peer info matches self info correctly');
      t.deepEqual(sw.getPeerInfo(null).userData, sw.getUserData(),'Peer info with null matches with self info correctly');
      t.deepEqual(sw.getPeerInfo(peerId).userData, testUserData,'Peer info with id retrived correctly');
      t.deepEqual(sw.getPeerInfo(INVALID_ID), null, 'peer info with invalid id functions as expected');
      sw.leaveRoom();
    }
  });

  sw.once('peerLeft', function () {
    hasPassed = true;
    sw.off('peerJoined');
    sw.off('peerUpdated');
    sw.off('peerLeft');
      t.pass('Peer has left. Proceeding to next test');
    });

  setTimeout(function () {
    if (!hasPassed) {
      sw.off('peerJoined');
      sw.off('peerLeft');
      sw.off('peerUpdated');
      t.end();
    }
  }, 10000);

});

})();