var iceServers = [{
	url: 'turn:leticia.choo@temasys.com.sg@numb.viagenie.ca',
	credential: 'xxxxxxxxxxx'
}, {
	url: 'stun:leticia.choo@temasys.com.sg@numb.viagenie.ca'
}];

var peerConstraints = {
	dataChannel: true,
	trickleIce: true,
	stream: {
		bandwidth: {
			audio: 55,
			video: 257,
			data: 123123
		}
	},
	iceServers: iceServers
};

var streamConstraints = {
	audio: true,
	video: true
};

var peer1, peer2;
var stream;

// Run and load only when document is ready
$(document).ready(function () {

	// The listener that handles all the event and data
	function listener (event, data) {
		console.log(event, data);
	}

	// Start the manual test :)
	window.start = function() {
		// Set the stream object
		stream = new Stream(null, streamConstraints, listener);

		peerConstraints.stream.audio = stream.config.audio;
		peerConstraints.stream.video = stream.config.video;

		// When stream has started
		stream.onstart = function () {
			// Start the RTCPeerConnection
			peer1 = new Peer(stream, peerConstraints, listener);
			peer2 = new Peer(stream, peerConstraints, listener);
		};
	};

});