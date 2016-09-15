var audioMuted = false;
var videoMuted = false;
var SkylinkDemo = new Skylink();

SkylinkDemo.on('peerJoined', function (peerId, peerInfo, isSelf) {
	console.info('"peerJoined" event ->', [peerId, peerInfo, isSelf]);

	if (isSelf) {
		var toggleAudio = document.getElementById('toggleAudio');
		var toggleVideo = document.getElementById('toggleVideo');

		if (peerInfo.settings.audio) {
			toggleAudio.style.display = 'inline';
		}

		if (peerInfo.settings.video) {
			toggleVideo.style.display = 'inline';
		}

		audioMuted = peerInfo.mediaStatus.audioMuted;
		videoMuted = peerInfo.mediaStatus.videoMuted;

		toggleAudio.innerHTML = (peerInfo.mediaStatus.audioMuted) ? 'Enable Audio' : 'Disable Audio';
		toggleVideo.innerHTML = (peerInfo.mediaStatus.videoMuted) ? 'Enable Video' : 'Disable Video';
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
		((peerInfo.mediaStatus.videoMuted) ? 'Video Disabled' : 'Video Enabled') + '</span>';

	var peerVideo = document.createElement('video');
	peerVideo.id = peerId + '_stream';

	if (window.webrtcDetectedBrowser !== 'IE') {
    peerVideo.autoplay = 'autoplay';
  }

	document.body.appendChild(peer);

	peer.appendChild(peerStatus);
	peer.appendChild(peerVideo);

	if (isSelf && window.webrtcDetectedBrowser !== 'IE') {
		peerVideo.muted = 'muted';
	}
});

SkylinkDemo.on('incomingStream', function (peerId, stream, isSelf, peerInfo) {
	console.info('"incomingStream" event ->', [peerId, stream, isSelf, peerInfo]);

	var peerVideo = document.getElementById(peerId + '_stream');
	attachMediaStream(peerVideo, stream);
});

SkylinkDemo.on('peerUpdated', function (peerId, peerInfo, isSelf) {
	console.info('"peerUpdated" event ->', [peerId, peerInfo, isSelf]);

	if (isSelf) {
		audioMuted = peerInfo.mediaStatus.audioMuted;
		videoMuted = peerInfo.mediaStatus.videoMuted;
	}
	var audioStatus = document.getElementById(peerId + '_audioStatus');
	audioStatus.innerHTML = ((peerInfo.mediaStatus.audioMuted) ? 'Audio Disabled' : 'Audio Enabled');
	var videoStatus = document.getElementById(peerId + '_videoStatus');
	videoStatus.innerHTML = ((peerInfo.mediaStatus.videoMuted) ? 'Video Disabled' : 'Video Enabled');
});

SkylinkDemo.on('peerRestart', function (peerId, peerInfo, isSelf) {
	console.info('"peerRestart" event ->', [peerId, peerInfo, isSelf]);
});

SkylinkDemo.on('streamEnded', function (peerId, peerInfo, isSelf, isScreensharing) {
	console.info('"streamEnded" event ->', [peerId, peerInfo, isSelf, isScreensharing]);
});

SkylinkDemo.on('mediaAccessStopped', function (isScreensharing) {
	console.info('"mediaAccessStopped" event ->', [isScreensharing]);
});

SkylinkDemo.on('peerLeft', function (peerId, stream, isSelf) {
	document.body.removeChild(
		document.getElementById(peerId));
});

SkylinkDemo.init(config);

function joinRoom () {
	var settings = {
		av: { audio: true, video : true },
		v: { audio : false, video : true },
		a: { audio: true, video: false },
		o: { audio: false, video: false }
	};
	document.getElementById('toggleAudio').style.display = 'none';
	document.getElementById('toggleVideo').style.display = 'none';
	SkylinkDemo.joinRoom(settings[document.getElementById('settings').value]);
}

function toggleAudio () {
	var toggleAudio = document.getElementById('toggleAudio');
	setTimeout(function () {
		if (audioMuted) {
			SkylinkDemo.enableAudio();
			toggleAudio.innerHTML = 'Disable Audio';
		} else {
			SkylinkDemo.disableAudio();
			toggleAudio.innerHTML = 'Enable Audio';
		}
	}, 1000);
}

function toggleVideo () {
	var toggleVideo = document.getElementById('toggleVideo');
	setTimeout(function () {
		if (videoMuted) {
			SkylinkDemo.enableVideo();
			toggleVideo.innerHTML = 'Disable Video';
		} else {
			SkylinkDemo.disableVideo();
			toggleVideo.innerHTML = 'Enable Video';
		}
	}, 1000);
}
