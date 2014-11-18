(function()
{
  SkylinkDemo.init(
  {
    apiKey: Config.apiKey,
    defaultRoom: Config.defaultRoom
  });
})();

SkylinkDemo.on('peerJoined', function(peerId, peerInfo, isSelf)
{
  addPeer(peerId, isSelf);
});

SkylinkDemo.on('peerLeft', function(peerId, peerInfo, isSelf)
{
  var peers = document.getElementById('peers');
  peers.removeChild(document.getElementById(peerId));
});

SkylinkDemo.on('readyStateChange', function(state)
{
  for (var stateName in SkylinkDemo.READY_STATE_CHANGE)
  {
    if (SkylinkDemo.READY_STATE_CHANGE[stateName] === state)
    {
      document.getElementById('readystate').innerHTML = stateName;
    }
  }
  if(state === SkylinkDemo.READY_STATE_CHANGE.COMPLETED)
  {//Skylink has been initialized we can join the default room
    var displayName = 'User_' + Math.floor((Math.random() * 1000) + 1);
    SkylinkDemo.joinRoom({
      userData: displayName,
      audio: false,
      video: false
    });
  }
});

SkylinkDemo.on('channelOpen', function() {
  document.getElementById('channel').innerHTML = 'open';
});

SkylinkDemo.on('channelMessage', function() {
  document.getElementById('channel').innerHTML = 'message';
});

SkylinkDemo.on('channelClose', function() {
  document.getElementById('channel').innerHTML = 'close';
});

SkylinkDemo.on('channelError', function() {
  document.getElementById('channel').innerHTML = 'error';
});


SkylinkDemo.on('handshakeProgress', function(step, peerId) {
  document.getElementById(peerId + '_hsp').innerHTML = step;
});

SkylinkDemo.on('peerConnectionState', function(state, peerId) {
  document.getElementById(peerId + '_pcs').innerHTML = state;
});

SkylinkDemo.on('candidateGenerationState', function(state, peerId) {
  document.getElementById(peerId + '_cgs').innerHTML = state;
});

SkylinkDemo.on('dataChannelState', function(state, peerId) {
  document.getElementById(peerId + '_dcs').innerHTML = state;
});

function addPeer (peerId, isSelf)
{
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
