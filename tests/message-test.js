(function() {

'use strict';

var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';


test('Testing signalling message', function (t) {
  t.plan(2);

  var received = 0;

  // ice connection state means the peer is connected,
  // datachannel should be connected by then
  sw.on('iceConnectionState', function (state, peerId) {
    if (state === sw.ICE_CONNECTION_STATE.COMPLETED) {
      // Start test signaling message
      sw.sendMessage('SIG-SEND-PUBLIC');
      console.log('Sending sig public');

      setTimeout(function () {
        sw.sendMessage('SIG-SEND-PRIVATE');
        console.log('Sending sig private');
      }, 1000);
    }
  });

  sw.on('incomingMessage', function (message, peerId, peerInfo, isSelf) {
    if (!isSelf) {
      if (message.content === 'SIG-PUBLIC') {
        if (message.isPrivate === false && message.isDataChannel === false) {
          t.pass('Signaling public message is correctly send and received');
        } else {
          t.fail('Signaling public message sending and receiving failed');
        }
        received += 1;
      }
      if (message.content === 'SIG-PRIVATE') {
        if (message.isPrivate === true && message.isDataChannel === false) {
          t.pass('Signaling private message is correctly send and received');
        } else {
          t.fail('Signaling private message sending and receiving failed');
        }
        received += 1;
      }
    }
  });

  setTimeout(function () {
    if (received === 0) {
      t.fail('Signaling public message sending and receiving failed - timeout');
      t.fail('Signaling private message sending and receiving failed - timeout');
    }
    if (received === 1) {
      t.fail('Signaling private message sending and receiving failed - timeout');
    }
    t.end();
  }, 25000);
});

test('Testing datachannel message', function (t) {
  t.plan(2);

  var received = 0;

  setTimeout(function () {
    sw.sendP2PMessage('DC-SEND-PUBLIC');
    console.log('Sending dc public');
  }, 1000);

  setTimeout(function () {
    sw.sendP2PMessage('DC-SEND-PRIVATE');
    console.log('Sending dc private');
  }, 2000);

  sw.on('incomingMessage', function (message, peerId, peerInfo, isSelf) {
    if (!isSelf) {
      if (message.content === 'DC-PUBLIC') {
        if (message.isPrivate === false && message.isDataChannel === true) {
          t.pass('Datachannel public message is correctly send and received');
        } else {
          t.fail('Datachannel public message sending and receiving failed');
        }
        received += 1;
      }
      if (message.content === 'DC-PRIVATE') {
        if (message.isPrivate === true && message.isDataChannel === true) {
          t.pass('Datachannel private message is correctly send and received');
        } else {
          t.fail('Datachannel private message sending and receiving failed');
        }
        received += 1;
      }
    }
  });

  setTimeout(function () {
    if (received === 0) {
      t.fail('Datachannel public message sending and receiving failed - timeout');
      t.fail('Datachannel private message sending and receiving failed - timeout');
    }
    if (received === 1) {
      t.fail('Datachannel private message sending and receiving failed - timeout');
    }
    t.end();
  }, 25000);
});

sw.init(apikey);

sw.joinRoom();

})();