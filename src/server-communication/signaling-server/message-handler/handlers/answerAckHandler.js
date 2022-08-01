import Skylink from '../../../../index';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { handshakeProgress } from '../../../../skylink-events';
import NegotiationState from '../../negotiationState/negotiationState';
import logger from '../../../../logger';
import Room from '../../../../room';

/**
 * Method that handles the "answerAck" socket message received.
 * See confluence docs for the "answerAck" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @memberOf SignalingMessageHandler
 * @private
 * @since 1.0.0
 */
const answerAckHandler = (message) => {
  const { mid, rid, type } = message;
  const state = Skylink.getSkylinkState(rid);
  const targetMid = mid;

  logger.log.INFO([message.mid, null, message.type, 'Received ANSWER_ACK from peer:'], message);

  dispatchEvent(handshakeProgress({
    state: type,
    peerId: targetMid,
    room: Room.getRoomInfo(state.room),
  }));

  NegotiationState.onAnswerAckReceived(message);
};

export default answerAckHandler;
