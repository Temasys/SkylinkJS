
import Skylink from '../../../../index';
import logger from '../../../../logger';
import HandleSessionStats from '../../../../skylink-stats/handleSessionStats';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { introduceStateChange } from '../../../../skylink-events';
import { INTRODUCE_STATE_CHANGE } from '../../../../skylink-events/constants';

// TODO: Remove
/**
 * Function that handles the "introduceError" socket message received.
 * @param {JSON} message
 * @memberOf SignalingMessageHandler
 * @fires INTRODUCE_STATE_CHANGE
 */
const introduceErrorHandler = (message) => {
  const state = Skylink.getSkylinkState();
  const { room, user } = state;
  logger.log.WARN(['Server', null, message.type, `Introduce failed. Reason: ${message.reason}`]);

  const handleSessionStats = new HandleSessionStats();
  handleSessionStats.send(room.id, message);
  dispatchEvent(introduceStateChange({
    state: INTRODUCE_STATE_CHANGE.ERROR,
    privilegedPeerId: user.sid,
    receivingPeerId: message.receivingPeerId,
    sendingPeerId: message.sendingPeerId,
    reason: message.reason,
  }));
};

export default introduceErrorHandler;
