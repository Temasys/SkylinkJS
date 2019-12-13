/* eslint-disable import/extensions,no-param-reassign */
import Skylink, { SkylinkEventManager, SkylinkConstants } from '../../dist/skylink.esm.js';
import config from '../config.js';

const { document } = window;
const SkylinkDemo = new Skylink(config);

let roomName = config.defaultRoom;
const joinRoomOptions = {
  userData: `User_${Math.floor((Math.random() * 1000) + 1)}`,
  audio: false,
  video: false,
};
let peerList = null;
const userList = document.getElementById('UserList');
const messageList = document.getElementById('MessageList');

const updateRoomName = (newRoom) => {
  roomName = newRoom;
};

const getUserInfo = () => SkylinkDemo.getCurrentSessionInfo(roomName);

const setName = (newName) => {
  if (newName !== undefined) {
    newName = newName.trim(); // Handle empty user name
    if (newName !== '') {
      const userInfo = getUserInfo();
      console.log(`Change User Name to ${newName}`);
      SkylinkDemo.setUserData(userInfo.room, newName);
    }
  }
};

const setRoom = (newRoom) => {
  if (newRoom !== undefined) {
    newRoom = newRoom.trim(); // Handle joining room with empty name
    if (newRoom !== '') {
      const userInfo = getUserInfo();

      console.log(`Left Room ${roomName}`);
      SkylinkDemo.leaveRoom(roomName);

      updateRoomName(newRoom);

      SkylinkDemo.joinRoom({ roomName, userData: userInfo.userData })
        .then(() => {
          console.log(`Change Room To ${newRoom}`);
          userList.innerHTML = '';

          const div = document.createElement('div');
          div.className = 'alert alert-info msg-date';
          div.innerHTML = `<strong>Join Room: "${roomName}"</strong>`;
          messageList.appendChild(div);
        }).catch((error) => {
          console.log(error);
        });
    }
  }
};

const sendMessage = (message) => {
  peerList = SkylinkDemo.getPeersInRoom(roomName);
  const peerIds = Object.keys(peerList);
  if (message !== undefined) {
    message = message.trim(); // Protection for empty message
    if (message !== '') {
      peerIds.forEach((peerId) => {
        if (!peerList[peerId].isSelf) {
          SkylinkDemo.sendP2PMessage(message, peerId, roomName);
        }
      });
    }
  }
};

const getTextAndSend = (userInputMessage) => {
  sendMessage(userInputMessage.value);
  userInputMessage.value = '';
};

const addMessage = (user, message) => {
  const timestamp = new Date();
  const div = document.createElement('div');
  div.className = 'media msg';
  div.innerHTML = `${'<div class="media-body">'
    + '<small class="pull-right time">'
    + '<i class="fa fa-clock-o"></i>'}${timestamp.getHours()}:${timestamp.getMinutes()}</small>`
    + `<h5 class="media-heading">${user}</h5>`
    + `<small class="col-lg-10">${message}</small>`
    + '</div>';
  messageList.appendChild(div);
  messageList.scrollTop = messageList.scrollHeight;
};

// Event liseners

// New User in the room, we add it to the user list
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, (event) => {
  const { isSelf, peerId, peerInfo } = event.detail;

  console.log('Peer Joined');

  const div = document.createElement('div');
  div.className = 'media conversation';
  div.id = `User_${peerId}`;
  div.innerHTML = `${'<div class="media-body">'
    + '<h5 id="UserTitle_'}${peerId}" class="media-heading">${peerInfo.userData}${(isSelf) ? ' (You)' : ''}</h5>`
    + `<small>${peerId}</small>`
    + '</div>';
  userList.appendChild(div);
});

// User in the room changed his name
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_UPDATED, (event) => {
  const { isSelf, peerId, peerInfo } = event.detail;
  document.getElementById(`UserTitle_${peerId}`).innerHTML = peerInfo.userData + ((isSelf) ? ' (You)' : '');
});

// User in the room left
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_LEFT, (event) => {
  const { peerId } = event.detail;
  const elm = document.getElementById(`User_${peerId}`);
  if (elm) {
    elm.remove();
  } else {
    console.error(`Peer "${peerId}" DOM element does not exists`);
  }
});

// User in the room (including us) sent a message
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ON_INCOMING_MESSAGE, (event) => {
  const { peerInfo, isSelf, message } = event.detail;
  const Name = peerInfo.userData + ((isSelf) ? ' (You)' : '');
  addMessage(Name, message.content);
});


// Input listeners
const initInputListeners = () => {
  const userInputName = document.getElementById('UserNameInput');
  const userInputRoom = document.getElementById('RoomNameInput');
  const userInputMessage = document.getElementById('MessageInput');
  const userInputMessageButton = document.getElementById('MessageInputButton');

  userInputName.addEventListener('keypress', (event) => {
    if (event.keyCode === 13) {
      setName(userInputName.value);
      userInputName.value = '';
    }
  });

  userInputRoom.addEventListener('keypress', (event) => {
    if (event.keyCode === 13) {
      setRoom(userInputRoom.value);
      userInputRoom.value = '';
    }
  });

  userInputMessage.addEventListener('keypress', (event) => {
    if (event.keyCode === 13) getTextAndSend(userInputMessage);
  });

  userInputMessageButton.addEventListener('click', (event) => {
    getTextAndSend(userInputMessage);
  });
};

initInputListeners();
SkylinkDemo.joinRoom(joinRoomOptions)
  .then(() => {
    const userInfo = getUserInfo();
    const div = document.createElement('div');

    div.className = 'alert alert-info msg-date';
    div.innerHTML = `<strong>Join Room: ${userInfo.room}</strong>`;

    messageList.appendChild(div);
  })
  .catch((error) => {
    console.error(error);
    for (const errorCode in SkylinkDemo.READY_STATE_CHANGE_ERROR) {
      if (SkylinkDemo.READY_STATE_CHANGE_ERROR[errorCode] === error.errorCode) {
        const div = document.createElement('div');
        div.className = 'alert alert-danger msg-date';
        div.innerHTML = `<strong>Impossible to connect to Skylink: ${errorCode}</strong>`;
        messageList.appendChild(div);
        break;
      }
    }
  });
