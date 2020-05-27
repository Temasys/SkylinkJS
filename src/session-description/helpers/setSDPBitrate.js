/* eslint-disable prefer-template */
/* eslint-disable prefer-destructuring */
import Skylink from '../../index';
import logger from '../../logger';

// alternative to munging is to implement RTCRtpSender.setParameters()
const setSDPBitrate = (targetMid, sessionDescription, roomKey) => {
  const state = Skylink.getSkylinkState(roomKey);
  const sdpLines = sessionDescription.sdp.split('\r\n');
  const parseFn = function (type, bw) {
    let mLineType = type;
    let mLineIndex = -1;
    let cLineIndex = -1;

    if (type === 'data') {
      mLineType = 'application';
    }

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
      logger.log.WARN([targetMid, 'RTCSessionDesription', sessionDescription.type, `Not limiting ${type} bandwidth`]);
      return;
    }

    if (cLineIndex === -1) {
      logger.log.ERROR([targetMid, 'RTCSessionDesription', sessionDescription.type, `Failed setting ${type} bandwidth as c-line is missing.`]);
      return;
    }

    // Follow RFC 4566, that the b-line should follow after c-line.
    logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type, `Limiting maximum sending ${type} bandwidth ->`], bw);
    sdpLines.splice(cLineIndex + 1, 0, window.webrtcDetectedBrowser === 'firefox' ? 'b=TIAS:' + (bw * 1000).toFixed(0) : 'b=AS:' + bw);
  };

  let bASAudioBw = state.streamsBandwidthSettings.bAS.audio;
  let bASVideoBw = state.streamsBandwidthSettings.bAS.video;
  let bASDataBw = state.streamsBandwidthSettings.bAS.data;
  let googleXMinBw = state.streamsBandwidthSettings.googleX.min;
  let googleXMaxBw = state.streamsBandwidthSettings.googleX.max;

  if (state.peerCustomConfigs[targetMid]) {
    if (state.peerCustomConfigs[targetMid].bandwidth
      && typeof state.peerCustomConfigs[targetMid].bandwidth === 'object') {
      if (typeof state.peerCustomConfigs[targetMid].bandwidth.audio === 'number') {
        bASAudioBw = state.peerCustomConfigs[targetMid].bandwidth.audio;
      }
      if (typeof state.peerCustomConfigs[targetMid].bandwidth.video === 'number') {
        bASVideoBw = state.peerCustomConfigs[targetMid].bandwidth.video;
      }
      if (typeof state.peerCustomConfigs[targetMid].bandwidth.data === 'number') {
        bASDataBw = state.peerCustomConfigs[targetMid].bandwidth.data;
      }
    }
    if (state.peerCustomConfigs[targetMid].googleXBandwidth && typeof state.peerCustomConfigs[targetMid].googleXBandwidth === 'object') {
      if (typeof state.peerCustomConfigs[targetMid].googleXBandwidth.min === 'number') {
        googleXMinBw = state.peerCustomConfigs[targetMid].googleXBandwidth.min;
      }
      if (typeof state.peerCustomConfigs[targetMid].googleXBandwidth.max === 'number') {
        googleXMaxBw = state.peerCustomConfigs[targetMid].googleXBandwidth.max;
      }
    }
  }

  parseFn('audio', bASAudioBw);
  parseFn('video', bASVideoBw);
  parseFn('data', bASDataBw);

  // Sets the experimental google bandwidth
  if ((typeof googleXMinBw === 'number') || (typeof googleXMaxBw === 'number')) {
    let codec = null;
    let codecRtpMapLineIndex = -1;
    let codecFmtpLineIndex = -1;

    for (let j = 0; j < sdpLines.length; j += 1) {
      if (sdpLines[j].indexOf('m=video') === 0) {
        codec = sdpLines[j].split(' ')[3];
      } else if (codec) {
        if (sdpLines[j].indexOf('m=') === 0) {
          break;
        }

        if (sdpLines[j].indexOf('a=rtpmap:' + codec + ' ') === 0) {
          codecRtpMapLineIndex = j;
        } else if (sdpLines[j].indexOf('a=fmtp:' + codec + ' ') === 0) {
          sdpLines[j] = sdpLines[j].replace(/x-google-(min|max)-bitrate=[0-9]*[;]*/gi, '');
          codecFmtpLineIndex = j;
          break;
        }
      }
    }

    if (codecRtpMapLineIndex > -1) {
      let xGoogleParams = '';

      if (typeof googleXMinBw === 'number') {
        xGoogleParams += 'x-google-min-bitrate=' + googleXMinBw + ';';
      }

      if (typeof googleXMaxBw === 'number') {
        xGoogleParams += 'x-google-max-bitrate=' + googleXMaxBw + ';';
      }

      logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Limiting x-google-bitrate ->'], xGoogleParams);

      if (codecFmtpLineIndex > -1) {
        sdpLines[codecFmtpLineIndex] += (sdpLines[codecFmtpLineIndex].split(' ')[1] ? ';' : '') + xGoogleParams;
      } else {
        sdpLines.splice(codecRtpMapLineIndex + 1, 0, 'a=fmtp:' + codec + ' ' + xGoogleParams);
      }
    }
  }

  return sdpLines.join('\r\n');
};

export default setSDPBitrate;
