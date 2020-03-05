/* eslint-disable import/extensions,prefer-destructuring */
import Skylink, { SkylinkEventManager, SkylinkConstants } from '../../dist/skylink.esm.js';
import config from '../config.js';

const { document } = window;

const SkylinkDemo = new Skylink(config);
const roomName = config.defaultRoom;
let audioMuted = false;
let videoMuted = false;

const toggleAudio = () => {
  const toggleAudioBtn = document.getElementById('toggleAudioBtn');

  setTimeout(() => {
    if (audioMuted) {
      SkylinkDemo.muteStream(roomName, {
        audioMuted: false,
        videoMuted: SkylinkDemo.getPeerInfo(roomName).mediaStatus.videoMuted,
      });
      toggleAudioBtn.innerHTML = 'Disable Audio';
    } else {
      SkylinkDemo.muteStream(roomName, {
        audioMuted: true,
        videoMuted: SkylinkDemo.getPeerInfo(roomName).mediaStatus.videoMuted,
      });
      toggleAudioBtn.innerHTML = 'Enable Audio';
    }
  }, 1000);
};

const toggleVideo = () => {
  const toggleVideoBtn = document.getElementById('toggleVideoBtn');
  setTimeout(() => {
    if (videoMuted) {
      SkylinkDemo.muteStream(roomName, {
        videoMuted: false,
        audioMuted: SkylinkDemo.getPeerInfo(roomName).mediaStatus.audioMuted,
      });
      toggleVideoBtn.innerHTML = 'Disable Video';
    } else {
      SkylinkDemo.muteStream(roomName, {
        videoMuted: true,
        audioMuted: SkylinkDemo.getPeerInfo(roomName).mediaStatus.audioMuted,
      });
      toggleVideoBtn.innerHTML = 'Enable Video';
    }
  }, 1000);
};

const showAudioAndVideoToggles = (peerInfo) => {
  const toggleAudioBtn = document.getElementById('toggleAudioBtn');
  toggleAudioBtn.addEventListener('click', (event) => {
    toggleAudio();
  });

  const toggleVideoBtn = document.getElementById('toggleVideoBtn');
  toggleVideoBtn.addEventListener('click', (event) => {
    toggleVideo();
  });

  if (peerInfo.settings.audio) {
    toggleAudioBtn.style.display = 'inline';
  }

  if (peerInfo.settings.video) {
    toggleVideoBtn.style.display = 'inline';
  }

  audioMuted = peerInfo.mediaStatus.audioMuted;
  videoMuted = peerInfo.mediaStatus.videoMuted;

  toggleAudioBtn.innerHTML = (peerInfo.mediaStatus.audioMuted) ? 'Enable Audio' : 'Disable Audio';
  toggleVideoBtn.innerHTML = (peerInfo.mediaStatus.videoMuted) ? 'Enable Video' : 'Disable Video';
};

const showPeerVideo = (peerId, isSelf, peerInfo) => {
  const peer = document.createElement('div');
  peer.id = peerId;

  const peerStatus = document.createElement('p');
  peerStatus.style.fontFamily = 'sans-serif';
  peerStatus.style.position = 'absolute';
  peerStatus.style.background = 'rgba(0,0,0,0.5)';
  peerStatus.style.color = '#fff';
  peerStatus.innerHTML = `<span id="${peerId}_audioStatus">${
    (peerInfo.mediaStatus.audioMuted) ? 'Audio Disabled' : 'Audio Enabled'
  }</span><br><span id="${peerId}_videoStatus">${
    (peerInfo.mediaStatus.videoMuted) ? 'Video Disabled' : 'Video Enabled'}</span>`;

  const peerVideo = document.createElement('video');
  peerVideo.id = `${peerId}_stream`;
  peerVideo.autoplay = true;
  peerVideo.muted = isSelf;
  peerVideo.controls = true;
  peerVideo.setAttribute('playsinline', true);

  document.body.appendChild(peer);

  peer.appendChild(peerStatus);
  peer.appendChild(peerVideo);

  setTimeout(() => {
    peerVideo.removeAttribute('controls');
  });
};

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, (event) => {
  const { peerId, peerInfo, isSelf } = event.detail;
  console.info('"peerJoined" event ->', [peerId, peerInfo, isSelf]);

  if (isSelf) {
    showAudioAndVideoToggles(peerInfo);
  }

  showPeerVideo(peerId, isSelf, peerInfo);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.INCOMING_STREAM, ((event) => {
  const {
    stream, peerId, isSelf, peerInfo,
  } = event.detail;
  console.info('"incomingStream" event ->', [peerId, stream, isSelf, peerInfo]);

  const videoEl = document.getElementById(`${peerId}_stream`);
  window.attachMediaStream(videoEl, stream);
}));

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_UPDATED, (event) => {
  const { peerId, peerInfo, isSelf } = event.detail;
  console.info('"peerUpdated" event ->', [peerId, peerInfo, isSelf]);

  if (isSelf) {
    audioMuted = peerInfo.mediaStatus.audioMuted;
    videoMuted = peerInfo.mediaStatus.videoMuted;
  }
  const audioStatus = document.getElementById(`${peerId}_audioStatus`);
  audioStatus.innerHTML = ((peerInfo.mediaStatus.audioMuted) ? 'Audio Disabled' : 'Audio Enabled');
  const videoStatus = document.getElementById(`${peerId}_videoStatus`);
  videoStatus.innerHTML = ((peerInfo.mediaStatus.videoMuted) ? 'Video Disabled' : 'Video Enabled');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_RESTART, (event) => {
  const { peerId, peerInfo, isSelf } = event.detail;
  console.info('"peerRestart" event ->', [peerId, peerInfo, isSelf]);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.STREAM_ENDED, (event) => {
  const {
    peerId, peerInfo, isSelf, isScreensharing,
  } = event.detail;
  console.info('"streamEnded" event ->', [peerId, peerInfo, isSelf, isScreensharing]);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.MEDIA_ACCESS_STOPPED, (event) => {
  const { isScreensharing } = event.detail;
  console.info('"mediaAccessStopped" event ->', [isScreensharing]);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_LEFT, (event) => {
  const { peerId, peerInfo, isSelf } = event.detail;
  console.info('"peerLeft" event ->', [peerId, peerInfo, isSelf]);
  document.body.removeChild(document.getElementById(peerId));
});

document.getElementById('joinRoomBtn').addEventListener('click', (event) => {
  const settings = {
    av: { audio: true, video: true },
    v: { audio: false, video: true },
    a: { audio: true, video: false },
    o: { audio: false, video: false },
  };
  document.getElementById('toggleAudioBtn').style.display = 'none';
  document.getElementById('toggleVideoBtn').style.display = 'none';
  SkylinkDemo.joinRoom(settings[document.getElementById('settings').value])
    .then((stream) => {
      // do something with userMedia stream
    });
});
