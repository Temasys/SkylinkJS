SkylinkDemo.on('incomingStream', function (stream, peerId, peerInfo, isSelf) {
	var peerVideo = document.createElement('video');
	peerVideo.id = peerId;
	peerVideo.autoplay = 'autoplay';
	document.body.appendChild(peerVideo);
	attachMediaStream(peerVideo, stream);
	peerVideo.play();
});

SkylinkDemo.on('peerLeft', function (peerId, stream, isSelf) {
	document.body.removeChild(
		document.getElementById(peerId));
});

SkylinkDemo.joinRoom({
	audio: true,
	video: true
});
