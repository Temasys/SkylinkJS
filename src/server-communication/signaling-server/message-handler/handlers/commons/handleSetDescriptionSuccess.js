import MESSAGES from '../../../../../messages';
import Skylink from '../../../../../index';
import logger from '../../../../../logger';
import { HANDSHAKE_PROGRESS, TAGS } from '../../../../../constants';
import { dispatchEvent } from '../../../../../utils/skylinkEventManager';
import { handshakeProgress } from '../../../../../skylink-events';
import Room from '../../../../../room';
import IceConnection from '../../../../../ice-connection';

// eslint-disable-next-line no-underscore-dangle
const _setPeerConnectionInState = (RTCPeerConnection, room, targetMid) => {
  const updatedState = Skylink.getSkylinkState(room.id);
  updatedState.peerConnections[targetMid] = RTCPeerConnection;
  Skylink.setSkylinkState(updatedState, room.id);
};

const setPeerConnectionInState = (RTCPeerConnection, room, targetMid) => _setPeerConnectionInState(RTCPeerConnection, room, targetMid);

const onRemoteDescriptionSetSuccess = (RTCPeerConnection, room, targetMid, remoteDescription) => {
  const { type } = remoteDescription;
  const { NEGOTIATION_PROGRESS } = MESSAGES;

  const updatedState = Skylink.getSkylinkState(room.id);

  if (remoteDescription.type === 'offer') {
    updatedState.peerConnections[targetMid].setOffer = 'remote';
  } else if (remoteDescription.type === 'answer') {
    updatedState.peerConnections[targetMid].setAnswer = 'remote';
  }

  console.log("-------- Added new key setRemoteDescriptionSuccess and set to true --------");
  updatedState.peerConnections[targetMid].setRemoteDescriptionSuccess = true;

  Skylink.setSkylinkState(updatedState, room.id);

  logger.log.DEBUG([targetMid, TAGS.SESSION_DESCRIPTION, type, NEGOTIATION_PROGRESS.SET_REMOTE_DESCRIPTION], remoteDescription);

  dispatchEvent(handshakeProgress({
    state: HANDSHAKE_PROGRESS[remoteDescription.type.toUpperCase()],
    peerId: targetMid,
    room: Room.getRoomInfo(room),
  }));

  IceConnection.addIceCandidateFromQueue(targetMid, room);
};

const onLocalDescriptionSetSuccess = (RTCPeerConnection, room, targetMid, localDescription) => {
  _setPeerConnectionInState(RTCPeerConnection, room, targetMid);

  const updatedState = Skylink.getSkylinkState(room.id);
  const { NEGOTIATION_PROGRESS } = MESSAGES;

  if (localDescription.type === 'offer') {
    updatedState.peerConnections[targetMid].setOffer = 'local';
  } else if (localDescription.type === 'answer') {
    updatedState.peerConnections[targetMid].setAnswer = 'local';
  }

  updatedState.bufferedLocalOffer[targetMid] = null;
  Skylink.setSkylinkState(updatedState, room.id);

  logger.log.DEBUG([targetMid, TAGS.SESSION_DESCRIPTION, localDescription.type, NEGOTIATION_PROGRESS.SET_LOCAL_DESCRIPTION], localDescription);
};

export {
  setPeerConnectionInState,
  onLocalDescriptionSetSuccess,
  onRemoteDescriptionSetSuccess,
};
