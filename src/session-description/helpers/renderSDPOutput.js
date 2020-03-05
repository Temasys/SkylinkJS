/* eslint-disable prefer-template */
/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
import Skylink from '../../index';
import logger from '../../logger';
import * as constants from '../../constants';

const renderSDPOutput = (targetMid, sessionDescription, roomKey) => {
  const state = Skylink.getSkylinkState(roomKey);
  let localStream = null;
  let localStreamId = null;

  if (!(sessionDescription && sessionDescription.sdp)) {
    return;
  }

  if (!state.peerConnections[targetMid]) {
    return sessionDescription.sdp;
  }

  if (state.peerConnections[targetMid].localStream) {
    localStream = state.peerConnections[targetMid].localStream;
    localStreamId = state.peerConnections[targetMid].localStreamId || state.peerConnections[targetMid].localStream.id;
  }

  const sdpLines = sessionDescription.sdp.split('\r\n');
  // Parse and replace with the correct msid to prevent unwanted streams.
  // Making it simple without replacing with the track IDs or labels, neither setting prefixing "mslabel" and "label" as required labels.
  if (localStream) {
    let mediaType = '';

    for (let i = 0; i < sdpLines.length; i += 1) {
      if (sdpLines[i].indexOf('m=') === 0) {
        mediaType = (sdpLines[i].split('m=')[1] || '').split(' ')[0] || '';
        mediaType = ['audio', 'video'].indexOf(mediaType) === -1 ? '' : mediaType;
      } else if (mediaType) {
        if (sdpLines[i].indexOf('a=msid:') === 0) {
          const msidParts = sdpLines[i].split(' ');
          msidParts[0] = 'a=msid:' + localStreamId;
          sdpLines[i] = msidParts.join(' ');
        } else if (sdpLines[i].indexOf('a=ssrc:') === 0) {
          let ssrcParts = null;

          // Replace for "msid:" and "mslabel:"
          if (sdpLines[i].indexOf(' msid:') > 0) {
            ssrcParts = sdpLines[i].split(' msid:');
          } else if (sdpLines[i].indexOf(' mslabel:') > 0) {
            ssrcParts = sdpLines[i].split(' mslabel:');
          }

          if (ssrcParts) {
            const ssrcMsidParts = (ssrcParts[1] || '').split(' ');
            ssrcMsidParts[0] = localStreamId;
            ssrcParts[1] = ssrcMsidParts.join(' ');

            if (sdpLines[i].indexOf(' msid:') > 0) {
              sdpLines[i] = ssrcParts.join(' msid:');
            } else if (sdpLines[i].indexOf(' mslabel:') > 0) {
              sdpLines[i] = ssrcParts.join(' mslabel:');
            }
          }
        }
      }
    }
  }

  // Replace the bundle policy to prevent complete removal of m= lines for some cases that do not accept missing m= lines except edge.
  if (sessionDescription.type === constants.HANDSHAKE_PROGRESS.ANSWER && state.sdpSessions[targetMid]) {
    let mLineIndex = -1;

    for (let j = 0; j < sdpLines.length; j += 1) {
      if (sdpLines[j].indexOf('a=group:BUNDLE') === 0 && state.sdpSessions[targetMid].remote.bundleLine && state.peerConnectionConfig.bundlePolicy === constants.BUNDLE_POLICY.MAX_BUNDLE) {
        sdpLines[j] = state.sdpSessions[targetMid].remote.bundleLine;
      } else if (sdpLines[j].indexOf('m=') === 0) {
        mLineIndex += 1;
        const compareA = sdpLines[j].split(' ');
        const compareB = (state.sdpSessions[targetMid].remote.mLines[mLineIndex] || '').split(' ');

        if (compareA[0] && compareB[0] && compareA[0] !== compareB[0]) {
          compareB[1] = 0;
          logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Appending middle rejected m= line ->'], compareB.join(' '));
          sdpLines.splice(j, 0, compareB.join(' '));
          j += 1;
          mLineIndex += 1;
        }
      }
    }

    while (state.sdpSessions[targetMid].remote.mLines[mLineIndex + 1]) {
      mLineIndex += 1;
      let appendIndex = sdpLines.length;
      if (!sdpLines[appendIndex - 1].replace(/\s/gi, '')) {
        appendIndex -= 1;
      }
      const parts = (state.sdpSessions[targetMid].remote.mLines[mLineIndex] || '').split(' ');
      parts[1] = 0;
      logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Appending later rejected m= line ->'], parts.join(' '));
      sdpLines.splice(appendIndex, 0, parts.join(' '));
    }
  }

  // Ensure for chrome case to have empty "" at last line or it will return invalid SDP errors
  if (window.webrtcDetectedBrowser === 'edge' && sessionDescription.type === constants.HANDSHAKE_PROGRESS.OFFER && !sdpLines[sdpLines.length - 1].replace(/\s/gi, '')) {
    logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing last empty space for Edge browsers']);
    sdpLines.splice(sdpLines.length - 1, 1);
  }

  logger.log.INFO([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Formatted output ->'], sdpLines.join('\r\n'));

  return sdpLines.join('\r\n');
};

export default renderSDPOutput;
