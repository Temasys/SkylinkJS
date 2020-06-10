/* eslint-disable prefer-template */
/* eslint-disable prefer-destructuring */
import Skylink from '../../index';
import logger from '../../logger';
import PeerData from '../../peer-data';

const parseFn = (targetMid, sdpLines, sdpType, mediaType, bw) => {
  const mLineType = mediaType === 'data' ? 'application' : mediaType;
  let mLineIndex = -1;
  let cLineIndex = -1;

  for (let i = 0; i < sdpLines.length; i += 1) {
    if (sdpLines[i].indexOf('m=' + mLineType) === 0) {
      mLineIndex = i;
    } else if (mLineIndex > 0) {
      if (sdpLines[i].indexOf('m=') === 0) {
        break;
      }

      if (sdpLines[i].indexOf('c=') === 0) {
        cLineIndex = i;
        // Remove previous b:AS settings
      } else if (sdpLines[i].indexOf('b=AS:') === 0 || sdpLines[i].indexOf('b:TIAS:') === 0) {
        sdpLines.splice(i, 1);
        i -= 1;
      }
    }
  }

  if (!(typeof bw === 'number' && bw > 0)) {
    logger.log.WARN([targetMid, 'RTCSessionDesription', sdpType, `Not limiting ${mediaType} bandwidth`]);
    return;
  }

  if (mLineIndex === -1 || cLineIndex === -1) {
    // Missing c-line means no media of specified type is being sent
    logger.log.WARN([targetMid, 'RTCSessionDesription', sdpType, `Not limiting ${mediaType} bandwidth as ${mediaType} is not being sent`]);
    return;
  }

  // Follow RFC 4566, that the b-line should follow after c-line.
  logger.log.INFO([targetMid, 'RTCSessionDesription', sdpType, `Limiting maximum sending ${mediaType} bandwidth ->`], bw);
  sdpLines.splice(cLineIndex + 1, 0, window.webrtcDetectedBrowser === 'firefox' ? 'b=TIAS:' + (bw * 1000).toFixed(0) : 'b=AS:' + bw);
};

// alternative to munging is to implement RTCRtpSender.setParameters()
const setSDPBitrate = (targetMid, sessionDescription, roomKey) => {
  const state = Skylink.getSkylinkState(roomKey);
  const sdpLines = sessionDescription.sdp.split('\r\n');
  const sdpType = sessionDescription.type;
  let bASAudioBw;
  let bASVideoBw;
  let bASDataBw;
  const peerCustomSettings = PeerData.getPeersCustomSettings(state)[targetMid];

  // Apply local peer bandwidth settings if configured
  if (state.streamsBandwidthSettings.bAS) {
    bASAudioBw = state.streamsBandwidthSettings.bAS.audio;
    bASVideoBw = state.streamsBandwidthSettings.bAS.video;
    bASDataBw = state.streamsBandwidthSettings.bAS.data;
  } else if (peerCustomSettings[targetMid] && peerCustomSettings[targetMid].maxBandwidth
  && typeof peerCustomSettings[targetMid].maxBandwidth === 'object') { // else apply remote peer bandwidth settings
    if (typeof peerCustomSettings[targetMid].maxBandwidth.audio === 'number') {
      bASAudioBw = peerCustomSettings[targetMid].maxBandwidth.audio;
    }
    if (typeof peerCustomSettings[targetMid].maxBandwidth.video === 'number') {
      bASVideoBw = peerCustomSettings[targetMid].maxBandwidth.video;
    }
    if (typeof peerCustomSettings[targetMid].maxBandwidth.data === 'number') {
      bASDataBw = peerCustomSettings[targetMid].maxBandwidth.data;
    }
  }

  parseFn(targetMid, sdpLines, sdpType, 'audio', bASAudioBw);
  parseFn(targetMid, sdpLines, sdpType, 'video', bASVideoBw);
  parseFn(targetMid, sdpLines, sdpType, 'data', bASDataBw);

  return sdpLines.join('\r\n');
};

export default setSDPBitrate;
