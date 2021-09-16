import Skylink from '../../../../index';
import renegotiateIfNeeded from '../../../../peer-connection/helpers/renegotiateIfNeeded';
import refreshConnection from '../../../../peer-connection/helpers/refresh-connection/refreshConnection';
import logger from '../../../../logger';
import { TAGS, HANDSHAKE_PROGRESS } from '../../../../constants';
import MESSAGES from '../../../../messages';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { handshakeProgress } from '../../../../skylink-events';
import { isEmptyArray } from '../../../../utils/helpers';
import { offerAndAnswerHandler } from './commons/offerAndAnswer';

const hasAppliedBufferedRemoteOffer = (updatedState, targetMid) => {
  if (updatedState.bufferedRemoteOffers[targetMid] && !isEmptyArray(updatedState.bufferedRemoteOffers[targetMid])) {
    const offerMessage = updatedState.bufferedRemoteOffers[targetMid].shift(); // the first buffered message
    logger.log.DEBUG([targetMid, 'RTCSessionDescription', offerMessage.type, MESSAGES.NEGOTIATION_PROGRESS.APPLYING_BUFFERED_REMOTE_OFFER], offerMessage);
    offerAndAnswerHandler(offerMessage);
    Skylink.setSkylinkState(updatedState, updatedState.room.id);
    return true;
  }

  return false;
};

/**
 * Method that handles the "answerAck" socket message received.
 * See confluence docs for the "answerAck" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @memberOf SignalingMessageHandler
 * @private
 * @since 1.0.0
 */
const answerAckHandler = (message) => {
  const { mid, rid, success } = message;
  const updatedState = Skylink.getSkylinkState(rid);
  const targetMid = mid;

  dispatchEvent(handshakeProgress({
    state: HANDSHAKE_PROGRESS.ANSWER_ACK,
    peerId: targetMid,
    room: updatedState.room,
  }));

  updatedState.peerConnections[targetMid].negotiating = false;
  Skylink.setSkylinkState(updatedState, rid);

  if (!success) {
    logger.log.ERROR([targetMid, TAGS.SESSION_DESCRIPTION, HANDSHAKE_PROGRESS.ANSWER, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.FAILED_SET_REMOTE_ANSWER]);
    return;
  }

  if (!hasAppliedBufferedRemoteOffer(updatedState, targetMid)) {
    renegotiateIfNeeded(updatedState, targetMid).then((shouldRenegotiate) => {
      if (shouldRenegotiate) {
        refreshConnection(updatedState, targetMid)
          .catch((error) => {
            logger.log.ERROR([mid, TAGS.SESSION_DESCRIPTION, HANDSHAKE_PROGRESS.ANSWER_ACK, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.FAILED_RENEGOTIATION], error);
          });
      }
    });
  }
};

export default answerAckHandler;
