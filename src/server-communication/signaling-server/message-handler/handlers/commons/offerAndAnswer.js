/* eslint-disable no-unused-vars,no-multi-assign */
import Skylink from '../../../../../index';
import logger from '../../../../../logger';
import { PEER_CONNECTION_STATE, HANDSHAKE_PROGRESS, DATA_CHANNEL_STATE } from '../../../../../constants';
import IceConnection from '../../../../../ice-connection/index';
import SkylinkSignalingServer from '../../../index';
import PeerConnection from '../../../../../peer-connection/index';
import { handshakeProgress } from '../../../../../skylink-events';
import { dispatchEvent } from '../../../../../utils/skylinkEventManager';
import handleNegotiationStats from '../../../../../skylink-stats/handleNegotiationStats';
import MESSAGES from '../../../../../messages';
import PeerMedia from '../../../../../peer-media/index';

const handleSetOfferAndAnswerSuccess = (state, targetMid, description, isRemote) => {
  const { STATS_MODULE: { HANDLE_NEGOTIATION_STATS } } = MESSAGES;
  const { peerConnections, bufferedLocalOffer, room } = state;
  const peerConnection = peerConnections[targetMid];
  const msgType = description.type === 'offer' ? 'OFFER' : 'ANSWER';

  handleNegotiationStats.send(room.id, HANDLE_NEGOTIATION_STATS[msgType].set, targetMid, description, isRemote);

  dispatchEvent(handshakeProgress({
    state: HANDSHAKE_PROGRESS[msgType],
    peerId: targetMid,
    room,
  }));

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
  const { room } = state;
  const { STATS_MODULE: { HANDLE_NEGOTIATION_STATS } } = MESSAGES;
  const msgType = description.type === 'offer' ? 'OFFER' : 'ANSWER';

  handleNegotiationStats.send(room.id, HANDLE_NEGOTIATION_STATS[msgType].set_error, targetMid, description, isRemote, error);

  dispatchEvent(handshakeProgress({
    state: HANDSHAKE_PROGRESS.ERROR,
    peerId: targetMid,
    error,
    room,
  }));
};

const mungeSDP = () => {
  // modifying the remote description received
  // TODO: Below SDP methods needs to be implemented in the SessionDescription Class.
  // sessionDescriptionToSet.sdp = SessionDescription.removeSDPFilteredCandidates(targetMid, sessionDescriptionToSet, message.rid);
  // sessionDescriptionToSet.sdp = SessionDescription.setSDPCodec(targetMid, sessionDescriptionToSet, message.rid);
  // sessionDescriptionToSet.sdp = SessionDescription.setSDPBitrate(targetMid, sessionDescriptionToSet, message.rid);
  // sessionDescriptionToSet.sdp = SessionDescription.setSDPCodecParams(targetMid, sessionDescriptionToSet, message.rid);
  // sessionDescriptionToSet.sdp = SessionDescription.removeSDPCodecs(targetMid, sessionDescriptionToSet, message.rid);
  // sessionDescriptionToSet.sdp = SessionDescription.removeSDPREMBPackets(targetMid, sessionDescriptionToSet, message.rid);
  // sessionDescriptionToSet.sdp = SessionDescription.handleSDPConnectionSettings(targetMid, sessionDescriptionToSet, message.rid, 'remote');
  // sessionDescriptionToSet.sdp = SessionDescription.removeSDPUnknownAptRtx(targetMid, sessionDescriptionToSet, message.rid);

  // if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
  //   SessionDescription.setOriginalDTLSRole(state, sessionDescriptionToSet, true);
  // }

  // logger.log.INFO([targetMid, 'RTCSessionDescription', type, `Updated remote ${type} ->`], sessionDescriptionToSet.sdp);
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
  const { peerConnections, user } = state;
  const peerConnection = peerConnections[targetMid] = RTCPeerConnection;

  logger.log.DEBUG([targetMid, 'RTCSessionDescription', localDescription.type, 'SUCCESS: Local session description has been set ->'], localDescription);

  peerConnection.processingLocalSDP = false;
  handleSetOfferAndAnswerSuccess(state, targetMid, localDescription, false);

  // FIXME: to check if this apply to local offer only or local answer as well?
  // if (!initOptions.enableIceTrickle && !peerConnection.gathered) {
  //   logger.log.WARN([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Local session description sending is halted to complete ICE gathering.']);
  //   return;
  // }
};

const onLocalDescriptionSetFailure = (room, targetMid, localDescription, error) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;
  const peerConnection = peerConnections[targetMid];
  const { STATS_MODULE: { HANDLE_NEGOTIATION_STATS } } = MESSAGES;

  logger.log.ERROR([targetMid, 'RTCSessionDescription', localDescription.type, 'FAILED: Set local description -> '], error);

  peerConnection.processingLocalSDP = false;
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

  logger.log.INFO([targetMid, 'RTCSessionDescription', type, 'Session description object created:'], remoteDescription);

  handleNegotiationStats.send(room.id, STATS_MODULE.HANDLE_NEGOTIATION_STATS[msgType][type], targetMid, remoteDescription, true);

  return peerConnection.setRemoteDescription(remoteDescription)
    .then(() => peerConnection);
};

const onRemoteDescriptionSetSuccess = (RTCPeerConnection, room, targetMid, remoteDescription) => {
  const signaling = new SkylinkSignalingServer();
  const { type } = remoteDescription;

  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;
  const peerConnection = peerConnections[targetMid] = RTCPeerConnection;

  logger.log.DEBUG([targetMid, 'RTCSessionDescription', type, 'SUCCESS: Remote session description has been set ->'], remoteDescription);

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
    logger.log.WARN([targetMid, 'RTCPeerConnection', null, 'Closing all datachannels as they were rejected.']);
    PeerConnection.closeDataChannel(state, targetMid);
  }

  handleSetOfferAndAnswerSuccess(state, targetMid, remoteDescription, true);
  signaling.answerAck(state, targetMid, true);
  return true;
};

const onRemoteDescriptionSetFailure = (room, targetMid, remoteDescription, error) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections } = state;
  const peerConnection = peerConnections[targetMid];
  const { type } = remoteDescription;

  logger.log.ERROR([targetMid, 'RTCSessionDescription', type, 'FAILED: Set remote description -> '], {
    error,
    state: peerConnection.signalingState,
    [type]: remoteDescription,
  });

  peerConnection.processingRemoteSDP = false;
  handleSetOfferAndAnswerFailure(state, targetMid, remoteDescription, true, error);

  if (type === 'answer') {
    const signaling = new SkylinkSignalingServer();
    signaling.answerAck(state, targetMid, false);
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

  Skylink.setSkylinkState(updatedState, rid);
};

const hasError = (state, message) => {
  const {
    weight, type, mid, sdp, resend,
  } = message;
  const {
    peerPriorityWeight, bufferedLocalOffer, room, processingRemoteSDP, peerConnections,
  } = state;
  const targetMid = mid;
  const { STATS_MODULE, NEGOTIATION_PROGRESS } = MESSAGES;
  const msgType = type === 'offer' ? 'OFFER' : 'ANSWER';
  let error = null;

  if (!peerConnections[targetMid]) {
    logger.log.ERROR([targetMid, null, type, `${NEGOTIATION_PROGRESS.ERRORS.no_peer_connection}. Unable to set${type === 'offer' ? 'Remote' : 'Local'}Offer.`]);
    error = NEGOTIATION_PROGRESS.ERRORS.no_peer_connection;
  }

  if (type === 'offer' && peerConnections[targetMid].signalingState !== PEER_CONNECTION_STATE.STABLE) {
    logger.log.WARN([targetMid, null, type, NEGOTIATION_PROGRESS.ERRORS.not_stable], {
      signalingState: peerConnections[targetMid].signalingState,
      isRestart: !!resend,
    });
    error = `Peer connection state is ${peerConnections[targetMid].signalingState}.`;
  }

  if (processingRemoteSDP) {
    logger.log.WARN([targetMid, 'RTCSessionDescription', type, NEGOTIATION_PROGRESS.ERRORS.processing_existing_sdp], sdp);
    error = NEGOTIATION_PROGRESS.ERRORS.processing_existing_sdp;
  }

  if (type === 'offer' && bufferedLocalOffer[targetMid] && peerPriorityWeight > weight) {
    logger.log.WARN([targetMid, null, type, NEGOTIATION_PROGRESS.ERRORS.offer_tiebreaker], {
      selfWeight: peerPriorityWeight,
      messageWeight: weight,
    });
    error = NEGOTIATION_PROGRESS.ERRORS.offer_tiebreaker;
  }

  if (error) {
    handleNegotiationStats.send(room.id, STATS_MODULE.HANDLE_NEGOTIATION_STATS[msgType].dropped, targetMid, message, true, error);
  }

  return !!error;
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

  if (!hasError(state, message)) {
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
        logger.log.ERROR([targetMid, 'RTCPeerConnection', null, NEGOTIATION_PROGRESS.ERRORS.no_local_buffered_offer]);
      }
    } catch (error) {
      logger.log.ERROR([targetMid, 'RTCSessionDescription', type, `Failed processing ${msgType} ->`], error);
    }
  }

  return null;
};
