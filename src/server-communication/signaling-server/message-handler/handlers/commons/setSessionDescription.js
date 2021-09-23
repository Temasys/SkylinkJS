import Skylink from '../../../../../index';
import MESSAGES from '../../../../../messages';
import handleNegotiationStats from '../../../../../skylink-stats/handleNegotiationStats';
import SessionDescription from '../../../../../session-description';
import logger from '../../../../../logger';
import { TAGS } from '../../../../../constants';

// modifying the remote description received
// eslint-disable-next-line no-underscore-dangle
const _mungeSDP = (targetMid, sessionDescription, roomKey) => {
  const mungedSessionDescription = sessionDescription;
  // TODO: Below SDP methods needs to be implemented in the SessionDescription Class.
  mungedSessionDescription.sdp = SessionDescription.setSDPBitrate(targetMid, mungedSessionDescription, roomKey);
  mungedSessionDescription.sdp = SessionDescription.removeSDPFilteredCandidates(targetMid, mungedSessionDescription, roomKey);

  logger.log.DEBUG([targetMid, TAGS.SESSION_DESCRIPTION, mungedSessionDescription.type, `Updated remote ${mungedSessionDescription.type} ->`], mungedSessionDescription);
  return mungedSessionDescription;
};

const setRemoteDescription = (room, targetMid, remoteDescription) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;
  const { type } = remoteDescription;
  const peerConnection = peerConnections[targetMid];

  if (peerConnection) {
    const mungedSessionDescription = _mungeSDP(targetMid, remoteDescription, room.id);

    handleNegotiationStats.send(room.id, MESSAGES.STATS_MODULE.HANDLE_NEGOTIATION_STATS[type.toUpperCase()][type], targetMid, mungedSessionDescription, true);

    return peerConnection.setRemoteDescription(mungedSessionDescription)
      .then(() => peerConnection);
  }

  logger.log.ERROR([targetMid, TAGS.NEGOTIATION, type, `${MESSAGES.PEER_CONNECTION.NO_PEER_CONNECTION} - Unable to set remote ${type}`]);

  return handleNegotiationStats.send(room.id, MESSAGES.STATS_MODULE.HANDLE_NEGOTIATION_STATS[type.toUpperCase()].dropped, targetMid, remoteDescription, true, MESSAGES.PEER_CONNECTION.NO_PEER_CONNECTION);
};

const setLocalDescription = (room, targetMid, localDescription) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;
  const { type } = localDescription;
  const peerConnection = peerConnections[targetMid];

  if (peerConnection) {
    handleNegotiationStats.send(room.id, MESSAGES.STATS_MODULE.HANDLE_NEGOTIATION_STATS[type.toUpperCase()][type], targetMid, localDescription, false);

    return peerConnection.setLocalDescription(localDescription)
      .then(() => peerConnection);
  }

  logger.log.ERROR([targetMid, TAGS.NEGOTIATION, type, `${MESSAGES.PEER_CONNECTION.NO_PEER_CONNECTION} - Unable to set local ${type}`]);

  return handleNegotiationStats.send(room.id, MESSAGES.STATS_MODULE.HANDLE_NEGOTIATION_STATS[type.toUpperCase()].dropped, targetMid, localDescription, true, MESSAGES.PEER_CONNECTION.NO_PEER_CONNECTION);
};

export {
  setRemoteDescription,
  setLocalDescription,
};
