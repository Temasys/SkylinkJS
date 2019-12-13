import Skylink from '../../../../index';
import renegotiateIfNeeded from '../../../../peer-connection/helpers/renegotiateIfNeeded';
import refreshConnection from '../../../../peer-connection/helpers/refresh-connection/refreshConnection';

/**
 * Method that handles the "answerAck" socket message received.
 * See confluence docs for the "answerAck" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @memberof SignalingMessageHandler
 * @private
 * @since 1.0.0
 */
const answerAckHandler = (message) => {
  const { mid, rid } = message;
  const state = Skylink.getSkylinkState(rid);
  renegotiateIfNeeded(state, mid).then((shouldRenegotiate) => {
    if (shouldRenegotiate) {
      refreshConnection(state, mid)
        .catch(error => console.log(error));
    }
  });
};

export default answerAckHandler;
