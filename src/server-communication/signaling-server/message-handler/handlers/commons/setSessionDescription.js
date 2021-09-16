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
  const { STATS_MODULE } = MESSAGES;
  const peerConnection = peerConnections[targetMid];


  peerConnection.processingRemoteSDP = true;
  const mungedSessionDescription = _mungeSDP(targetMid, remoteDescription, room.id);
  handleNegotiationStats.send(room.id, STATS_MODULE.HANDLE_NEGOTIATION_STATS[type.toUpperCase()][type], targetMid, mungedSessionDescription, true);
  return peerConnection.setRemoteDescription(mungedSessionDescription)
    .then(() => peerConnection);
};

const setLocalDescription = (room, targetMid, localDescription) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;
  const { type } = localDescription;
  const peerConnection = peerConnections[targetMid];
  const { STATS_MODULE } = MESSAGES;

  peerConnection.processingLocalSDP = true;

  handleNegotiationStats.send(room.id, STATS_MODULE.HANDLE_NEGOTIATION_STATS[type.toUpperCase()][type], targetMid, localDescription, false);

  return peerConnection.setLocalDescription(localDescription)
    .then(() => peerConnection);
};

export {
  setRemoteDescription,
  setLocalDescription,
};
