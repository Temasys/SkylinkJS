var audioMuted = false;
var videoMuted = false;

SkywayDemo.on('peerJoined', function (peerId, peerInfo, isSelf) {
	if (isSelf) {
		var toggleAudio = document.getElementById('toggleAudio');
		var toggleVideo = document.getElementById('toggleVideo');
		toggleAudio.style.display = 'inline';
		audioMuted = peerInfo.mediaStatus.audioMuted;
		toggleAudio.innerHTML =
			(peerInfo.mediaStatus.audioMuted) ? 'Enable Audio' : 'Disable Audio';
		toggleVideo.style.display = 'inline';
		videoMuted = peerInfo.mediaStatus.videoMuted;
		toggleVideo.innerHTML =
			(peerInfo.mediaStatus.videoMuted) ? 'Enable Video' : 'Disable Video';
	}
	var peer = document.createElement('div');
	peer.id = peerId;
	var peerStatus = document.createElement('p');
	peerStatus.style.fontFamily = 'sans-serif';
	peerStatus.style.position = 'absolute';
	peerStatus.style.background = 'rgba(0,0,0,0.5)';
	peerStatus.style.color = '#fff';
	peerStatus.innerHTML = '<span id="' + peerId + '_audioStatus">' +
		((peerInfo.mediaStatus.audioMuted) ? 'Audio Disabled' : 'Audio Enabled') +
		'</span><br><span id="' + peerId + '_videoStatus">' +
		((peerInfo.mediaStatus.videoMuted) ? 'Video Disabled' : 'Video Enabled') +
		'</span>';
	var peerVideo = document.createElement('video');
	peerVideo.id = peerId + '_stream';
	peerVideo.autoplay = 'autoplay';
	document.body.appendChild(peer);
	peer.appendChild(peerStatus);
	peer.appendChild(peerVideo);
	peerVideo.play();
	if (isSelf) {
		peerVideo.muted = 'muted';
	}
});

SkywayDemo.on('incomingStream', function (peerId, stream, isSelf) {
	var peerVideo = document.getElementById(peerId + '_stream');
	attachMediaStream(peerVideo, stream);
});

SkywayDemo.on('peerUpdated', function (peerId, peerInfo, isSelf) {
	if (isSelf) {
		audioMuted = peerInfo.mediaStatus.audioMuted;
		videoMuted = peerInfo.mediaStatus.videoMuted;
	}
	var audioStatus = document.getElementById(peerId + '_audioStatus');
	audioStatus.innerHTML = ((peerInfo.mediaStatus.audioMuted) ? 'Audio Disabled' : 'Audio Enabled');
	var videoStatus = document.getElementById(peerId + '_videoStatus');
	videoStatus.innerHTML = ((peerInfo.mediaStatus.videoMuted) ? 'Video Disabled' : 'Video Enabled');
});

SkywayDemo.on('peerLeft', function (peerId, stream, isSelf) {
	document.body.removeChild(
		document.getElementById(peerId));
});

function joinRoom () {
	var settings = {
		av: { audio: true, video : true },
		v: { audio : false, video : true },
		a: { audio: true, video: false },
		o: { audio: false, video: false }
	};
	SkywayDemo.joinRoom(settings[document.getElementById('settings').value]);
}

function toggleAudio () {
	var toggleAudio = document.getElementById('toggleAudio');
	setTimeout(function () {
		if (audioMuted) {
			SkywayDemo.enableAudio();
			toggleAudio.innerHTML = 'Disable Audio';
		} else {
			SkywayDemo.disableAudio();
			toggleAudio.innerHTML = 'Enable Audio';
		}
	}, 1000);
}

function toggleVideo () {
	var toggleVideo = document.getElementById('toggleVideo');
	setTimeout(function () {
		if (videoMuted) {
			SkywayDemo.enableVideo();
			toggleVideo.innerHTML = 'Disable Video';
		} else {
			SkywayDemo.disableVideo();
			toggleVideo.innerHTML = 'Enable Video';
		}
	}, 1000);
}