(function() {

'use strict';

var exports = require('../config.js');
var test    = require('tape');
var sw      = new Skylink();

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