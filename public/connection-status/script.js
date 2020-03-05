/* eslint-disable import/extensions,no-param-reassign */
import Skylink, { SkylinkEventManager, SkylinkConstants } from '../../dist/skylink.esm.js';
import config from '../config.js';

const { document } = window;

const addPeer = (peerId, isSelf) => {
  /* eslint-disable */
  const peers = document.getElementById('peers');
  const peerItem = document.createElement('tr');
  peerItem.id = peerId;
  peerItem.style.textTransform = 'uppercase';
  peerItem.innerHTML =
    '<td>' + ((isSelf) ? 'You' : peerId) + '</td>' +
    '<td id="' + peerId + '_hsp"></td>' +
    '<td id="' + peerId + '_pcs"></td>' +
    '<td id="' + peerId + '_cgs"></td>' +
    '<td id="' + peerId + '_dcs"></td>';
  peers.appendChild(peerItem);
};

const removePeer = (peerId) => {
  const peers = document.getElementById('peers');
  const peerDom = document.getElementById(peerId);

  if (peerDom) {
    peerDom.style.opacity = 0.5;
    const elms = peerDom.getElementsByTagName('td');
    elms[0].innerHTML += ' (disconn)';
  } else {
    console.error('Peer "' + peerId + '" DOM does not exists');
  }
};

const printEventState = (state, DOM_ID) => {
  const peerDom = document.getElementById(DOM_ID);
  if (peerDom) {
    peerDom.innerHTML = state;
    peerDom.className = state || "";
  } else {
    console.error(`Peer ${DOM_ID} DOM does not exists`);
  }
};

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, (evt) => {
  const { peerId, isSelf } = evt.detail;
  addPeer(peerId, isSelf);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.SERVER_PEER_JOINED, (evt) => {
  const { peerId } = evt.detail;
  addPeer(peerId, false);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_LEFT, (evt) => {
  const { peerId } = evt.detail;
  removePeer(peerId);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.SERVER_PEER_LEFT, (evt) => {
  const { peerId } = evt.detail;
  removePeer(peerId);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.READY_STATE_CHANGE, (evt) => {
  const { readyState } = evt.detail;
  /* eslint-disable no-restricted-syntax */
  for (const stateName in SkylinkConstants.READY_STATE_CHANGE) {
    if (SkylinkConstants.READY_STATE_CHANGE[stateName] === readyState) {
      document.getElementById('readystate').innerHTML = stateName;
    }
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_OPEN, () => {
  document.getElementById('channel').innerHTML = 'open';
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_CLOSE, () => {
  document.getElementById('channel').innerHTML = 'close';
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_MESSAGE, () => {
  document.getElementById('channel').innerHTML = 'message';
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_ERROR, () => {
  document.getElementById('channel').innerHTML = 'error';
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.HANDSHAKE_PROGRESS, (evt) => {
  const { state, peerId } = evt.detail;
  printEventState(state, `${peerId}_hsp`);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_CONNECTION_STATE, (evt) => {
  const { state, peerId } = evt.detail;
  printEventState(state, `${peerId}_pcs`);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CANDIDATE_GENERATION_STATE, (evt) => {
  const { state, peerId } = evt.detail;
  printEventState(state, `${peerId}_cgs`);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.DATA_CHANNEL_STATE, (evt) => {
  const { state, peerId } = evt.detail;
  printEventState(state, `${peerId}_dcs`);
});

const joinRoomOptions = {
  userData: `User_${Math.floor((Math.random() * 1000) + 1)}`,
  audio: false,
  video: false,
};

const skylink = new Skylink(config);
skylink.joinRoom(joinRoomOptions);
