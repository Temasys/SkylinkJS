import Skylink from '../../index';
import * as constants from '../../constants';
import messages from '../../messages';
import logger from '../../logger';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { candidatesGathered } from '../../skylink-events';

/**
 * @param {String} targetMid
 * @param {SkylinkState} roomState
 * @return {null}
 * @memberOf PeerConnection.PeerConnectionHelpers
 * @fires CANDIDATES_GATHERED
 */
const signalingEndOfCandidates = (targetMid, roomState) => {
  const state = Skylink.getSkylinkState(roomState.room.id);
  const peerEndOfCandidatesCounter = state.peerEndOfCandidatesCounter[targetMid];
  const peerConnection = state.peerConnections[targetMid];
  const peerCandidatesQueue = state.peerCandidatesQueue[targetMid];
  const gatheredCandidates = state.gatheredCandidates[targetMid];
  const { TAGS } = constants;
  const { ICE_CONNECTION } = messages;

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
    logger.log.DEBUG([targetMid, TAGS.PEER_CONNECTION, null, ICE_CONNECTION.END_OF_CANDIDATES_SUCCESS]);

    peerEndOfCandidatesCounter.hasSet = true;

    try {
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
      logger.log.ERROR([targetMid, TAGS.PEER_CONNECTION, null, ICE_CONNECTION.END_OF_CANDIDATES_FAILURE], error);
    }
  }
  return null;
};

export default signalingEndOfCandidates;
