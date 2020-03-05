import Skylink, { SkylinkEventManager, SkylinkConstants } from '../../dist/skylink.esm.js';
import config from '../config.js';

const { document } = window;
const skylinkDemo = new Skylink(config)
const joinRoomOptions = {
  userData: `User_${Math.floor((Math.random() * 1000) + 1)}`,
  audio: false,
  video: false,
};

const addMessage = (message, className) => {
  const chatbox = document.getElementById('chatbox');
  const container = document.createElement('div');
  container.className = className;
  container.innerHTML = message;
  chatbox.appendChild(container);
};

const sendMessage = () => {
  const target = document.getElementById('target').value;
  const type = document.getElementById('type').value;
  const input = document.getElementById('message');
  if (type === 'p2p') {
    skylinkDemo.sendP2PMessage(input.value, (target === 'group') ? null : target, config.defaultRoom);
  } else {
    skylinkDemo.sendMessage(config.defaultRoom, input.value, (target === 'group') ? null : target);
  }
  input.value = '';
};

skylinkDemo.joinRoom(joinRoomOptions);

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, (evt) => {
  const { peerId, peerInfo, isSelf } = evt.detail;
  let user = 'You';
  if (!isSelf) {
    user = peerInfo ? peerInfo.userData || peerId : peerId;
    const targetItem = document.createElement('option');
    targetItem.id = `${peerId}_target`;
    targetItem.value = peerId;
    targetItem.innerHTML = `Send message to '${peerInfo.userData} only`;
    document.getElementById('target').appendChild(targetItem);
  }
  addMessage(`${user} joined the room`, 'action');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_LEFT, (evt) => {
  const { peerId, peerInfo, isSelf } = evt.detail;
  let user = 'You';
  if (!isSelf) {
    user = peerInfo ? peerInfo.userData || peerId : peerId;
    document.getElementById('target').removeChild(document.getElementById(`${peerId}_target`));
  }
  addMessage(`${user} left the room`, 'action');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ON_INCOMING_MESSAGE, (evt) => {
  const {
    message,
    peerId,
    peerInfo,
    isSelf
  } = evt.detail;
  let user = 'You';
  let messageItem = (message.isDataChannel) ? '[P2P]' : '[Socket]';
  messageItem += (message.isPrivate) ? '<i>(Private)</i>: ' : ': ';
  messageItem += message.content;
  if (!isSelf) {
    user = peerInfo ? peerInfo.userData || peerId : peerId;
  }
  addMessage(`${user}: ${messageItem}`, isSelf ? 'you' : 'message');
});

document.getElementById('sendMessageButton').onclick = (evt) => {
  sendMessage();
}
