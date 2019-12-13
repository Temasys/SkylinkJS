/* eslint-disable import/extensions,no-param-reassign */
import Skylink, { SkylinkEventManager, SkylinkConstants } from '../../dist/skylink.esm.js';
import config from '../config.js';

const { document } = window;

let roomName = '';
let self = null;
let peer = null;
const name = null;
const SkylinkDemo = new Skylink(config);

const enter = () => {
  // Join own room. Audio/video disabled by default
  SkylinkDemo.joinRoom({
    roomName: typeof self === 'string' ? self : self.value,
    audio: false,
    video: false,
  });
};

const call = () => {
  // Join peer's room & attach own stream
  SkylinkDemo.joinRoom({
    roomName: typeof peer === 'string' ? peer : peer.value,
    audio: false,
    video: true,
  }).then((stream) => {
    if (!document.getElementById('myvideo')) {
      const myvid = document.createElement('video');
      myvid.id = 'myvideo';
      myvid.autoplay = true;
      myvid.muted = true;
      myvid.controls = true;
      myvid.setAttribute('playsinline', true);
      document.body.appendChild(myvid);

      setTimeout(() => {
        myvid.removeAttribute('controls');
      });
    }
    const myvid = document.getElementById('myvideo');
    window.attachMediaStream(myvid, stream);
  });
};

const stop = () => {
  SkylinkDemo.sendMessage(roomName, 'stop');

  // Leave current room
  SkylinkDemo.leaveRoom(roomName);
};

const clean = () => {
  const status = document.getElementById('status');
  while (status.hasChildNodes()) {
    status.removeChild(status.firstChild);
  }
};


const initBtns = () => {
  document.getElementById('btn_enter').addEventListener('click', (event) => {
    console.log('Entered');
    enter();
  });

  document.getElementById('btn_call').addEventListener('click', (event) => {
    console.log('Called');
    call();
  });

  document.getElementById('btn_stop').addEventListener('click', (event) => {
    console.log('Stopped');
    stop();
  });

  document.getElementById('btn_clean').addEventListener('click', (event) => {
    console.log('Cleaned');
    clean();
  });
};

window.onload = () => {
  self = document.getElementById('self') || '';
  peer = document.getElementById('peer') || '';
  initBtns();
};

const messages = {
  JOINED_NOT_CALLING: 'User _peer joined room _roomName',
  RECEIVING_CALL: 'Ringing. _peer is calling',
  IN_CALL: 'In call with _peer',
  MAKING_CALL: 'Calling _peer',
  UPDATE_NAME: 'You are now identified as _name',
  PEER_LEFT: '_peer left the room _roomName',
  JOINING_ROOM: 'Joining room _roomName',
};

const addMessage = (message, isSelf) => {
  console.log('Added message');

  const mapObj = {
    _peer: isSelf ? self : peer,
    _roomName: roomName,
    _name: name,
  };

  message = message.replace(/_peer|_roomName|_name/gi, matched => mapObj[matched]);

  const status = document.getElementById('status');
  const div = document.createElement('div');
  div.innerHTML = message;
  status.appendChild(div);
};

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, (event) => {
  const { peerId, isSelf, room } = event.detail;

  if (isSelf) {
    // eslint-disable-next-line prefer-destructuring
    roomName = room.roomName;
    self = peerId;
  } else {
    peer = peerId;
  }

  addMessage(messages.JOINED_NOT_CALLING, isSelf);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_LEFT, (event) => {
  const { peerId, isSelf } = event.detail;
  addMessage(`Peer left: ${peerId}`);

  const videoEl = document.getElementsByTagName('video')[0];
  document.body.removeChild(videoEl);

  if (!isSelf) {
    // return to own room
    enter();
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.INCOMING_STREAM, (event) => {
  const { isSelf, peerId, stream } = event.detail;
  // Already attached on mediaAccessSuccess
  if (isSelf) {
    return;
  }

  if (!document.getElementById(peerId)) {
    const peervid = document.createElement('video');
    peervid.id = peerId;
    peervid.autoplay = true;
    peervid.muted = isSelf;
    peervid.controls = true;
    peervid.setAttribute('playsinline', true);
    document.body.appendChild(peervid);

    setTimeout(() => {
      peervid.removeAttribute('controls');
    });
  }

  const peervid = document.getElementById(peerId);
  window.attachMediaStream(peervid, stream);
});
