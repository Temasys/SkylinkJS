import Skylink from '../../../../../index';
import {
  PEER_CERTIFICATE, PEER_CONNECTION_STATE, PEER_TYPE, TAGS,
} from '../../../../../constants';
import processPeer from './processPeer';
import SkylinkSignalingServer from '../../../index';
import handleNegotiationStats from '../../../../../skylink-stats/handleNegotiationStats';
import logger from '../../../../../logger';
import messages from '../../../../../messages';
import parsers from '../../../parsers';

export const CALLERS = {
  ENTER: 'enterHandler',
  WELCOME: 'welcomeHander',
};

const getNextNegotiationStep = (params) => {
  let method = 'welcome';

  if (params.caller === CALLERS.WELCOME) {
    const state = Skylink.getSkylinkState(params.currentRoom.id);
    const { peerMessagesStamps, peerPriorityWeight, hasMCU } = state;
    if (hasMCU || peerPriorityWeight > params.message.weight) {
      if (peerMessagesStamps[params.targetMid].hasWelcome) {
        method = 'noop';
        logger.log.WARN([params.targetMid, TAGS.PEER_CONNECTION, null, 'Discarding extra "welcome" received.']);
      } else {
        method = 'offer';
        state.peerMessagesStamps[params.targetMid].hasWelcome = true;
        Skylink.setSkylinkState(state, params.currentRoom.id);
      }
    }
  }
  return method;
};

// eslint-disable-next-line consistent-return
const checkStampBeforeSendingWelcome = (params) => {
  const { currentRoom, targetMid, message } = params;
  const state = Skylink.getSkylinkState(currentRoom.id);
  const { peerConnections, hasMCU } = state;
  const { STATS_MODULE, NEGOTIATION_PROGRESS, PEER_CONNECTION } = messages;
  const signaling = new SkylinkSignalingServer();
  const method = getNextNegotiationStep(params);

  if (method === 'offer') {
  // Added checks to ensure that connection object is defined first
    if (!peerConnections[targetMid]) {
      logger.log.WARN([targetMid, 'RTCSessionDescription', 'offer', PEER_CONNECTION.NO_PEER_CONNECTION]);
      handleNegotiationStats.send(currentRoom.id, STATS_MODULE.HANDLE_NEGOTIATION_STATS.OFFER.dropped, targetMid, message, false, PEER_CONNECTION.NO_PEER_CONNECTION);
      return null;
    }

    const { signalingState } = peerConnections[targetMid];

    // Added checks to ensure that state is "stable" if setting local "offer"
    if (signalingState !== PEER_CONNECTION_STATE.STABLE) {
      logger.log.WARN([targetMid, 'RTCSessionDescription', 'offer', NEGOTIATION_PROGRESS.ERRORS.NOT_STABLE], signalingState);
      handleNegotiationStats.send(currentRoom.id, STATS_MODULE.HANDLE_NEGOTIATION_STATS.OFFER.dropped, targetMid, message, false, NEGOTIATION_PROGRESS.ERRORS.NOT_STABLE);
      return null;
    }

    signaling[method](params.currentRoom, params.targetMid);
  } else if (!hasMCU) {
    signaling[method](params.currentRoom, params.targetMid);
  }
};

const logStats = (caller, targetMid, state, message) => {
  const { room } = state;

  let callerState = 'enter';
  if (caller === CALLERS.WELCOME) {
    callerState = 'welcome';
  }

  logger.log.INFO([targetMid, TAGS.PEER_CONNECTION, null, `Peer ${callerState} received ->`], message);
  handleNegotiationStats.send(room.id, callerState, targetMid, message, true);
};

/**
 * Function that parses the enterAndWelcome and welcome message and sends the offer or welcome message.
 * @param {JSON} message
 * @param {String} caller
 * @memberOf SignalingMessageHandler
 */
export const parseAndSendWelcome = (message, caller) => {
  const parsedMsg = parsers.enterAndWelcome(message);
  const {
    rid, mid, userInfo, publisherId,
  } = parsedMsg;
  const state = Skylink.getSkylinkState(rid);
  const { hasMCU } = state;
  const targetMid = hasMCU && publisherId ? publisherId : mid;
  const { RTCPeerConnection } = window;

  logStats(caller, targetMid, state, parsedMsg);

  let callerState = 'enter';
  if (caller === CALLERS.WELCOME) {
    callerState = 'welcome';
  }
  if (targetMid !== PEER_TYPE.MCU && hasMCU && state.publishOnly) {
    logger.log.WARN([targetMid, TAGS.PEER_CONNECTION, null, `Discarding ${callerState} for publishOnly case -> `], message);
    return;
  }

  const peerParams = {
    currentRoom: state.room,
    targetMid,
    userInfo,
    message: parsedMsg,
    caller,
  };

  if (state.peerConnectionConfig.certificate !== PEER_CERTIFICATE.AUTO && typeof RTCPeerConnection.generateCertificate === 'function') {
    let certOptions = {};
    if (state.peerConnectionConfig.certificate === PEER_CERTIFICATE.ECDSA) {
      certOptions = {
        name: 'ECDSA',
        namedCurve: 'P-256',
      };
    } else {
      certOptions = {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      };
    }
    RTCPeerConnection.generateCertificate(certOptions).then((cert) => {
      peerParams.cert = cert;
      processPeer(peerParams);
      checkStampBeforeSendingWelcome(peerParams);
    });
  } else {
    processPeer(peerParams);
    checkStampBeforeSendingWelcome(peerParams);
  }
};
