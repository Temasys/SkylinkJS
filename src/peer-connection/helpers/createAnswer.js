import Skylink from '../../index';
import logger from '../../logger';
import { HANDSHAKE_PROGRESS, PEER_TYPE } from '../../constants';
import MediaStream from '../../media-stream/index';
import SessionDescription from '../../session-description';
import getCommonOfferAnswerMessage from '../../server-communication/signaling-server/message-builder/builders/commons/offerAndAnswer';
import handleNegotiationStats from '../../skylink-stats/handleNegotiationStats';
import MESSAGES from '../../messages';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { handshakeProgress } from '../../skylink-events';

const { STATS_MODULE: { HANDLE_NEGOTIATION_STATS } } = MESSAGES;

const onAnswerCreated = (resolve, targetMid, roomState, answer) => {
  const { room } = roomState;

  logger.log.DEBUG([targetMid, null, null, 'Created answer'], answer);
  handleNegotiationStats.send(room.id, HANDLE_NEGOTIATION_STATS.ANSWER.create, targetMid, answer, false);
  getCommonOfferAnswerMessage(resolve, targetMid, roomState, answer);
};

const onAnswerFailed = (reject, targetMid, roomState, error) => {
  const { room } = roomState;

  logger.log.ERROR([targetMid, null, null, 'Failed creating an answer:'], error);
  handleNegotiationStats.send(room.id, HANDLE_NEGOTIATION_STATS.ANSWER.create_error, targetMid, null, false, error);
  dispatchEvent(handshakeProgress({
    state: HANDSHAKE_PROGRESS.ERROR,
    peerId: targetMid,
    error,
    room: roomState.room,
  }));
  reject(error);
};

/**
 * @param {SkylinkState} roomState
 * @param {String} targetMid
 * @return {*}
 * @memberOf PeerConnection.PeerConnectionHelpers
 * @fires handshakeProgress
 */
const createAnswer = (roomState, targetMid) => {
  const state = Skylink.getSkylinkState(roomState.room.id);
  const {
    peerConnections,
    hasMCU,
    peerConnStatus,
    voiceActivityDetection,
  } = state;
  const peerConnection = peerConnections[targetMid];
  const { AdapterJS } = window;

  logger.log.INFO([targetMid, null, null, 'Creating answer with config:'], roomState.room.connection.sdpConstraints);

  const answerConstraints = AdapterJS.webrtcDetectedBrowser === 'edge' ? {
    offerToReceiveVideo: !(!state.sdpSettings.connection.audio && targetMid !== PEER_TYPE.MCU) && SessionDescription.getSDPCommonSupports(targetMid, peerConnection.remoteDescription, roomState.room.id).video,
    offerToReceiveAudio: !(!state.sdpSettings.connection.video && targetMid !== PEER_TYPE.MCU) && SessionDescription.getSDPCommonSupports(targetMid, peerConnection.remoteDescription, roomState.room.id).audio,
    voiceActivityDetection,
  } : undefined;

  // Add stream only at offer/answer end
  if (!hasMCU || targetMid === PEER_TYPE.MCU) {
    MediaStream.addLocalMediaStreams(targetMid, roomState);
  }

  if (peerConnStatus[targetMid]) {
    state.peerConnStatus[targetMid].sdpConstraints = answerConstraints;
  }

  // No ICE restart constraints for createAnswer as it fails in chrome 48
  // { iceRestart: true }
  return new Promise((resolve, reject) => {
    peerConnection.createAnswer(answerConstraints)
      .then(answer => onAnswerCreated(resolve, targetMid, roomState, answer))
      .catch(err => onAnswerFailed(reject, targetMid, roomState, err));
  });
};

export default createAnswer;
