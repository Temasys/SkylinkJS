import Skylink from '../../index';
import { BROWSER_AGENT, TRACK_KIND } from '../../constants';
import SessionDescription from '../index';
import { isAgent } from '../../utils/helpers';

const getCodecsSupport = roomKey => new Promise((resolve, reject) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { beSilentOnParseLogs } = Skylink.getInitOptions();
  const updatedState = state;
  const { RTCPeerConnection } = window;

  if (state.currentCodecSupport) {
    resolve(state.currentCodecSupport);
  }

  updatedState.currentCodecSupport = { audio: {}, video: {} };

  // Safari 11 REQUIRES a stream first before connection works, hence let's spoof it for now
  if (isAgent(BROWSER_AGENT.SAFARI)) {
    updatedState.currentCodecSupport.audio = {
      opus: ['48000/2'],
    };
    updatedState.currentCodecSupport.video = {
      h264: ['48000'],
    };
    resolve(updatedState.currentCodecSupport);
  }

  try {
    const pc = new RTCPeerConnection(null);
    let offerConstraints = {};
    if (pc.addTransceiver) {
      pc.addTransceiver(TRACK_KIND.VIDEO);
      pc.addTransceiver(TRACK_KIND.AUDIO);
    } else {
      offerConstraints = {
        mandatory: {
          OfferToReceiveVideo: true,
          OfferToReceiveAudio: true,
        },
      };
    }

    pc.createOffer(offerConstraints)
      .then((offer) => {
        updatedState.currentCodecSupport = SessionDescription.getSDPCodecsSupport(null, offer, beSilentOnParseLogs);
        resolve(updatedState.currentCodecSupport);
      })
      .catch((error) => {
        reject(error);
      });
  } catch (error) {
    reject(error);
  }
});

export default getCodecsSupport;
