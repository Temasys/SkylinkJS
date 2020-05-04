import Skylink from '../../index';
import * as constants from '../../constants';
import SessionDescription from '../index';

const getCodecsSupport = roomKey => new Promise((resolve, reject) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { beSilentOnParseLogs } = Skylink.getInitOptions();
  const updatedState = state;
  const { AdapterJS, RTCRtpSender, RTCPeerConnection } = window;

  if (state.currentCodecSupport) {
    resolve(state.currentCodecSupport);
  }

  updatedState.currentCodecSupport = { audio: {}, video: {} };

  // Safari 11 REQUIRES a stream first before connection works, hence let's spoof it for now
  if (AdapterJS.webrtcDetectedType === 'AppleWebKit') {
    updatedState.currentCodecSupport.audio = {
      opus: ['48000/2'],
    };
    updatedState.currentCodecSupport.video = {
      h264: ['48000'],
    };
    resolve(updatedState.currentCodecSupport);
  }

  try {
    if (window.webrtcDetectedBrowser === 'edge') {
      const { codecs } = RTCRtpSender.getCapabilities();

      for (let i = 0; i < codecs.length; i += 1) {
        if (['audio', 'video'].indexOf(codecs[i].kind) > -1 && codecs[i].name) {
          const codec = codecs[i].name.toLowerCase();
          updatedState.currentCodecSupport[codecs[i].kind][codec] = codecs[i].clockRate + (codecs[i].numChannels > 1 ? `/${codecs[i].numChannels}` : '');
        }
      }
      // Ignore .fecMechanisms for now
      resolve(updatedState.currentCodecSupport);
    } else {
      const pc = new RTCPeerConnection(null);
      const offerConstraints = AdapterJS.webrtcDetectedType !== 'plugin' ? {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      } : {
        mandatory: {
          OfferToReceiveVideo: true,
          OfferToReceiveAudio: true,
        },
      };

      // Prevent errors and proceed with create offer still...
      try {
        const channel = pc.createDataChannel('test');
        updatedState.binaryChunkType = channel.binaryType || state.binaryChunkType;
        updatedState.binaryChunkType = state.binaryChunkType.toLowerCase().indexOf('array') > -1 ? constants.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER : state.binaryChunkType;
        // Set the value according to the property
        const prop = Object.keys(constants.DATA_TRANSFER_DATA_TYPE);
        for (let i = 0; i < prop.length; i += 1) {
          // eslint-disable-next-line no-prototype-builtins
          if (constants.DATA_TRANSFER_DATA_TYPE.hasOwnProperty(prop)
              && state.binaryChunkType.toLowerCase() === constants.DATA_TRANSFER_DATA_TYPE[prop].toLowerCase()) {
            updatedState.binaryChunkType = constants.DATA_TRANSFER_DATA_TYPE[prop];
            break;
          }
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}

      pc.createOffer(offerConstraints)
        .then((offer) => {
          updatedState.currentCodecSupport = SessionDescription.getSDPCodecsSupport(null, offer, beSilentOnParseLogs);
          resolve(updatedState.currentCodecSupport);
        })
        .catch((error) => {
          reject(error);
        });
    }
  } catch (error) {
    reject(error);
  }
});

export default getCodecsSupport;
