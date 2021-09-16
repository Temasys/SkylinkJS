import Skylink from '../../../../../index';
import logger from '../../../../../logger';
import {
  TAGS, PEER_CONNECTION_STATE, DATA_CHANNEL_STATE,
} from '../../../../../constants';
import SkylinkSignalingServer from '../../../index';
import PeerConnection from '../../../../../peer-connection/index';
import handleNegotiationStats from '../../../../../skylink-stats/handleNegotiationStats';
import MESSAGES from '../../../../../messages';
import PeerMedia from '../../../../../peer-media/index';
import { onLocalDescriptionSetFailure, onRemoteDescriptionSetFailure } from './handleSetDescriptionFailure';
import { setPeerConnectionInState, onRemoteDescriptionSetSuccess, onLocalDescriptionSetSuccess } from './handleSetDescriptionSuccess';
import { setRemoteDescription, setLocalDescription } from './setSessionDescription';

const setLocalOffer = (room, targetMid, localDescription) => setLocalDescription(room, targetMid, localDescription);

const setLocalAnswer = (room, targetMid, localDescription) => setLocalDescription(room, targetMid, localDescription);

const onLocalOfferSetSuccess = (RTCPeerConnection, room, targetMid, localDescription) => onLocalDescriptionSetSuccess(RTCPeerConnection, room, targetMid, localDescription);

const onLocalAnswerSetSuccess = (RTCPeerConnection, room, targetMid, localDescription) => onLocalDescriptionSetSuccess(RTCPeerConnection, room, targetMid, localDescription);

const onLocalOfferSetFailure = (room, targetMid, localDescription, error) => onLocalDescriptionSetFailure(room, targetMid, localDescription, error);

const onLocalAnswerSetFailure = (room, targetMid, localDescription, error) => onLocalDescriptionSetFailure(room, targetMid, localDescription, error);

const setRemoteOffer = (room, targetMid, remoteDescription) => setRemoteDescription(room, targetMid, remoteDescription);

const setRemoteAnswer = (room, targetMid, remoteDescription) => setRemoteDescription(room, targetMid, remoteDescription);

const sendAnswerAck = (state, targetMid, success) => {
  const updatedState = state;
  updatedState.peerConnections[targetMid].negotiating = false;
  Skylink.setSkylinkState(updatedState, targetMid);

  const signaling = new SkylinkSignalingServer();
  signaling.answerAck(state, targetMid, success);
};

const onRemoteOfferSetSuccess = (RTCPeerConnection, room, targetMid, remoteDescription) => {
  setPeerConnectionInState(RTCPeerConnection, room, targetMid);
  onRemoteDescriptionSetSuccess(RTCPeerConnection, room, targetMid, remoteDescription);

  // create and return the answer
  const state = Skylink.getSkylinkState(room.id);
  const signaling = new SkylinkSignalingServer();
  return signaling.answer(state, targetMid);
};

const onRemoteAnswerSetSuccess = (RTCPeerConnection, room, targetMid, remoteDescription) => {
  setPeerConnectionInState(RTCPeerConnection, room, targetMid);
  onRemoteDescriptionSetSuccess(RTCPeerConnection, room, targetMid, remoteDescription);

  const state = Skylink.getSkylinkState(room.id);
  const peerConnection = state.peerConnections[targetMid];
  const { DATA_CHANNEL } = MESSAGES;

  // if remote peer does not have data channel
  if (state.peerDataChannels[targetMid] && (peerConnection.remoteDescription.sdp.indexOf('m=application') === -1 || peerConnection.remoteDescription.sdp.indexOf('m=application 0') > 0)) {
    logger.log.WARN([targetMid, TAGS.PEER_CONNECTION, null, `${DATA_CHANNEL.CLOSING} - ${DATA_CHANNEL.NO_REMOTE_DATA_CHANNEL}`]);
    PeerConnection.closeDataChannel(room.id, targetMid);
  }

  return sendAnswerAck(state, targetMid, true);
};

const onRemoteOfferSetFailure = (room, targetMid, remoteDescription, error) => onRemoteDescriptionSetFailure(room, targetMid, remoteDescription, error);

const onRemoteAnswerSetFailure = (room, targetMid, remoteDescription, error) => {
  onRemoteDescriptionSetFailure(room, targetMid, remoteDescription, error);

  const state = Skylink.getSkylinkState(room.id);
  sendAnswerAck(state, targetMid, false);
};

const updateStateInformation = (state, message) => {
  const updatedState = state;
  const {
    userInfo, rid, mid, mediaInfoList,
  } = message;
  const { room } = updatedState;
  const updatedUserInfo = userInfo;
  const targetMid = mid;

  if (userInfo && typeof userInfo === 'object') {
    updatedUserInfo.settings.data = !!(updatedState.peerDataChannels[targetMid] && updatedState.peerDataChannels[targetMid].main && updatedState.peerDataChannels[targetMid].main.channel && updatedState.peerDataChannels[targetMid].main.channel.readyState === DATA_CHANNEL_STATE.OPEN);
    updatedState.peerInformations[targetMid].settings = updatedUserInfo.settings || {};
    updatedState.peerInformations[targetMid].mediaStatus = updatedUserInfo.mediaStatus || {};
    updatedState.peerInformations[targetMid].userData = updatedUserInfo.userData;
  }

  updatedState.peerConnections[targetMid].negotiating = true;
  Skylink.setSkylinkState(updatedState, rid);

  PeerMedia.setPeerMediaInfo(room, targetMid, mediaInfoList);
  PeerMedia.deleteUnavailableMedia(room, targetMid); // mediaState can be unavailable during renegotiation
};

const canProceed = (message) => {
  const {
    weight, type, mid, sdp, resend, rid,
  } = message;
  const state = Skylink.getSkylinkState(rid);
  const {
    peerPriorityWeight, bufferedLocalOffer, room, peerConnections,
  } = state;
  const { STATS_MODULE, NEGOTIATION_PROGRESS, PEER_CONNECTION } = MESSAGES;
  const targetMid = mid;
  const peerConnection = peerConnections[targetMid];

  if (!peerConnection) {
    logger.log.ERROR([targetMid, null, type, `${PEER_CONNECTION.NO_PEER_CONNECTION}. Unable to set${type === 'offer' ? 'Remote' : 'Local'}Offer.`]);
    handleNegotiationStats.send(room.id, STATS_MODULE.HANDLE_NEGOTIATION_STATS[type.toUpperCase()].dropped, targetMid, message, true, PEER_CONNECTION.NO_PEER_CONNECTION);
    return false;
  }

  const {
    processingRemoteSDP, processingLocalSDP, negotiating,
  } = peerConnection;

  switch (type) {
    case 'offer':
      if (peerConnections[targetMid].signalingState !== PEER_CONNECTION_STATE.STABLE) {
        logger.log.WARN([targetMid, null, type, NEGOTIATION_PROGRESS.ERRORS.NOT_STABLE], {
          signalingState: peerConnections[targetMid].signalingState,
          isRestart: !!resend,
        });
        handleNegotiationStats.send(room.id, STATS_MODULE.HANDLE_NEGOTIATION_STATS[type.toUpperCase()].dropped, targetMid, message, true, `Peer connection state is ${peerConnections[targetMid].signalingState}.`);
        return false;
      }

      if (bufferedLocalOffer[targetMid] && peerPriorityWeight > weight) {
        logger.log.WARN([targetMid, null, type, NEGOTIATION_PROGRESS.ERRORS.OFFER_TIEBREAKER], {
          selfWeight: peerPriorityWeight,
          messageWeight: weight,
        });
        handleNegotiationStats.send(room.id, STATS_MODULE.HANDLE_NEGOTIATION_STATS[type.toUpperCase()].dropped, targetMid, message, true, NEGOTIATION_PROGRESS.ERRORS.OFFER_TIEBREAKER);
        return false;
      }

      // if processing remote SDP
      if (processingRemoteSDP) {
        logger.log.WARN([targetMid, TAGS.SESSION_DESCRIPTION, type, NEGOTIATION_PROGRESS.ERRORS.PROCESSING_EXISTING_SDP], sdp);
        handleNegotiationStats.send(room.id, STATS_MODULE.HANDLE_NEGOTIATION_STATS[type.toUpperCase()].dropped, targetMid, message, true, NEGOTIATION_PROGRESS.ERRORS.PROCESSING_EXISTING_SDP);
        return false;
      }

      // or completed processing local and remote sdp but answerAck has not been received
      if (!processingLocalSDP && !processingRemoteSDP && negotiating) {
        // add to bufferedRemoteOffer
        const updatedState = state;
        logger.log.DEBUG([targetMid, TAGS.SESSION_DESCRIPTION, type, NEGOTIATION_PROGRESS.ERRORS.ADDING_REMOTE_OFFER_TO_BUFFER], message);
        updatedState.bufferedRemoteOffers[targetMid] = updatedState.bufferedRemoteOffers[targetMid] ? updatedState.bufferedRemoteOffers[targetMid] : [];
        updatedState.bufferedRemoteOffers[targetMid].push(message);
        Skylink.setSkylinkState(updatedState, room.id);
        return false;
      }
      break;

    case 'answer':
      // if processing remote SDP
      if (processingRemoteSDP) {
        logger.log.WARN([targetMid, TAGS.SESSION_DESCRIPTION, type, NEGOTIATION_PROGRESS.ERRORS.PROCESSING_EXISTING_SDP], sdp);
        handleNegotiationStats.send(room.id, STATS_MODULE.HANDLE_NEGOTIATION_STATS[type.toUpperCase()].dropped, targetMid, message, true, NEGOTIATION_PROGRESS.ERRORS.PROCESSING_EXISTING_SDP);
        return false;
      }
      break;

    default:
      // should not come here
      return false;
  }

  return true;
};

const onRemoteAnswer = (message) => {
  const {
    rid, mid, type, sdp,
  } = message;
  const state = Skylink.getSkylinkState(rid);
  const targetMid = mid;
  const { hasMCU, bufferedLocalOffer, room } = state;

  logger.log.INFO([mid, null, type, 'Received answer from peer. ANSWER:'], message);

  try {
    updateStateInformation(state, message);

    if (bufferedLocalOffer[targetMid]) {
      const localDescription = bufferedLocalOffer[targetMid];
      const remoteDescription = {
        type,
        sdp: hasMCU ? sdp.replace(/\r\n/g, '\n').split('\n').join('\r\n') : sdp,
      };

      setLocalOffer(room, targetMid, localDescription)
        .then(peerConnection => onLocalOfferSetSuccess(peerConnection, room, targetMid, localDescription))
        .catch(error => onLocalOfferSetFailure(room, targetMid, localDescription, error))
        .then(() => setRemoteAnswer(room, targetMid, remoteDescription))
        .then(peerConnection => onRemoteAnswerSetSuccess(peerConnection, room, targetMid, remoteDescription))
        .catch(error => onRemoteAnswerSetFailure(room, targetMid, remoteDescription, error));
    } else {
      logger.log.ERROR([targetMid, TAGS.PEER_CONNECTION, null, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.NO_LOCAL_BUFFERED_OFFER]);
    }
  } catch (err) {
    logger.log.ERROR([mid, TAGS.SESSION_DESCRIPTION, type, 'Failed processing ANSWER ->'], err);
  }
};

const onRemoteOffer = (message) => {
  const {
    rid, mid, type, sdp,
  } = message;
  const state = Skylink.getSkylinkState(rid);
  const targetMid = mid;
  const { room, hasMCU } = state;
  const remoteDescription = {
    type,
    sdp: hasMCU ? sdp.replace(/\r\n/g, '\n').split('\n').join('\r\n') : sdp,
  };
  let localDescription = null;

  logger.log.INFO([mid, null, type, 'Received offer from peer. OFFER:'], message);

  try {
    updateStateInformation(state, message);

    setRemoteOffer(room, targetMid, remoteDescription)
      .then(peerConnection => onRemoteOfferSetSuccess(peerConnection, room, targetMid, remoteDescription))
      .catch(error => onRemoteOfferSetFailure(room, targetMid, remoteDescription, error))
      .then((answer) => {
        localDescription = {
          type: answer.type,
          sdp: answer.sdp,
        };
        return setLocalAnswer(room, targetMid, localDescription);
      })
      .then(peerConnection => onLocalAnswerSetSuccess(peerConnection, room, targetMid, localDescription))
      .catch(error => onLocalAnswerSetFailure(room, targetMid, localDescription, error));
  } catch (err) {
    logger.log.ERROR([mid, TAGS.SESSION_DESCRIPTION, type, 'Failed processing OFFER ->'], err);
  }
};

/**
 * Function that handles the remote offer and answer
 * @param {JSON} message
 * @memberOf SignalingMessageHandler
 * @fires HANDSHAKE_PROGRESS
 */
// eslint-disable-next-line import/prefer-default-export
export const offerAndAnswerHandler = (message) => {
  if (canProceed(message)) {
    switch (message.type) {
      case 'offer':
        onRemoteOffer(message);
        break;

      case 'answer':
        onRemoteAnswer(message);
        break;

      default:
          // should not come here
    }
  }
};
