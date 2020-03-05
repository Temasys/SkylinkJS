import logger from '../../../../logger';
import { SYSTEM_ACTION } from '../../../../constants';
import { disconnect } from '../../../../utils/helpers';
import SkylinkStates from '../../../../skylink-states';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { systemAction } from '../../../../skylink-events';
import Skylink from '../../../../index';

/**
 * Handles the "redirect" message from the Signaling server.
 * @param {JSON} message
 * @private
 */
export const redirectHandler = (message) => {
  logger.log.INFO(['Server', null, message.type, 'System action warning:'], message);

  if (Object.keys((new SkylinkStates()).getAllStates()).length > 1 && message.action === SYSTEM_ACTION.REJECT) {
    disconnect();
  }

  if (message.reason === 'toClose') {
    // eslint-disable-next-line no-param-reassign
    message.reason = 'toclose';
  }

  Skylink.removeSkylinkState(Skylink.getSkylinkState(message.rid));
  // removeRoomStateByState(new SkylinkStates().getState(message.rid));

  dispatchEvent(systemAction({
    action: message.action,
    info: message.info,
    reason: message.reason,
    rid: message.rid,
  }));
};

export default redirectHandler;
