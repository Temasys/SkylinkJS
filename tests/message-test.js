var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';


sw.init(apikey);

sw.joinRoom();

sw.on('peerJoined', function (peerId, peerInfo, isSelf) {
  if (!isSelf) {
    // Start test signaling message
    sw.sendMessage('SIG-SEND-PUBLIC');
  }
});

test('Testing signalling message', function (t) {
  t.plan(2);

  sw.on('incomingMessage', function (message, peerId, peerInfo, isSelf) {
    if (message.content === 'SIG-PUBLIC') {
      if (message.isPrivate === false && message.isDataChannel === false) {
        t.pass('Signaling public message is correctly send and received');
      } else {
        t.fail('Signaling public message sending and receiving failed');
      }
      sw.sendMessage('SIG-SEND-PRIVATE');
    }
    if (message.content === 'SIG-PRIVATE') {
      if (message.isPrivate === true && message.isDataChannel === false) {
        t.pass('Signaling private message is correctly send and received');
      } else {
        t.fail('Signaling private message sending and receiving failed');
      }
    }
  });
});

test('Testing datachannel message', function (t) {
  t.plan(2);

  sw.sendMessage('DC-SEND-PUBLIC');

  sw.on('incomingMessage', function (message, peerId, peerInfo, isSelf) {
    if (message.content === 'DC-PUBLIC') {
      if (message.isPrivate === false && message.isDataChannel === false) {
        t.pass('Datachannel public message is correctly send and received');
      } else {
        t.fail('Datachannel public message sending and receiving failed');
      }
      sw.sendMessage('DC-SEND-PRIVATE');
    }
    if (message.content === 'DC-PRIVATE') {
      if (message.isPrivate === true && message.isDataChannel === false) {
        t.pass('Datachannel private message is correctly send and received');
      } else {
        t.fail('Datachannel private message sending and receiving failed');
      }
    }
  });
});
