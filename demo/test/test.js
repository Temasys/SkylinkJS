var skyway = new Skyway();

skyway.on('peerJoined', function(peerId, peerInfo, isSelf) {
  var user = 'You';
  if(!isSelf) {
    user = peerInfo ? peerInfo.userData || peerId : peerId;
  }
  addMessage(user + ' joined the room', 'action');
});

skyway.on('peerUpdated', function(peerId, peerInfo, isSelf) {
  if(isSelf) {
    var user = peerInfo ? peerInfo.userData || peerId : peerId;
    addMessage('You\'re now known as ' + user, 'action');
  }
});

skyway.on('peerLeft', function(peerId) {
  var user = 'You';
  if(!isSelf) {
    var peerInfo = skyway.getPeerInfo(peerId);
    console.info(peerInfo);
    user = peerInfo ? peerInfo.userData || peerId : peerId;
  }
  addMessage(user + ' left the room', 'action');
});

skyway.on('incomingMessage', function(message, peerId, peerInfo, isSelf) {
  var user = 'You';
  if(!isSelf) {
    var peerInfo = skyway.getPeerInfo(peerId);
    user = peerInfo ? peerInfo.userData || peerId : peerId;
  }
  addMessage(user + ': ' + message.content, isSelf ? 'you' : 'message');
});

skyway.init('5f874168-0079-46fc-ab9d-13931c2baa39'); // Get your own key at developer.temasys.com.sg
skyway.setUserData('test' + Math.random());
skyway.joinRoom();


function setName() {
  var input = document.getElementById('name');
  skyway.setUserData(input.value);
}

function sendMessage() {
  var input = document.getElementById('message');
  skyway.sendMessage(input.value);
  input.value = '';
}

function addMessage(message, className) {
  var chatbox = document.getElementById('chatbox'),
    div = document.createElement('div');
  div.className = className;
  div.innerHTML = message;
  chatbox.appendChild(div);
}