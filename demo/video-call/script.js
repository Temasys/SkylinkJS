SkywayDemo.on('incomingStream', function (peerId, stream, isSelf) {
	var peerVideo = document.createElement('video');
	peerVideo.id = peerId;
	peerVideo.autoplay = 'autoplay';
	document.body.appendChild(peerVideo);
	attachMediaStream(peerVideo, stream);
	peerVideo.play();
});

SkywayDemo.on('peerLeft', function (peerId, stream, isSelf) {
	document.body.removeChild(
		document.getElementById(peerId));
});

SkywayDemo.joinRoom({
	audio: true,
	video: true
});