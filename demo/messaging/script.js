var SkylinkDemo = new Skylink();

SkylinkDemo.on('peerJoined', function(peerId, peerInfo, isSelf) {
  var user = 'You';
  if(!isSelf) {
    user = peerInfo ? peerInfo.userData || peerId : peerId;
    var targetItem = document.createElement('option');
    targetItem.id = peerId + '_target';
    targetItem.value = peerId;
    targetItem.innerHTML = 'Send message to ' + peerInfo.userData + ' only';
    document.getElementById('target').appendChild(targetItem);
  }
  addMessage(user + ' joined the room', 'action');
});

SkylinkDemo.on('peerLeft', function(peerId, peerInfo, isSelf) {
  var user = 'You';
  if(!isSelf) {
    var peerInfo = SkylinkDemo.getPeerInfo(peerId);
    console.info(peerInfo);
    user = peerInfo ? peerInfo.userData || peerId : peerId;
    document.getElementById('target').removeChild(
    document.getElementById(peerId + '_target'));
  }
  addMessage(user + ' left the room', 'action');
});

SkylinkDemo.on('incomingMessage', function(message, peerId, peerInfo, isSelf) {
  var user = 'You';
  var messageItem = (message.isDataChannel) ? '[P2P]' : '[Socket]';
  messageItem += (message.isPrivate) ? '<i>(Private)</i>: ' : ': ';
  messageItem += message.content;
  if(!isSelf) {
    var peerInfo = SkylinkDemo.getPeerInfo(peerId);
    user = peerInfo ? peerInfo.userData || peerId : peerId;
  }
  addMessage(user + ': ' + messageItem, isSelf ? 'you' : 'message');
});

SkylinkDemo.init(config, function (error, success) {
  if (success) {
    SkylinkDemo.setUserData('test' + Math.random());
    SkylinkDemo.joinRoom();
  }
});

function setRoom() {
  var input = document.getElementById('room');
  SkylinkDemo.joinRoom(input.value);
}
function setName() {
  var input = document.getElementById('name');
  SkylinkDemo.setUserData(input.value);
}

function sendMessage() {
  var target = document.getElementById('target').value;
  var type = document.getElementById('type').value;
  var input = document.getElementById('message');
  if (type === 'p2p') {
    SkylinkDemo.sendP2PMessage(input.value, (target === 'group') ? null : target);
  } else {
    SkylinkDemo.sendMessage(input.value, (target === 'group') ? null : target);
  }
  input.value = '';
}

function addMessage(message, className) {
  var chatbox = document.getElementById('chatbox'),
  div = document.createElement('div');
  div.className = className;
  div.innerHTML = message;
  chatbox.appendChild(div);
}
