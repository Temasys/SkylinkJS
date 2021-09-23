import Skylink from '../../../../../index';
import logger from '../../../../../logger';
import { NEGOTIATION_STATES, TAGS } from '../../../../../constants';
import SkylinkSignalingServer from '../../../index';
import PeerConnection from '../../../../../peer-connection/index';
import MESSAGES from '../../../../../messages';
import { onLocalDescriptionSetFailure, onRemoteDescriptionSetFailure } from './handleSetDescriptionFailure';
import { setPeerConnectionInState, onRemoteDescriptionSetSuccess, onLocalDescriptionSetSuccess } from './handleSetDescriptionSuccess';
import { setRemoteDescription, setLocalDescription } from './setSessionDescription';
import NegotiationState from '../../../negotiationState/negotiationState';

export const createAnswer = (state, targetMid) => PeerConnection.createAnswer(state, targetMid);

export const sendAnswer = (room, answer) => {
  const state = Skylink.getSkylinkState(room.id);
  new SkylinkSignalingServer().answer(state, answer);
};

export const createOffer = (room, targetMid, doIceRestart, restartOffer) => PeerConnection.createOffer(room, targetMid, doIceRestart, restartOffer);

export const sendOffer = (room, offer) => {
  const state = Skylink.getSkylinkState(room.id);
  new SkylinkSignalingServer().offer(state, offer);
};

export const sendRestartOffer = (state, peerId, doIceRestart) => {
  const { room } = state;
  const signaling = new SkylinkSignalingServer();

  try {
    const restartOfferMsg = signaling.messageBuilder.getRestartOfferMessage(room.id, peerId, doIceRestart);

    return createOffer(room, peerId, doIceRestart, restartOfferMsg)
      .then((offer) => {
        sendOffer(room, offer);
        NegotiationState.changeState(room.id, peerId, NEGOTIATION_STATES.LOCAL_OFFER_SENT);
        return peerId;
      });
  } catch (ex) {
    return [peerId, ex];
  }
};

export const setLocalOffer = (room, targetMid, localDescription) => setLocalDescription(room, targetMid, localDescription);

export const setLocalAnswer = (room, targetMid, localDescription) => setLocalDescription(room, targetMid, localDescription);

export const onLocalOfferSetSuccess = (RTCPeerConnection, room, targetMid, localDescription) => onLocalDescriptionSetSuccess(RTCPeerConnection, room, targetMid, localDescription);

export const onLocalAnswerSetSuccess = (RTCPeerConnection, room, targetMid, localDescription) => onLocalDescriptionSetSuccess(RTCPeerConnection, room, targetMid, localDescription);

export const onLocalOfferSetFailure = (room, targetMid, localDescription, error) => onLocalDescriptionSetFailure(room, targetMid, localDescription, error);

export const onLocalAnswerSetFailure = (room, targetMid, localDescription, error) => onLocalDescriptionSetFailure(room, targetMid, localDescription, error);

export const setRemoteOffer = (room, targetMid, remoteDescription) => setRemoteDescription(room, targetMid, remoteDescription);

export const setRemoteAnswer = (room, targetMid, remoteDescription) => setRemoteDescription(room, targetMid, remoteDescription);

export const sendAnswerAck = (room, targetMid, success) => {
  const state = Skylink.getSkylinkState(room.id);
  new SkylinkSignalingServer().answerAck(state, targetMid, success);
};

export const onRemoteOfferSetSuccess = (RTCPeerConnection, room, targetMid, remoteDescription) => {
  setPeerConnectionInState(RTCPeerConnection, room, targetMid);
  onRemoteDescriptionSetSuccess(RTCPeerConnection, room, targetMid, remoteDescription);
};

export const onRemoteAnswerSetSuccess = (RTCPeerConnection, room, targetMid, remoteDescription) => {
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
};

export const onRemoteOfferSetFailure = (room, targetMid, remoteDescription, error) => onRemoteDescriptionSetFailure(room, targetMid, remoteDescription, error);

export const onRemoteAnswerSetFailure = (room, targetMid, remoteDescription, error) => {
  onRemoteDescriptionSetFailure(room, targetMid, remoteDescription, error);

  sendAnswerAck(room, targetMid, false);
};
