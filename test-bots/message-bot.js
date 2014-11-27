window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';


sw.on('incomingMessage', function (message, peerId, peerInfo, isSelf) {
	console.log(((isSelf) ? 'Sending' : 'Received') + ' request "' + message.content + '"');
	if (!isSelf) {
		if (message.content === 'SIG-SEND-PUBLIC') {
			console.log('Sending sig public');
			sw.sendMessage('SIG-PUBLIC');
		}
		if (message.content === 'SIG-SEND-PRIVATE') {
			console.log('Sending sig private');
			sw.sendMessage('SIG-PRIVATE', peerId);
		}
		if (message.content === 'DC-SEND-PUBLIC') {
			console.log('Sending dc public');
			sw.sendP2PMessage('DC-PUBLIC');
		}
		if (message.content === 'DC-SEND-PRIVATE') {
			console.log('Sending dc private');
			sw.sendP2PMessage('DC-PRIVATE', peerId);
		}
	}
});

sw.init(apikey);

sw.joinRoom();