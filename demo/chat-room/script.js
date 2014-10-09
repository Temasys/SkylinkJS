SkywayDemo.on('peerJoined', function(peerId, peerInfo, isSelf) {
  var user = 'You';
  if(!isSelf) {
    user = peerInfo ? peerInfo.userData || peerId : peerId;
  }
  addMessage(user + ' joined the room', 'action');
});

SkywayDemo.on('peerUpdated', function(peerId, peerInfo, isSelf) {
  if(isSelf) {
    var user = peerInfo ? peerInfo.userData || peerId : peerId;
    addMessage('You\'re now known as ' + user, 'action');
  }
});

SkywayDemo.on('peerLeft', function(peerId, peerInfo, isSelf) {
  var user = 'You';
  if(!isSelf) {
    var peerInfo = SkywayDemo.getPeerInfo(peerId);
    console.info(peerInfo);
    user = peerInfo ? peerInfo.userData || peerId : peerId;
  }
  addMessage(user + ' left the room', 'action');
});

SkywayDemo.on('incomingMessage', function(message, peerId, peerInfo, isSelf) {
  var user = 'You';
  if(!isSelf) {
    var peerInfo = SkywayDemo.getPeerInfo(peerId);
    user = peerInfo ? peerInfo.userData || peerId : peerId;
  }
  addMessage(user + ': ' + message.content, isSelf ? 'you' : 'message');
});

SkywayDemo.setUserData('test' + Math.random());

function setRoom() {
  var input = document.getElementById('room');
  SkywayDemo.joinRoom(input.value);
}
function setName() {
  var input = document.getElementById('name');
  SkywayDemo.setUserData(input.value);
}

function sendMessage() {
  var input = document.getElementById('message');
  SkywayDemo.sendMessage(input.value);
  input.value = '';
}

function addMessage(message, className) {
  var chatbox = document.getElementById('chatbox'),
  div = document.createElement('div');
  div.className = className;
  div.innerHTML = message;
  chatbox.appendChild(div);
}