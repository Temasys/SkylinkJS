var SkylinkDemo = new Skylink();

SkylinkDemo.on('peerJoined', function (peerId, peerInfo, isSelf) {
  addPeer(peerId, isSelf);
});

SkylinkDemo.on('serverPeerJoined', function (peerId, serverPeerType) {
  addPeer(peerId, false, serverPeerType);
});

SkylinkDemo.on('peerLeft', function (peerId, peerInfo, isSelf) {
  removePeer(peerId);
});

SkylinkDemo.on('serverPeerLeft', function (peerId, serverPeerType) {
  removePeer(peerId);
});

SkylinkDemo.on('readyStateChange', function (state, error, room) {
  for (var stateName in SkylinkDemo.READY_STATE_CHANGE) {
    if (SkylinkDemo.READY_STATE_CHANGE[stateName] === state) {
      document.getElementById('readystate').innerHTML = stateName;
    }
  }
});

SkylinkDemo.on('channelOpen', function () {
  document.getElementById('channel').innerHTML = 'open';
});

SkylinkDemo.on('channelMessage', function () {
  document.getElementById('channel').innerHTML = 'message';
});

SkylinkDemo.on('channelClose', function () {
  document.getElementById('channel').innerHTML = 'close';
});

SkylinkDemo.on('channelError', function () {
  document.getElementById('channel').innerHTML = 'error';
});


SkylinkDemo.on('handshakeProgress', function (step, peerId) {
  var peerDom = document.getElementById(peerId + '_hsp');

  if (peerDom) {
    peerDom.innerHTML = step;
    peerDom.className = step || "";
  } else {
    console.error('Peer "' + peerId + '" _hsp DOM does not exists');
  }
});

SkylinkDemo.on('peerConnectionState', function (state, peerId) {
  var peerDom = document.getElementById(peerId + '_pcs');

  if (peerDom) {
    peerDom.innerHTML = state;
    peerDom.className = state || "";
  } else {
    console.error('Peer "' + peerId + '" _pcs DOM does not exists');
  }
});

SkylinkDemo.on('candidateGenerationState', function (state, peerId) {
  var peerDom = document.getElementById(peerId + '_cgs');

  if (peerDom) {
    peerDom.innerHTML = state;
    peerDom.className = state || "";
  } else {
    console.error('Peer "' + peerId + '" _cgs DOM does not exists');
  }
});

SkylinkDemo.on('dataChannelState', function (state, peerId) {
  var peerDom = document.getElementById(peerId + '_dcs');

  if (peerDom) {
    peerDom.innerHTML = state;
    peerDom.className = state || "";
  } else {
    console.error('Peer "' + peerId + '" _dcs DOM does not exists');
  }
});

function addPeer(peerId, isSelf) {
  var peers = document.getElementById('peers');
  var peerItem = document.createElement('tr');
  peerItem.id = peerId;
  peerItem.style.textTransform = 'uppercase';
  peerItem.innerHTML =
    '<td style="border :solid 1px #444;padding: 12px 15px;text-transform:none;">' + ((isSelf) ? 'You' : peerId) + '</td>' +
    '<td id="' + peerId + '_hsp" style="border:solid 1px #444;padding: 12px 15px;"></td>' +
    '<td id="' + peerId + '_pcs" style="border:solid 1px #444;padding: 12px 15px;"></td>' +
    '<td id="' + peerId + '_cgs" style="border:solid 1px #444;padding: 12px 15px;"></td>' +
    '<td id="' + peerId + '_dcs" style="border:solid 1px #444;padding: 12px 15px;"></td>';
  peers.appendChild(peerItem);
}

function removePeer(peerId) {
  var peers = document.getElementById('peers');
  var peerDom = document.getElementById(peerId);

  if (peerDom) {
    //peers.removeChild(peerDom);
    peerDom.style.opacity = 0.5;
    var elms = peerDom.getElementsByTagName('td');
    elms[0].innerHTML += ' (disconn)';
  } else {
    console.error('Peer "' + peerId + '" DOM does not exists');
  }
}

SkylinkDemo.init(config, function (error, success) {
  //Skylink has been initialized we can join the default room
  if (success) {
    SkylinkDemo.joinRoom({
      audio: false,
      video: false
    });
  }
});
