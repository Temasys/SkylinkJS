import Skylink from '../../index';
import helpers from './index';

const getSDPCommonSupports = (targetMid, sessionDescription = null, roomKey) => {
  const state = Skylink.getSkylinkState(roomKey);
  const offer = { audio: false, video: false };
  const { AdapterJS } = window;
  const { currentCodecSupport, peerInformations } = state;

  if (!targetMid || !(sessionDescription && sessionDescription.sdp)) {
    // TODO: Implement getCodecsSupport inside room-init
    offer.video = !!(currentCodecSupport.video.h264 || currentCodecSupport.video.vp8);
    offer.audio = !!currentCodecSupport.audio.opus;

    if (targetMid) {
      const peerAgent = ((peerInformations[targetMid] || {}).agent || {}).name || '';

      if (AdapterJS.webrtcDetectedBrowser === peerAgent) {
        offer.video = Object.keys(currentCodecSupport.video).length > 0;
        offer.audio = Object.keys(currentCodecSupport.audio).length > 0;
      }
    }
    return offer;
  }

  const remoteCodecs = helpers.getSDPCodecsSupport(targetMid, sessionDescription);
  const localCodecs = currentCodecSupport;

  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-prototype-builtins */
  for (const ac in localCodecs.audio) {
    if (localCodecs.audio.hasOwnProperty(ac) && localCodecs.audio[ac] && remoteCodecs.audio[ac]) {
      offer.audio = true;
      break;
    }
  }

  for (const vc in localCodecs.video) {
    if (localCodecs.video.hasOwnProperty(vc) && localCodecs.video[vc] && remoteCodecs.video[vc]) {
      offer.video = true;
      break;
    }
  }

  return offer;
};

export default getSDPCommonSupports;
