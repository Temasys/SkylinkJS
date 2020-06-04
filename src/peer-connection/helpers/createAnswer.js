import Skylink from '../../index';
import logger from '../../logger';
import { HANDSHAKE_PROGRESS, PEER_TYPE } from '../../constants';
import MediaStream from '../../media-stream/index';
import getCommonOfferAnswerMessage from '../../server-communication/signaling-server/message-builder/builders/commons/offerAndAnswer';
import handleNegotiationStats from '../../skylink-stats/handleNegotiationStats';
import MESSAGES from '../../messages';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { handshakeProgress } from '../../skylink-events';
import Room from '../../room';

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
    room: Room.getRoomInfo(roomState.room.id),
  }));
  reject(error);
};

/**
 * @param {SkylinkState} roomState
 * @param {String} targetMid
 * @return {*}
 * @memberOf PeerConnection.PeerConnectionHelpers
 * @fires HANDSHAKE_PROGRESS
 */
const createAnswer = (roomState, targetMid) => {
  const state = Skylink.getSkylinkState(roomState.room.id);
  const {
    peerConnections,
    hasMCU,
    voiceActivityDetection,
  } = state;
  const peerConnection = peerConnections[targetMid];

  const answerConstraints = {
    voiceActivityDetection,
  };

  logger.log.INFO([targetMid, null, null, 'Creating answer with config:'], answerConstraints);

  // Add stream only at offer/answer end
  if (!hasMCU || targetMid === PEER_TYPE.MCU) {
    MediaStream.addLocalMediaStreams(targetMid, roomState);
  }

  return new Promise((resolve, reject) => peerConnection.createAnswer(answerConstraints)
    .then(answer => onAnswerCreated(resolve, targetMid, roomState, answer))
    .catch(error => onAnswerFailed(reject, targetMid, roomState, error)));
};

export default createAnswer;
