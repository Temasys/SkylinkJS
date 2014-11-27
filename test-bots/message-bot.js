window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

sw.init(apikey);

sw.joinRoom();

sw.on('incomingMessage', function (message, peerId, peerInfo, isSelf) {
	if (!isSelf) {
		if (message.content === 'SIG-SEND-PUBLIC') {
			sw.sendMessage('SIG-PUBLIC');
		}
		if (message.content === 'SIG-SEND-PRIVATE') {
			sw.sendMessage('SIG-PRIVATE', peerId);
		}
		if (message.content === 'DC-SEND-PUBLIC') {
			sw.sendP2PMessage('DC-PUBLIC');
		}
		if (message.content === 'DC-SEND-PRIVATE') {
			sw.sendP2PMessage('DC-PRIVATE', peerId);
		}
	}
})