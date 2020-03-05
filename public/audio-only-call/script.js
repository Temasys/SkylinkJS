/* eslint-disable import/extensions */
import Skylink, { SkylinkEventManager, SkylinkConstants } from '../../dist/skylink.esm.js';
import config from '../config.js';

const { document, attachMediaStream } = window;
const joinRoomOptions = {
  audio: true,
  video: false,
};

const SkylinkDemo = new Skylink(config);

const createPeerName = (isSelf, peerId) => {
  const peerName = document.createElement('span');
  peerName.innerHTML = peerId;
  peerName.className = 'peer-name';
  return peerName;
};

const createVideoEl = (isSelf, stream) => {
  const videoEl = document.createElement('video');
  videoEl.autoplay = true;
  videoEl.controls = true;
  videoEl.muted = isSelf;
  videoEl.poster = '../assets/img/user.png';
  videoEl.setAttribute('playsinline', true);
  videoEl.className = 'peer-video';
  attachMediaStream(videoEl, stream);

  setTimeout(() => {
    videoEl.removeAttribute('controls');
  });

  return videoEl;
};

const createPeerEl = (isSelf, peerId, stream) => {
  const peerEl = document.createElement('div');
  const videoEl = createVideoEl(isSelf, stream);
  const peerName = createPeerName(isSelf, peerId);
  peerEl.appendChild(videoEl);
  peerEl.appendChild(peerName);

  return peerEl;
};

const createPeerContainer = (isSelf, peerId) => {
  const peerContainer = document.createElement('div');
  peerContainer.id = peerId;
  if (isSelf) {
    peerContainer.className = 'avatar local-avatar';
  } else {
    peerContainer.className = 'avatar remote-avatar';
  }
  return peerContainer;
};

const showPeer = (stream, peerId, isSelf) => {
  const peersContainer = document.getElementById('js-peers-container');
  const peerContainer = createPeerContainer(isSelf, peerId);
  const peerEl = createPeerEl(isSelf, peerId, stream);

  peerContainer.appendChild(peerEl);
  peersContainer.appendChild(peerContainer);
};

SkylinkDemo.joinRoom(joinRoomOptions).then((stream) => {
  showPeer(stream, 'Me', true);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.INCOMING_STREAM, (event) => {
  const { stream, peerId, isSelf } = event.detail;

  if (!isSelf) {
    showPeer(stream, peerId, isSelf);
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_LEFT, (event) => {
  const { peerId } = event.detail;
  const peerEl = document.getElementById(peerId);

  if (peerEl) {
    (peerEl).remove();
  } else {
    console.error(`Peer audio element for ${peerId} does not exist.`);
  }
});
