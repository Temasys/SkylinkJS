
SkylinkDemo.on('incomingStream', function (stream, peerId, peerInfo, isSelf) {
  var peer = document.createElement('div');
  peer.id = peerId;
  peer.style.border = 'solid 2px #444';
  peer.style.borderRadius = '15px';
  peer.style.display = 'inline-block';
  peer.style.textAlign = 'center';
  peer.style.fontFamily = 'sans-serif';
  peer.style.marginRight = '15px';
  var peerVoice = document.createElement('video');
  peerVoice.autoplay = 'autoplay';
  peerVoice.poster = 'user.png';
  peerVoice.style.height = '150px';
  var peerName = document.createElement('p');
  peerName.style.background = '#eee';
  peerName.style.margin = '0';
  peerName.style.padding = '12px 0';
  peerName.style.borderTop = 'solid 2px #000';
  peerName.innerHTML = (isSelf) ? 'Me' : peerId;
  document.body.appendChild(peer);
  peer.appendChild(peerVoice);
  peer.appendChild(peerName);
  attachMediaStream(peerVoice, stream);
  peerVoice.play();
});

SkylinkDemo.on('peerLeft', function (peerId, stream, isSelf) {
  document.body.removeChild(
    document.getElementById(peerId));
});

SkylinkDemo.joinRoom({
  audio: true,
  video: false
});
