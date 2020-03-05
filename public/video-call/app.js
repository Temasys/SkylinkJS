/* eslint-disable */
import Skylink, { SkylinkEventManager, SkylinkConstants } from '../../dist/skylink.esm.js';
import config from '../config.js';

window.document.getElementById('myVideo').removeAttribute('controls');
/* eslint-disable import/extensions */

const { document, attachMediaStream } = window;
const SkylinkDemo = new Skylink(config);
const joinRoomOptions = {
  roomName: 'test-demo',
  audio: true,
  video: true,
};

const createDOMRemoteVideoContainer = (peerId) => {
  const DOMRemoteVideoContainer = document.createElement('div');
  DOMRemoteVideoContainer.setAttribute('id', peerId);
  DOMRemoteVideoContainer.className = 'avatar remote-avatar';

  return DOMRemoteVideoContainer;
};

const createDOMRemoteVideo = (peerId) => {
  const DOMRemoteVideo = document.createElement('video');
  DOMRemoteVideo.autoplay = true;
  DOMRemoteVideo.controls = true;
  DOMRemoteVideo.muted = true;
  DOMRemoteVideo.poster = '../assets/img/user.png';
  DOMRemoteVideo.setAttribute('playsinline', true);
  DOMRemoteVideo.setAttribute('id', `remote_${peerId}`);
  DOMRemoteVideo.className = 'peer-video';

  return DOMRemoteVideo;
};

// How to attach self stream to video element:
// 1. return stream object from joinRoom()
// 2. MediaStream object from onIncomingStream payload with isSelf === true
// 3. MediaStream object from mediaAccessSuccess payload

// How to attach remote peer stream to video element:
// 1. MediaStream object from onIncomingStream payload with isSelf === false

SkylinkDemo.joinRoom(joinRoomOptions).then((stream) => {
  attachMediaStream(window.document.getElementById('myVideo'), stream);
});

SkylinkEventManager.addEventListener('onIncomingStream', (event) => {
  const {
    isSelf, peerId, room, stream,
  } = event.detail;

  if (!isSelf) {
    const DOMcontainer = document.getElementById('js-peers-container');
    let DOMRemoteVideoContainer = document.getElementById(peerId);
    let DOMRemoteVideo = null;

    if (!DOMRemoteVideoContainer) {
      DOMRemoteVideoContainer = createDOMRemoteVideoContainer(peerId);
      DOMRemoteVideo = createDOMRemoteVideo(peerId);

      DOMRemoteVideoContainer.appendChild(DOMRemoteVideo);
      DOMcontainer.appendChild(DOMRemoteVideoContainer);

      DOMRemoteVideo.onclick = () => {
        SkylinkDemo.refreshConnection(room.roomName, peerId);
      };

      setTimeout(() => {
        DOMRemoteVideo.removeAttribute('controls');
      });
    } else {
      DOMRemoteVideo = document.getElementById(`remote_${peerId}`);
    }

    attachMediaStream(DOMRemoteVideo, stream);
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.MEDIA_ACCESS_SUCCESS, (event) => {
  // FIXME: implement mediaAccessSuccess in processStreamInState
  console.log('mediaAccessSuccess', event.detail);
});


// How to handle when remote peer session ends:
// 1. listen on streamEnded event
// 2. listen on peerLeft event

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.STREAM_ENDED, (event) => {
  console.log('streamEnded event', event.detail);
  const {
    isSelf, peerId,
  } = event.detail;

  if (!isSelf) {
    const DOMRemoteVideoContainer = document.getElementById(peerId);

    if (DOMRemoteVideoContainer) {
      const DOMcontainer = document.getElementById('js-peers-container');
      DOMcontainer.removeChild(DOMRemoteVideoContainer);
    }
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_LEFT, (event) => {
  console.log('peerLeft event', event.detail);
  const {
    isSelf, peerId,
  } = event.detail;

  if (!isSelf) {
    const DOMRemoteVideoContainer = document.getElementById(peerId);
    if (DOMRemoteVideoContainer) {
      const DOMcontainer = document.getElementById('js-peers-container');
      DOMcontainer.removeChild(DOMRemoteVideoContainer);
    }
  }
});

setTimeout(() => {
  document.getElementById('myVideo').removeAttribute('controls');
});
