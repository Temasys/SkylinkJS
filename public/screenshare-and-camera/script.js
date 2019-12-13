/* eslint-disable import/extensions */
import Skylink, { SkylinkEventManager, SkylinkConstants, SkylinkLogger } from '../../dist/skylink.esm.js';
import config from '../config.js';

const { document } = window;

let replaceAll = false;
let isUserMediaReplaced = false;
let userMediaStream = null;
const SkylinkDemo = new Skylink(config);

SkylinkLogger.setLevel(4);

const toggleShareScreenBtns = (state) => {
  document.getElementById('shareScreenBtn').disabled = state;
  document.getElementById('shareScreenReplaceRemoteBtn').disabled = state;
  document.getElementById('shareScreenReplaceAllBtn').disabled = state;
};

const shareScreen = (replace) => {
  SkylinkDemo.shareScreen(config.defaultRoom, replace).then((stream) => {
    // do something with getDisplayMedia stream
    console.log(stream);
  });
};

const initBtns = () => {
  document.getElementById('shareScreenBtn').addEventListener('click', (event) => {
    shareScreen(false);
  });

  document.getElementById('shareScreenReplaceRemoteBtn').addEventListener('click', (event) => {
    isUserMediaReplaced = true;
    shareScreen(true);
  });

  document.getElementById('shareScreenReplaceAllBtn').addEventListener('click', (event) => {
    replaceAll = true;
    shareScreen(true);
  });
};

const createVideoEl = (domSection, peerId, isSelf, isScreensharing) => {
  let peerDom = document.getElementById(`${domSection}_${peerId}`);
  let peerVideo = document.getElementById(`${domSection}_${peerId}video`);

  if (!peerDom) {
    peerDom = document.createElement('div');
    peerDom.id = `${domSection}_${peerId}`;
    peerDom.className = isSelf ? 'you' : '';
    // eslint-disable-next-line no-nested-ternary
    peerDom.innerHTML += `<span>${isSelf ? `You ${isScreensharing ? '(screenshare)' : '(camera)'}`
      : (isScreensharing ? `${peerId} (screenshare)` : `${peerId} (camera)`)}</span>`;

    document.getElementById(domSection).appendChild(peerDom);

    peerVideo = document.createElement('video');
    peerVideo.id = `${domSection}_${peerId}video`;
    peerVideo.autoplay = true;
    peerVideo.muted = isSelf;
    peerVideo.controls = true;
    peerVideo.setAttribute('playsinline', true);

    peerDom.appendChild(peerVideo);

    setTimeout(() => {
      peerVideo.removeAttribute('controls');
    });
  }

  return peerVideo;
};


SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.INCOMING_STREAM, (event) => {
  const {
    stream, peerId, isSelf,
  } = event.detail;

  if (isSelf) {
    document.getElementById('shareScreenBtn').disabled = false;

    userMediaStream = stream;
    const selfCamera = createVideoEl('userMedia', peerId, isSelf, false);
    window.attachMediaStream(selfCamera, stream);
  } else {
    document.getElementById('shareScreenBtn').disabled = false;
    const peerCamera = createVideoEl('userMedia', peerId, isSelf, false);
    window.attachMediaStream(peerCamera, stream);
  }
});

const updateVideoSpan = (isSelf, peerId, isScreensharing) => {
  const span = document.getElementById(`userMedia_${peerId}`).childNodes[0];
  span.innerHTML = `${isSelf ? 'You' : peerId} ${isScreensharing ? '(screenshare)' : '(camera)'}`;
};

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.INCOMING_SCREEN_STREAM, (event) => {
  const {
    stream, peerId, isSelf, isReplace,
  } = event.detail;
  toggleShareScreenBtns(true);

  if (isSelf) {
    if (replaceAll) {
      const selfCamera = document.getElementById(`userMedia_${peerId}video`);
      window.attachMediaStream(selfCamera, stream);
      updateVideoSpan(isSelf, peerId, true);
    } else {
      const selfScreen = createVideoEl('screenshare', peerId, isSelf, true);
      window.attachMediaStream(selfScreen, stream);
    }
  } else if (isReplace) {
    updateVideoSpan(isSelf, peerId, true);
    isUserMediaReplaced = true;
  } else {
    const peerScreen = createVideoEl('screenshare', peerId, isSelf, true);
    window.attachMediaStream(peerScreen, stream);
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_LEFT, (event) => {
  const { peerId } = event.detail;
  const dom = document.getElementById(`userMedia_${peerId}`);
  document.getElementById('userMedia').removeChild(dom);
});

const removeScreenshareEl = (peerId) => {
  const dom = document.getElementById(`screenshare_${peerId}`);

  if (dom) {
    document.getElementById('screenshare').removeChild(dom);
  }
};

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.STREAM_ENDED, (event) => {
  const { peerId, isScreensharing, isSelf } = event.detail;

  if (isScreensharing) {
    toggleShareScreenBtns(false);

    if (isSelf) {
      if (isUserMediaReplaced) {
        removeScreenshareEl(peerId);
        isUserMediaReplaced = false;
      }

      if (replaceAll) {
        const selfCamera = document.getElementById(`userMedia_${peerId}video`);
        window.attachMediaStream(selfCamera, userMediaStream);

        updateVideoSpan(isSelf, peerId, false);
        replaceAll = false;
      }
    } else if (isUserMediaReplaced) {
      updateVideoSpan(isSelf, peerId, false);
      isUserMediaReplaced = false;
    } else {
      removeScreenshareEl(peerId);
    }
  }
});

SkylinkDemo.joinRoom({
  audio: false,
  video: true,
}).then((stream) => {
  // do something with userMedia stream
  toggleShareScreenBtns(false);
  initBtns();
});
