import logger from '../../../../logger';
import Skylink from '../../../../index';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { peerLeft, serverPeerLeft } from '../../../../skylink-events';
import PeerData from '../../../../peer-data';
import PeerConnection from '../../../../peer-connection/index';
import {
  PEER_TYPE, PEER_CONNECTION_STATE, SERVER_PEER_TYPE, TAGS,
} from '../../../../constants';
import MESSAGES from '../../../../messages';
import { isEmptyObj } from '../../../../utils/helpers';
import HandleUserMediaStats from '../../../../skylink-stats/handleUserMediaStats';

/**
 * Checks if peer is connected.
 * @param {SkylinkState} roomState
 * @param {String} peerId
 * @private
 */
const isPeerConnected = (roomState, peerId) => {
  const roomStateObj = roomState;

  if (!roomStateObj) return false;

  if (!roomStateObj.peerConnections[peerId] && !roomStateObj.peerInformations[peerId]) {
    logger.log.DEBUG([peerId, TAGS.PEER_CONNECTION, null, `${MESSAGES.ROOM.LEAVE_ROOM.DROPPING_HANGUP} - ${MESSAGES.PEER_CONNECTION.NO_PEER_CONNECTION}`]);
    return false;
  }

  return true;
};

/**
 * Closes a peer connection for a particular peerId.
 * @param {String} roomKey
 * @param {String} peerId
 * @private
 */
const closePeerConnection = (roomKey, peerId) => {
  const roomState = Skylink.getSkylinkState(roomKey);
  if (roomState.peerConnections[peerId].signalingState === PEER_CONNECTION_STATE.CLOSED) return;

  roomState.peerConnections[peerId].close();
};

/**
 * Clears peer information in SkylinkState.
 * @param {String} roomKey
 * @param {String} peerId
 * @private
 */
export const clearPeerInfo = (roomKey, peerId) => {
  const updatedState = Skylink.getSkylinkState(roomKey);

  // Otherwise stats module fails.
  setTimeout(() => {
    const state = Skylink.getSkylinkState(roomKey);
    if (!isEmptyObj(state)) {
      delete state.peerConnections[peerId];
      Skylink.setSkylinkState(state, state.room.id);
    }

    if (!updatedState.hasMCU) {
      // catch media changes when remote peer leaves between the interval
      // not needed for MCU as it will be caught in onremovetrack
      new HandleUserMediaStats().send(roomKey);
    }
    logger.log.INFO([peerId, TAGS.PEER_CONNECTION, null, MESSAGES.ROOM.LEAVE_ROOM.PEER_LEFT.SUCCESS]);
  }, 500);

  delete updatedState.peerInformations[peerId];
  delete updatedState.peerMedias[peerId];
  delete updatedState.peerMessagesStamps[peerId];
  delete updatedState.peerEndOfCandidatesCounter[peerId];
  delete updatedState.peerCandidatesQueue[peerId];
  delete updatedState.peerStats[peerId];
  delete updatedState.gatheredCandidates[peerId];
  delete updatedState.peerStreams[peerId];
  delete updatedState.currentRTCRTPSenders[peerId];
  delete updatedState.bufferedLocalOffer[peerId];
};

/**
 * Check if health timer exists.
 * @param {String} roomKey
 * @param {String} peerId
 * @private
 */
export const checksIfHealthTimerExists = (roomKey, peerId) => {
  const roomState = Skylink.getSkylinkState(roomKey);
  if (!roomState.peerConnections[peerId]) return;

  closePeerConnection(roomKey, peerId);
};

/**
 * Triggers peerLeft event and changes state for serverPeerLeft.
 * @param {String} roomKey
 * @param {String} peerId
 * @private
 */
const triggerPeerLeftEventAndChangeState = (roomKey, peerId) => {
  const roomState = Skylink.getSkylinkState(roomKey);

  if (!isPeerConnected(roomState, peerId)) return;

  const { room } = roomState;
  const peerInfo = PeerData.getPeerInfo(peerId, room);

  if (peerId === PEER_TYPE.MCU) {
    const updatedState = roomState;
    dispatchEvent(serverPeerLeft({
      peerId,
      serverPeerType: SERVER_PEER_TYPE.MCU,
      room,
    }));
    updatedState.hasMCU = false;

    Skylink.setSkylinkState(updatedState, room.id);
    return;
  }

  dispatchEvent(peerLeft({
    peerId,
    peerInfo,
    isSelf: false,
    room,
  }));
};

/**
 * Closes datachannel for a particular room.
 * @param {String} roomKey
 * @param {String} peerId
 * @private
 */
const tryCloseDataChannel = (roomKey, peerId) => {
  const roomState = Skylink.getSkylinkState(roomKey);
  PeerConnection.closeDataChannel(roomState, peerId);
};

/**
 * Function that handles the bye Signaling Server message.
 * @param {JSON} message
 * @memberOf SignalingMessageHandler
 * @private
 */
const byeHandler = (message) => {
  const { mid, rid, publisherId } = message;
  const roomKey = rid;
  const roomState = Skylink.getSkylinkState(roomKey);
  let peerId = mid;

  if (roomState.hasMCU) {
    peerId = publisherId;
  }

  logger.log.INFO([peerId, TAGS.PEER_CONNECTION, null, MESSAGES.ROOM.LEAVE_ROOM.PEER_LEFT.START]);

  try {
    triggerPeerLeftEventAndChangeState(roomKey, peerId);
    checksIfHealthTimerExists(roomKey, peerId);
    clearPeerInfo(roomKey, peerId);
    tryCloseDataChannel(roomKey, peerId);
  } catch (error) {
    logger.log.DEBUG([peerId, TAGS.ROOM, null, MESSAGES.ROOM.LEAVE_ROOM.PEER_LEFT.ERROR], error);
  }
};

export default byeHandler;
