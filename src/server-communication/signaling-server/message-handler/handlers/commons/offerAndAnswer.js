/* eslint-disable no-unused-vars,no-multi-assign */
import Skylink from '../../../../../index';
import logger from '../../../../../logger';
import {
  TAGS, PEER_CONNECTION_STATE, HANDSHAKE_PROGRESS, DATA_CHANNEL_STATE,
} from '../../../../../constants';
import IceConnection from '../../../../../ice-connection/index';
import SkylinkSignalingServer from '../../../index';
import PeerConnection from '../../../../../peer-connection/index';
import { handshakeProgress } from '../../../../../skylink-events';
import { dispatchEvent } from '../../../../../utils/skylinkEventManager';
import handleNegotiationStats from '../../../../../skylink-stats/handleNegotiationStats';
import MESSAGES from '../../../../../messages';
import PeerMedia from '../../../../../peer-media/index';
import SessionDescription from '../../../../../session-description';

const handleSetOfferAndAnswerSuccess = (state, targetMid, description, isRemote) => {
  const { STATS_MODULE: { HANDLE_NEGOTIATION_STATS } } = MESSAGES;
  const { peerConnections, bufferedLocalOffer, room } = state;
  const peerConnection = peerConnections[targetMid];
  const msgType = description.type === 'offer' ? 'OFFER' : 'ANSWER';

  handleNegotiationStats.send(room.id, HANDLE_NEGOTIATION_STATS[msgType].set, targetMid, description, isRemote);

  if (isRemote) { // handshake progress is triggered on the local end after sdp it is created
    dispatchEvent(handshakeProgress({
      state: HANDSHAKE_PROGRESS[msgType],
      peerId: targetMid,
      room,
    }));
  }

  if (isRemote) {
    if (description.type === 'offer') {
      peerConnection.setOffer = 'remote';
    } else {
      peerConnection.setAnswer = 'remote';
    }
    IceConnection.addIceCandidateFromQueue(targetMid, room);
  } else {
    bufferedLocalOffer[targetMid] = null;
    if (description.type === 'offer') {
      peerConnection.setOffer = 'local';
    } else {
      peerConnection.setAnswer = 'local';
    }
  }

  Skylink.setSkylinkState(state, room.id);
};

const handleSetOfferAndAnswerFailure = (state, targetMid, description, isRemote, error) => {
  const { room, user } = state;
  const { STATS_MODULE: { HANDLE_NEGOTIATION_STATS } } = MESSAGES;
  const msgType = description.type === 'offer' ? 'OFFER' : 'ANSWER';

  handleNegotiationStats.send(room.id, HANDLE_NEGOTIATION_STATS[msgType].set_error, targetMid, description, isRemote, error);

  dispatchEvent(handshakeProgress({
    state: HANDSHAKE_PROGRESS.ERROR,
    peerId: isRemote ? targetMid : user.sid,
    error,
    room,
  }));
};

// modifying the remote description received
const mungeSDP = (targetMid, sessionDescription, roomKey) => {
  const mungedSessionDescription = sessionDescription;
  // TODO: Below SDP methods needs to be implemented in the SessionDescription Class.
  mungedSessionDescription.sdp = SessionDescription.setSDPBitrate(targetMid, mungedSessionDescription, roomKey);

  // logger.log.INFO([targetMid, 'RTCSessionDescription', type, `Updated remote ${type} ->`], sessionDescriptionToSet.sdp);
  return mungedSessionDescription;
};

const setLocalDescription = (room, targetMid, localDescription) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;
  const { type } = localDescription;
  const peerConnection = peerConnections[targetMid];
  const { STATS_MODULE } = MESSAGES;
  const msgType = type === 'offer' ? 'OFFER' : 'ANSWER';

  peerConnection.processingLocalSDP = true;

  handleNegotiationStats.send(room.id, STATS_MODULE.HANDLE_NEGOTIATION_STATS[msgType][type], targetMid, localDescription, false);

  return peerConnection.setLocalDescription(localDescription)
    .then(() => peerConnection);
};

const onLocalDescriptionSetSuccess = (RTCPeerConnection, room, targetMid, localDescription) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;
  const { NEGOTIATION_PROGRESS } = MESSAGES;
  const peerConnection = peerConnections[targetMid] = RTCPeerConnection;

  logger.log.DEBUG([targetMid, TAGS.SESSION_DESCRIPTION, localDescription.type, NEGOTIATION_PROGRESS.SET_LOCAL_DESCRIPTION], localDescription);

  peerConnection.processingLocalSDP = false;
  handleSetOfferAndAnswerSuccess(state, targetMid, localDescription, false);
};

const onLocalDescriptionSetFailure = (room, targetMid, localDescription, error) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;
  const peerConnection = peerConnections[targetMid];
  const { NEGOTIATION_PROGRESS } = MESSAGES;

  logger.log.ERROR([targetMid, TAGS.SESSION_DESCRIPTION, localDescription.type, NEGOTIATION_PROGRESS.FAILED_SET_LOCAL_DESCRIPTION], error);

  peerConnection.processingLocalSDP = false;
  peerConnection.negotiating = false;

  handleSetOfferAndAnswerFailure(state, targetMid, localDescription, false, error);
};

const setRemoteDescription = (room, targetMid, remoteDescription) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;
  const { type } = remoteDescription;
  const { STATS_MODULE } = MESSAGES;
  const peerConnection = peerConnections[targetMid];
  const msgType = type === 'offer' ? 'OFFER' : 'ANSWER';

  peerConnection.processingRemoteSDP = true;
  handleNegotiationStats.send(room.id, STATS_MODULE.HANDLE_NEGOTIATION_STATS[msgType][type], targetMid, remoteDescription, true);
  const mungedSessionDescription = mungeSDP(targetMid, remoteDescription, room.id);
  return peerConnection.setRemoteDescription(mungedSessionDescription)
    .then(() => peerConnection);
};

const sendAnswerAck = (state, targetMid, success) => {
  const updatedState = state;
  updatedState.peerConnections[targetMid].negotiating = false;
  Skylink.setSkylinkState(updatedState, targetMid);

  const signaling = new SkylinkSignalingServer();
  signaling.answerAck(state, targetMid, success);
};

const onRemoteDescriptionSetSuccess = (RTCPeerConnection, room, targetMid, remoteDescription) => {
  const signaling = new SkylinkSignalingServer();
  const { type } = remoteDescription;
  const { NEGOTIATION_PROGRESS, DATA_CHANNEL } = MESSAGES;

  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;
  const peerConnection = peerConnections[targetMid] = RTCPeerConnection;

  logger.log.DEBUG([targetMid, TAGS.SESSION_DESCRIPTION, type, NEGOTIATION_PROGRESS.SET_REMOTE_DESCRIPTION], remoteDescription);

  peerConnection.processingRemoteSDP = false;

  if (type === 'offer') {
    handleSetOfferAndAnswerSuccess(state, targetMid, remoteDescription, true);
    return signaling.answer(state, targetMid);
  }
  // FIXME: why is this needed?
  if (state.peerMessagesStamps[targetMid]) {
    state.peerMessagesStamps[targetMid].hasRestart = false;
  }

  // if remote peer does not have data channel
  if (state.dataChannels[targetMid] && (peerConnection.remoteDescription.sdp.indexOf('m=application') === -1 || peerConnection.remoteDescription.sdp.indexOf('m=application 0') > 0)) {
    logger.log.WARN([targetMid, TAGS.PEER_CONNECTION, null, `${DATA_CHANNEL.CLOSING} - ${DATA_CHANNEL.NO_REMOTE_DATA_CHANNEL}`]);
    PeerConnection.closeDataChannel(state, targetMid);
  }

  handleSetOfferAndAnswerSuccess(state, targetMid, remoteDescription, true);
  sendAnswerAck(state, targetMid, true);
  return true;
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

  handleSetOfferAndAnswerFailure(state, targetMid, remoteDescription, true, error);

  if (type === 'answer') {
    sendAnswerAck(state, targetMid, false);
  }
};

const updateState = (state, message) => {
  const updatedState = state;
  const { userInfo, rid, mid } = message;
  const updatedUserInfo = userInfo;
  const targetMid = mid;

  if (userInfo && typeof userInfo === 'object') {
    updatedUserInfo.settings.data = !!(updatedState.dataChannels[targetMid] && updatedState.dataChannels[targetMid].main && updatedState.dataChannels[targetMid].main.channel && updatedState.dataChannels[targetMid].main.channel.readyState === DATA_CHANNEL_STATE.OPEN);
    updatedState.peerInformations[targetMid].settings = updatedUserInfo.settings || {};
    updatedState.peerInformations[targetMid].mediaStatus = updatedUserInfo.mediaStatus || {};
    updatedState.peerInformations[targetMid].userData = updatedUserInfo.userData;
    // updatedState.peerInformations[targetMid].midSourceMap = updatedUserInfo.midSourceMap;
  }

  updatedState.peerConnections[targetMid].negotiating = true;

  Skylink.setSkylinkState(updatedState, rid);
};

const canProceed = (state, message) => {
  const {
    weight, type, mid, sdp, resend,
  } = message;
  const {
    peerPriorityWeight, bufferedLocalOffer, room, peerConnections,
  } = state;
  const targetMid = mid;
  const {
    processingRemoteSDP, processingLocalSDP, negotiating,
  } = peerConnections[targetMid];
  const { STATS_MODULE, NEGOTIATION_PROGRESS, NO_PEER_CONNECTION } = MESSAGES;
  const msgType = type === 'offer' ? 'OFFER' : 'ANSWER';
  let error = null;

  if (!peerConnections[targetMid]) {
    logger.log.ERROR([targetMid, null, type, `${NO_PEER_CONNECTION.NO_PEER_CONNECTION}. Unable to set${type === 'offer' ? 'Remote' : 'Local'}Offer.`]);
    error = NO_PEER_CONNECTION.NO_PEER_CONNECTION;
  }

  if (type === 'offer' && peerConnections[targetMid].signalingState !== PEER_CONNECTION_STATE.STABLE) {
    logger.log.WARN([targetMid, null, type, NEGOTIATION_PROGRESS.ERRORS.NOT_STABLE], {
      signalingState: peerConnections[targetMid].signalingState,
      isRestart: !!resend,
    });
    error = `Peer connection state is ${peerConnections[targetMid].signalingState}.`;
  }

  if (type === 'offer' && bufferedLocalOffer[targetMid] && peerPriorityWeight > weight) {
    logger.log.WARN([targetMid, null, type, NEGOTIATION_PROGRESS.ERRORS.OFFER_TIEBREAKER], {
      selfWeight: peerPriorityWeight,
      messageWeight: weight,
    });
    error = NEGOTIATION_PROGRESS.ERRORS.OFFER_TIEBREAKER;
  }

  // if processing remote SDP
  if (processingRemoteSDP) {
    logger.log.WARN([targetMid, TAGS.SESSION_DESCRIPTION, type, NEGOTIATION_PROGRESS.ERRORS.PROCESSING_EXISTING_SDP], sdp);
    error = NEGOTIATION_PROGRESS.ERRORS.PROCESSING_EXISTING_SDP;

    // or completed processing local and remote sdp but answerAck has not been received
  } else if ((!processingLocalSDP && !processingRemoteSDP && negotiating) && type === 'offer') {
    // add to bufferedRemoteOffer
    const updatedState = state;
    logger.log.DEBUG([targetMid, TAGS.SESSION_DESCRIPTION, type, NEGOTIATION_PROGRESS.ERRORS.ADDING_REMOTE_OFFER_TO_BUFFER], message);
    updatedState.bufferedRemoteOffers[targetMid] = updatedState.bufferedRemoteOffers[targetMid] ? updatedState.bufferedRemoteOffers[targetMid] : [];
    updatedState.bufferedRemoteOffers[targetMid].push(message);
    Skylink.setSkylinkState(updatedState, room.id);
  }

  if (error) {
    handleNegotiationStats.send(room.id, STATS_MODULE.HANDLE_NEGOTIATION_STATS[msgType].dropped, targetMid, message, true, error);
  }

  return !error;
};

/**
 * Function that parses and sets the remote description for offer and answer.
 * @param {JSON} message
 * @return {null}
 * @memberOf SignalingMessageHandler
 * @fires handshakeProgress
 */
// eslint-disable-next-line import/prefer-default-export
export const parseAndSetRemoteDescription = (message) => {
  const {
    rid,
    mid,
    type,
    sdp,
    mediaInfoList,
  } = message;
  const state = Skylink.getSkylinkState(rid);
  const {
    hasMCU,
    room,
    bufferedLocalOffer,
  } = state;
  const targetMid = mid;
  const msgType = type === 'offer' ? 'OFFER' : 'ANSWER';
  const { NEGOTIATION_PROGRESS } = MESSAGES;

  logger.log.INFO([targetMid, null, type, `Received ${type} from peer. ${msgType}:`], message);

  if (canProceed(state, message)) {
    try {
      updateState(state, message);

      PeerMedia.setPeerMediaInfo(room, targetMid, mediaInfoList);
      PeerMedia.deleteUnavailableMedia(room, targetMid); // mediaState can be unavailable during renegotiation

      if (type === 'offer') {
        let localDescription = null;
        const remoteDescription = {
          type,
          sdp: hasMCU ? sdp.replace(/\r\n/g, '\n').split('\n').join('\r\n') : sdp,
        };

        setRemoteDescription(room, targetMid, remoteDescription)
          .then(peerConnection => onRemoteDescriptionSetSuccess(peerConnection, room, targetMid, remoteDescription))
          .catch(error => onRemoteDescriptionSetFailure(room, targetMid, remoteDescription, error))
          .then((answer) => {
            localDescription = {
              type: answer.type,
              sdp: answer.sdp,
            };
            return setLocalDescription(room, targetMid, localDescription);
          })
          .then(peerConnection => onLocalDescriptionSetSuccess(peerConnection, room, targetMid, localDescription))
          .catch(error => onLocalDescriptionSetFailure(room, targetMid, localDescription, error));
      } else if (bufferedLocalOffer[targetMid]) {
        const localDescription = bufferedLocalOffer[targetMid];
        const remoteDescription = {
          type,
          sdp: hasMCU ? sdp.replace(/\r\n/g, '\n').split('\n').join('\r\n') : sdp,
        };

        setLocalDescription(room, targetMid, localDescription)
          .then(peerConnection => onLocalDescriptionSetSuccess(peerConnection, room, targetMid, localDescription))
          .catch(error => onLocalDescriptionSetFailure(room, targetMid, localDescription, error))
          .then(() => setRemoteDescription(room, targetMid, remoteDescription))
          .then(peerConnection => onRemoteDescriptionSetSuccess(peerConnection, room, targetMid, remoteDescription))
          .catch(error => onRemoteDescriptionSetFailure(room, targetMid, remoteDescription, error));
      } else {
        logger.log.ERROR([targetMid, TAGS.PEER_CONNECTION, null, NEGOTIATION_PROGRESS.ERRORS.NO_LOCAL_BUFFERED_OFFER]);
      }
    } catch (error) {
      logger.log.ERROR([targetMid, TAGS.SESSION_DESCRIPTION, type, `Failed processing ${msgType} ->`], error);
    }
  }

  return null;
};
