var rtcoptions = {
	iceServers: [],
	//iceTransportPolicy: 'relay'
};

var peer1 = new RTCPeerConnection(rtcoptions);
var peer2 = new RTCPeerConnection(rtcoptions);

var video1 = document.getElementById('peer1');
var video2 = document.getElementById('peer2');

var queue1 = [];
var queue2 = [];

var connect1 = false;
var connect2 = false;

function getStream(stream) {
	peer1.nid = '1';
	peer2.nid = '2';

	window.streamData = stream;

	peer1.sendCandidate = function (candidate) {
		if (candidate.candidate === null) {
			console.log('Peer 1 generation complete');

		} else {
			if (!!peer2.remoteDescription) {
				peer2.addIceCandidate(candidate);

				console.log('Peer 2 adding candidate', candidate);

			} else {
				queue2.push(candidate);

				console.log('Peer 2 queueing candidate', candidate);
			}
		}
	};

	peer1.negotiate = function () {
		// Create offer
		peer1.createOffer(function (offer) {
			// Set local offer
			peer1.setLocalDescription(offer, function () {
				// Set remote offer
				peer2.setRemoteDescription(offer, function () {
					// Create answer
					peer2.createAnswer(function (answer) {
						// Set local answer
						peer2.setLocalDescription(answer, function() {
							// Set remote answer
							peer1.setRemoteDescription(answer, function () {
								console.log('Called initiaized');
								pop (peer1, '1');
								connect1 = true;
								connect2 = true;
							// Set remote answer
							}, function (error) {
								throw error;
							});
						// Set local answer
						}, function (error) {
							throw error;
						});
					// Create answer
					}, function (error) {
						throw error;
					});
					pop (peer2, '2');
				// Set remote offer
				}, function (error) {
					throw error;
				});
			// Set local offer
			}, function (error) {
				throw error;
			});
		// Offer
		}, function (error) {
			throw error;
		}, {
			mandatory: {
	        OfferToReceiveAudio: true,
	        OfferToReceiveVideo: true,
	        iceRestart: connect1
	    }
			//iceRestart: true,
			//voiceActivityDetection: true
		});
	};

	peer2.sendCandidate = function (candidate) {
		if (candidate.candidate === null) {
			console.log('Peer 2 generation complete');

		} else {
			if (!!peer1.remoteDescription) {
				peer1.addIceCandidate(candidate);

				console.log('Peer 1 adding candidate', candidate);

			} else {
				queue1.push(candidate);

				console.log('Peer 1 queueing candidate', candidate);
			}
		}
	};

	peer2.negotiate = function () {

	};

	bind(peer1, '1');
	bind(peer2, '2');

	peer1.addStream(stream);
	peer1.addStream(stream);
	peer2.addStream(stream);

	if (window.webrtcDetectedType !== 'webkit') {
		peer1.onnegotiationneeded(peer1);
		peer2.onnegotiationneeded(peer2);
	}
}

function bind (peer, peerId) {
	peer.onaddstream = function (event) {
		console.log('Peer ' + peerId + ' received stream =>', event.stream || event);

		attachMediaStream(document.getElementById('peer' + peerId), event.stream || event);
	};

	peer.ondatachannel = function (event) {
		console.log('Peer ' + peerId + ' received datachannel =>', event.channel || event);
	};

	peer.onicecandidate = function (event) {
		console.log('Peer ' + peerId + ' generated candidate =>', event.candidate || event);

		peer.sendCandidate(event.candidate || event);
	};

	peer.oniceconnectionstatechange = function (event) {
		console.log('Peer ' + peerId + ' ice connection state =>', peer.iceConnectionState);
	};

	peer.onidentityresult = function (event) {
		console.log('Peer ' + peerId + ' identity result =>', event);
	};

	peer.onidpassertionerror = function (event) {
		console.log('Peer ' + peerId + ' idp assertion error =>', event);
	};

	peer.onidpvalidationerror = function (event) {
		console.log('Peer ' + peerId + ' idp validation error =>', event);
	};

	peer.onnegotiationneeded = function (event) {
		console.log('Peer ' + peerId + ' on negotiation needed =>', event);

		peer.negotiate();
	};

	peer.onisolationchange = function (event) {
		console.log('Peer ' + peerId + ' on isolation change =>', event);

		peer.negotiate();
	};

	peer.onpeeridentity = function (event) {
		console.log('Peer ' + peerId + ' received stream =>', event);
	};

	peer.onremovestream = function (event) {
		console.log('Peer ' + peerId + ' removed stream =>', event);
	};

	peer.onsignalingstatechange = function (event) {
		console.log('Peer ' + peerId + ' signaling state =>', peer.signalingState);
	};
}

function pop (peer, peerId) {
 if (peerId === '1') {
 	 candidates = queue1;
 } else {
 	 candidates = queue2;
 }

 var i;

 for (i = 0; i < candidates.length; i++) {
 		peer.addIceCandidate(candidates[i]);

 		console.log('Peer ' + peerId + ' adding queued candidate', candidates[i]);
 }
}

function rengo () {
	//peer1.close();
	// Create offer
	/*var fn = function () {
	peer1.createOffer(function (offer) {
		// Set local offer
		peer1.setLocalDescription(offer, function () {
			// Set remote offer
			peer2.setRemoteDescription(offer, function () {
				// Create answer
				peer2.createAnswer(function (answer) {
					// Set local answer
					peer2.setLocalDescription(answer, function() {
						// Set remote answer
						peer1.setRemoteDescription(answer, function () {
							console.log('Called initiaized');
							pop (peer1);
						// Set remote answer
						}, function (error) {
							throw error;
						});
					// Set local answer
					}, function (error) {
						throw error;
					});
				// Create answer
				}, function (error) {
					throw error;
				});
				pop (peer2);
			// Set remote offer
			}, function (error) {
				throw error;
			});
		// Set local offer
		}, function (error) {
			throw error;
		});
	// Offer
	}, function (error) {
		throw error;
	}, {
		mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
	});
};*/

window.getUserMedia({
		audio: true,
		//video: true

	}, function (strem) {
		//peer1.addStream(strem);

		if (window.webrtcDetectedType !== 'webkit') {
			peer1.onnegotiationneeded(peer1);
		}
	}, function (error) {
		throw error;
	});
}



window.getUserMedia({
	audio: true,
	video: true

}, getStream, function (error) {
	throw error;
});