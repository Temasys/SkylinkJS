/* eslint-disable no-underscore-dangle */
import Skylink from '../../../index';
import negotiationStateHelpers from './helpers';
import { NEGOTIATION_STATES, PEER_TYPE } from '../../../constants';
import SkylinkSignalingServer from '../index';
import MESSAGES from '../../../messages';
import {
  createAnswer,
  onLocalAnswerSetFailure,
  onLocalAnswerSetSuccess,
  onRemoteOfferSetFailure,
  onRemoteOfferSetSuccess,
  sendAnswer,
  setLocalAnswer,
  setRemoteOffer,
  setLocalOffer,
  onLocalOfferSetSuccess,
  onLocalOfferSetFailure,
  setRemoteAnswer,
  onRemoteAnswerSetSuccess,
  onRemoteAnswerSetFailure,
  sendAnswerAck, createOffer, sendOffer,
} from '../message-handler/handlers/commons/offerAndAnswer';
import refreshConnection from '../../../peer-connection/helpers/refresh-connection/refreshConnection';
import peerConnectionHelpers from '../../../peer-connection/helpers/index';
import bufferRemoteOffer from './helpers/bufferRemoteOffer';

class NegotiationState {
  static _changeState(roomKey, peerId, newState) {
    const updatedState = Skylink.getSkylinkState(roomKey);
    updatedState.negotiationState[peerId] = newState;
    Skylink.setSkylinkState(updatedState, roomKey);
  }

  static _getState(roomKey, peerId) {
    const state = Skylink.getSkylinkState(roomKey);
    return state.negotiationState[peerId];
  }

  static clearState(roomKey, peerId) {
    const updatedState = Skylink.getSkylinkState(roomKey);
    delete updatedState.negotiationState[peerId];
    Skylink.setSkylinkState(updatedState, roomKey);
  }

  static changeState(roomKey, peerId, newState) {
    return this._changeState(roomKey, peerId, newState);
  }

  static getState(roomKey, peerId) {
    return this._getState(roomKey, peerId);
  }

  static onEnterReceived(enter) {
    const {
      rid, mid, publisherId,
    } = enter;
    const state = Skylink.getSkylinkState(rid);
    const { hasMCU, room } = state;
    const targetMid = hasMCU && publisherId ? publisherId : mid;

    // peer Connection does not exist
    if (!state.peerConnections[targetMid]) {
      this._changeState(rid, targetMid, NEGOTIATION_STATES.ENTERING);
      // process the new peer
      negotiationStateHelpers.processNewPeer(enter);

      this._changeState(rid, targetMid, NEGOTIATION_STATES.WELCOMING);

      const signaling = new SkylinkSignalingServer();
      signaling.welcome(room, targetMid);
    }
  }

  static onWelcomeReceived(welcome) {
    const {
      rid, mid, publisherId, type,
    } = welcome;
    const state = Skylink.getSkylinkState(rid);
    const { hasMCU, room } = state;
    const targetMid = hasMCU && publisherId ? publisherId : mid;

    const negState = this._getState(rid, targetMid);
    if (negState) { // it should be undefined as this will be the first message from the remote peer
      return negotiationStateHelpers.logInfoOrErrorAndSendStats(targetMid, type, room, welcome, true, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.DROPPING_WELCOME_NEG_STATE, `Current state: ${negState}`).DEBUG();
    }

    if (hasMCU && targetMid !== PEER_TYPE.MCU) { // welcome forwarded by signaling server
      return negotiationStateHelpers.logInfoOrErrorAndSendStats(targetMid, type, room, welcome, true, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.DROPPING_WELCOME_MCU_FORWARDED, `Current state: ${negState}`).DEBUG();
    }

    // peer Connection does not exist
    if (!state.peerConnections[targetMid]) {
      // process the new peer
      negotiationStateHelpers.processNewPeer(welcome);

      return createOffer(room, targetMid)
        .then((offer) => {
          this._changeState(rid, targetMid, NEGOTIATION_STATES.LOCAL_OFFER_SENT);
          sendOffer(room, offer);
        });
    }

    return false;
  }

  static onOfferReceived(offer) {
    const {
      rid, mid, publisherId, weight, type, sdp,
    } = offer;
    const state = Skylink.getSkylinkState(rid);
    const { hasMCU, room, peerPriorityWeight } = state;
    const targetMid = hasMCU && publisherId ? publisherId : mid;
    const remoteDescription = {
      type,
      sdp: hasMCU ? sdp.replace(/\r\n/g, '\n').split('\n').join('\r\n') : sdp,
    };
    let localDescription;
    let answer;

    const negState = this._getState(rid, targetMid);

    if (negState === NEGOTIATION_STATES.LOCAL_OFFER_SENT && peerPriorityWeight > weight) {
      return negotiationStateHelpers.logInfoOrErrorAndSendStats(targetMid, type, room, offer, true, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.OFFER_TIEBREAKER, {
        selfWeight: peerPriorityWeight,
        messageWeight: weight,
      }).DEBUG();
    }

    if (!(negState === NEGOTIATION_STATES.WELCOMING || negState === NEGOTIATION_STATES.NEGOTIATED || negState === NEGOTIATION_STATES.LOCAL_OFFER_SENT)) {
      return bufferRemoteOffer(room, targetMid, offer);
    }

    this._changeState(rid, targetMid, NEGOTIATION_STATES.REMOTE_OFFER_RECEIVED);

    try {
      negotiationStateHelpers.updateStateInformation(state, offer);

      return setRemoteOffer(room, targetMid, remoteDescription)
        .then((peerConnection) => {
          this._changeState(rid, targetMid, NEGOTIATION_STATES.REMOTE_OFFER_SET);

          onRemoteOfferSetSuccess(peerConnection, room, targetMid, remoteDescription);

          return createAnswer(state, targetMid);
        })
        .catch(error => onRemoteOfferSetFailure(room, targetMid, remoteDescription, error))
        .then((ans) => {
          answer = ans;
          localDescription = {
            type: answer.type,
            sdp: answer.sdp,
          };

          return setLocalAnswer(room, targetMid, localDescription);
        })
        .then((peerConnection) => {
          this._changeState(rid, targetMid, NEGOTIATION_STATES.LOCAL_ANSWER_SET);

          onLocalAnswerSetSuccess(peerConnection, room, targetMid, localDescription);

          sendAnswer(room, answer);
        })
        .catch(error => onLocalAnswerSetFailure(room, targetMid, localDescription, error));
    } catch (error) {
      return negotiationStateHelpers.logInfoOrErrorAndSendStats(mid, type, room, answer, true, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.FAILED_PROCESSING_OFFER, error).ERROR();
    }
  }

  static onAnswerReceived(answer) {
    const {
      rid, mid, publisherId, type, sdp,
    } = answer;
    const state = Skylink.getSkylinkState(rid);
    const {
      hasMCU, room, bufferedLocalOffer,
    } = state;
    const targetMid = hasMCU && publisherId ? publisherId : mid;

    const negState = this._getState(rid, targetMid);
    if (negState !== NEGOTIATION_STATES.LOCAL_OFFER_SENT) {
      return negotiationStateHelpers.logInfoOrErrorAndSendStats(targetMid, type, room, answer, true, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.DROPPING_ANSWER, `Current state: ${negState}`).DEBUG();
    }

    if (!bufferedLocalOffer[targetMid]) {
      return negotiationStateHelpers.logInfoOrErrorAndSendStats(targetMid, type, room, answer, true, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.NO_LOCAL_BUFFERED_OFFER).ERROR();
    }

    this._changeState(rid, targetMid, NEGOTIATION_STATES.REMOTE_ANSWER_RECEIVED);

    try {
      negotiationStateHelpers.updateStateInformation(state, answer);

      const localDescription = bufferedLocalOffer[targetMid];
      const remoteDescription = {
        type,
        sdp: hasMCU ? sdp.replace(/\r\n/g, '\n').split('\n').join('\r\n') : sdp,
      };

      return setLocalOffer(room, targetMid, localDescription)
        .then((peerConnection) => {
          this._changeState(rid, targetMid, NEGOTIATION_STATES.LOCAL_OFFER_SET);

          return onLocalOfferSetSuccess(peerConnection, room, targetMid, localDescription);
        })
        .catch(error => onLocalOfferSetFailure(room, targetMid, localDescription, error))
        .then(() => setRemoteAnswer(room, targetMid, remoteDescription))
        .then((peerConnection) => {
          this._changeState(rid, targetMid, NEGOTIATION_STATES.REMOTE_ANSWER_SET);

          return onRemoteAnswerSetSuccess(peerConnection, room, targetMid, remoteDescription);
        })
        .catch(error => onRemoteAnswerSetFailure(room, targetMid, remoteDescription, error))
        .then(() => {
          this._changeState(rid, targetMid, NEGOTIATION_STATES.NEGOTIATED);
          sendAnswerAck(room, targetMid, true);
          return negotiationStateHelpers.checkAndApplyBufferedRestart(room, targetMid);
        });
    } catch (error) {
      return negotiationStateHelpers.logInfoOrErrorAndSendStats(mid, type, room, answer, true, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.FAILED_PROCESSING_ANSWER, error).ERROR();
    }
  }

  static onAnswerAckReceived(answerAck) {
    const {
      rid, mid, publisherId, type, success,
    } = answerAck;
    const state = Skylink.getSkylinkState(rid);
    const { hasMCU, room } = state;
    const targetMid = hasMCU && publisherId ? publisherId : mid;
    const peerConnection = state.peerConnections[targetMid];

    const negState = this._getState(rid, targetMid);
    if (negState !== NEGOTIATION_STATES.LOCAL_ANSWER_SET) {
      return negotiationStateHelpers.logInfoOrErrorAndSendStats(targetMid, type, room, answerAck, true, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.DROPPING_ANSWER_ACK, `Current state: ${negState}`).DEBUG();
    }

    if (!success) {
      return negotiationStateHelpers.logInfoOrErrorAndSendStats(mid, type, room, answerAck, true, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.FAILED_SET_REMOTE_ANSWER).ERROR();
    }

    this._changeState(rid, targetMid, NEGOTIATION_STATES.NEGOTIATED);

    try {
      const bufferedOffer = negotiationStateHelpers.getBufferedRemoteOffer(state, targetMid);

      if (bufferedOffer) {
        return this.onOfferReceived(bufferedOffer);
      }

      return peerConnectionHelpers.renegotiateIfNeeded(state, targetMid).then((shouldRenegotiate) => {
        if (shouldRenegotiate) {
          console.log("-------- RENEGOTIATE setRemoteDescriptionSuccess set to null --------", peerConnection.setRemoteDescriptionSuccess);
          peerConnection.setRemoteDescriptionSuccess = null;

          refreshConnection(state, targetMid)
            .catch(error => negotiationStateHelpers.logInfoOrErrorAndSendStats(mid, type, room, answerAck, true, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.FAILED_RENEGOTIATION, error).ERROR());
        } else {
          negotiationStateHelpers.checkAndApplyBufferedRestart(room, targetMid);
        }
      });
    } catch (error) {
      return negotiationStateHelpers.logInfoOrErrorAndSendStats(mid, type, room, answerAck, true, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.FAILED_PROCESSING_ANSWER_ACK, error).ERROR();
    }
  }
}

export default NegotiationState;
