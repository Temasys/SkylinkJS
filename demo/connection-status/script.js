SkywayDemo.on('peerJoined', function(peerId, peerInfo, isSelf) {
  addPeer(peerId, isSelf);
});

SkywayDemo.on('peerLeft', function(peerId, peerInfo, isSelf) {
  var peers = document.getElementById('peers');
  peers.removeChild(document.getElementById(peerId));
});

SkywayDemo.on('readyStateChange', function(state) {
  for (var stateName in SkywayDemo.READY_STATE_CHANGE) {
    if (SkywayDemo.READY_STATE_CHANGE[stateName] === state) {
      document.getElementById('readystate').innerHTML = stateName;
    }
  }
});

SkywayDemo.on('channelOpen', function() {
  document.getElementById('channel').innerHTML = 'open';
});

SkywayDemo.on('channelMessage', function() {
  document.getElementById('channel').innerHTML = 'message';
});

SkywayDemo.on('channelClose', function() {
  document.getElementById('channel').innerHTML = 'close';
});

SkywayDemo.on('channelError', function() {
  document.getElementById('channel').innerHTML = 'error';
});


SkywayDemo.on('handshakeProgress', function(step, peerId) {
  document.getElementById(peerId + '_hsp').innerHTML = step;
});

SkywayDemo.on('peerConnectionState', function(state, peerId) {
  document.getElementById(peerId + '_pcs').innerHTML = state;
});

SkywayDemo.on('candidateGenerationState', function(state, peerId) {
  document.getElementById(peerId + '_cgs').innerHTML = state;
});

SkywayDemo.on('dataChannelState', function(state, peerId) {
  document.getElementById(peerId + '_dcs').innerHTML = state;
});

SkywayDemo.joinRoom();

function addPeer (peerId, isSelf) {
  var peers = document.getElementById('peers');
  var peerItem = document.createElement('tr');
  peerItem.id = peerId;
  peerItem.style.textTransform = 'uppercase';
  peerItem.innerHTML = 
    '<td style="border:solid 1px #444;padding: 12px 15px;text-transform:none;">' + ((isSelf) ? 'You' : peerId) + '</td>' +
    '<td id="' + peerId + '_hsp" style="border:solid 1px #444;padding: 12px 15px;"></td>' + 
    '<td id="' + peerId + '_pcs" style="border:solid 1px #444;padding: 12px 15px;"></td>' +
    '<td id="' + peerId + '_cgs" style="border:solid 1px #444;padding: 12px 15px;"></td>' +
    '<td id="' + peerId + '_dcs" style="border:solid 1px #444;padding: 12px 15px;"></td>';
  peers.appendChild(peerItem);
}