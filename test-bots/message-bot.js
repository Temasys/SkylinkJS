(function() {

'use strict';

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

console.log('BOT Message intiailized');

sw.on('incomingMessage', function (message, peerId, peerInfo, isSelf) {
	if (!isSelf) {

		console.log('Received "' + message.content + '"');

		if (message.content === 'SIG-SEND-PUBLIC') {
			sw.sendMessage('SIG-PUBLIC');
			console.log('Sending "SIG-PUBLIC"');
		}
		if (message.content === 'SIG-SEND-PRIVATE') {
			sw.sendMessage('SIG-PRIVATE', peerId);
			console.log('Sending "SIG-PRIVATE"');
		}
		if (message.content === 'DC-SEND-PUBLIC') {
			sw.sendP2PMessage('DC-PUBLIC');
			console.log('Sending "DC-PUBLIC"');
		}
		if (message.content === 'DC-SEND-PRIVATE') {
			sw.sendP2PMessage('DC-PRIVATE', peerId);
			console.log('Sending "DC-PRIVATE"');
		}
	}
});

sw.init(apikey, function(){
	sw.joinRoom();
});

})();