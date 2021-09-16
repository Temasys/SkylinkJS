import MESSAGES from '../../../../../messages';
import handleNegotiationStats from '../../../../../skylink-stats/handleNegotiationStats';
import { dispatchEvent } from '../../../../../utils/skylinkEventManager';
import { handshakeProgress } from '../../../../../skylink-events';
import { HANDSHAKE_PROGRESS, TAGS } from '../../../../../constants';
import Room from '../../../../../room';
import Skylink from '../../../../../index';
import logger from '../../../../../logger';

// eslint-disable-next-line no-underscore-dangle
const _handleSetOfferAndAnswerFailure = (state, targetMid, description, isRemote, error) => {
  const { room, user } = state;
  const { STATS_MODULE: { HANDLE_NEGOTIATION_STATS } } = MESSAGES;

  handleNegotiationStats.send(room.id, HANDLE_NEGOTIATION_STATS[description.type.toUpperCase()].set_error, targetMid, description, isRemote, error);

  dispatchEvent(handshakeProgress({
    state: HANDSHAKE_PROGRESS.ERROR,
    peerId: isRemote ? targetMid : user.sid,
    error,
    room: Room.getRoomInfo(room.id),
  }));
};

const onLocalDescriptionSetFailure = (room, targetMid, localDescription, error) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;
  const peerConnection = peerConnections[targetMid];
  const { NEGOTIATION_PROGRESS } = MESSAGES;

  logger.log.ERROR([targetMid, TAGS.SESSION_DESCRIPTION, localDescription.type, NEGOTIATION_PROGRESS.FAILED_SET_LOCAL_DESCRIPTION], error);

  peerConnection.processingLocalSDP = false;
  peerConnection.negotiating = false;

  _handleSetOfferAndAnswerFailure(state, targetMid, localDescription, false, error);
};

const onRemoteDescriptionSetFailure = (room, targetMid, remoteDescription, error) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;
  const peerConnection = peerConnections[targetMid];
  const { type } = remoteDescription;

  logger.log.ERROR([targetMid, TAGS.SESSION_DESCRIPTION, type, `${MESSAGES.NEGOTIATION_PROGRESS.ERRORS.FAILED_SET_REMOTE_DESCRIPTION} ->`], {
    error,
    state: peerConnection.signalingState,
    [type]: remoteDescription,
  });

  peerConnection.processingRemoteSDP = false;
  peerConnection.negotiating = false;

  _handleSetOfferAndAnswerFailure(state, targetMid, remoteDescription, true, error);
};

export {
  onLocalDescriptionSetFailure,
  onRemoteDescriptionSetFailure,
};
