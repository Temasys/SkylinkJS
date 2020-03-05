import Skylink from '../../index';
import * as constants from '../../constants';
import messages from '../../messages';
import logger from '../../logger';
import IceCandidate from '../../ice-connection';
import { isLowerThanVersion } from '../../utils/helpers';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { candidatesGathered } from '../../skylink-events';

/**
 * @param {String} targetMid
 * @param {SkylinkState} roomState
 * @return {null}
 * @memberOf PeerConnection.PeerConnectionHelpers
 * @fires candidatesGathered
 */
const signalingEndOfCandidates = (targetMid, roomState) => {
  const state = Skylink.getSkylinkState(roomState.room.id);
  const peerEndOfCandidatesCounter = state.peerEndOfCandidatesCounter[targetMid];
  const peerConnection = state.peerConnections[targetMid];
  const peerCandidatesQueue = state.peerCandidatesQueue[targetMid];
  const peerConnectionConfig = state.peerConnectionConfig[targetMid];
  const gatheredCandidates = state.gatheredCandidates[targetMid];
  const { AdapterJS, RTCIceCandidate } = window;
  const { TAGS } = constants;
  const { PEER_CONNECTION } = messages;

  if (!peerEndOfCandidatesCounter) {
    return null;
  }

  if (
    // If peer connection exists first and state is not closed.
    peerConnection && peerConnection.signalingState !== constants.PEER_CONNECTION_STATE.CLOSED
    // If remote description is set
    && peerConnection.remoteDescription && peerConnection.remoteDescription.sdp
    // If end-of-candidates signal is received
    && typeof peerEndOfCandidatesCounter.expectedLen === 'number'
    // If all ICE candidates are received
    && peerEndOfCandidatesCounter.len >= peerEndOfCandidatesCounter.expectedLen
    // If there is no ICE candidates queue
    && (peerCandidatesQueue ? peerCandidatesQueue.length === 0 : true)
    // If it has not been set yet
    && !peerEndOfCandidatesCounter.hasSet) {
    logger.log.DEBUG([targetMid, TAGS.PEER_CONNECTION, null, PEER_CONNECTION.end_of_candidates]);

    peerEndOfCandidatesCounter.hasSet = true;

    try {
      if (AdapterJS.webrtcDetectedBrowser === 'edge') {
        let mLineCounter = -1;
        const addedMids = [];
        const sdpLines = peerConnection.remoteDescription.sdp.split('\r\n');
        let rejected = false;

        for (let i = 0; i < sdpLines.length; i += 1) {
          if (sdpLines[i].indexOf('m=') === 0) {
            rejected = sdpLines[i].split(' ')[1] === '0';
            mLineCounter += 1;
          } else if (sdpLines[i].indexOf('a=mid:') === 0 && !rejected) {
            const mid = sdpLines[i].split('a=mid:')[1] || '';
            if (mid && addedMids.indexOf(mid) === -1) {
              addedMids.push(mid);
              IceCandidate.addIceCandidate(targetMid, `endofcan-${(new Date()).getTime()}`, 'endOfCandidates', new RTCIceCandidate({
                sdpMid: mid,
                sdpMLineIndex: mLineCounter,
                candidate: 'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates',
              }), state);
              // Start breaking after the first add because of max-bundle option
              if (peerConnectionConfig.bundlePolicy === constants.BUNDLE_POLICY.MAX_BUNDLE) {
                break;
              }
            }
          }
        }
      } else if (AdapterJS && !isLowerThanVersion(AdapterJS.VERSION, '0.14.0')) {
        peerConnection.addIceCandidate(null);
      }

      if (gatheredCandidates) {
        const candidatesLength = {
          expected: peerEndOfCandidatesCounter.expectedLen || 0,
          received: peerEndOfCandidatesCounter.len || 0,
          processed: gatheredCandidates.receiving.srflx.length + gatheredCandidates.receiving.relay.length + gatheredCandidates.receiving.host.length,
        };
        dispatchEvent(candidatesGathered({
          room: state.room,
          peerId: targetMid,
          candidatesLength,
        }));
      }

      state.peerEndOfCandidatesCounter[targetMid] = peerEndOfCandidatesCounter;
      Skylink.setSkylinkState(state, roomState.room.id);
    } catch (error) {
      logger.log.ERROR([targetMid, TAGS.PEER_CONNECTION, null, PEER_CONNECTION.end_of_candidate_failure], error);
    }
  }
  return null;
};

export default signalingEndOfCandidates;
