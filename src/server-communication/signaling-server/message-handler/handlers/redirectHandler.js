import logger from '../../../../logger';
import { SYSTEM_ACTION } from '../../../../constants';
import { disconnect } from '../../../../utils/helpers';
import SkylinkStates from '../../../../skylink-states';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { systemAction } from '../../../../skylink-events';
import Skylink from '../../../../index';
import HandleSessionStats from '../../../../skylink-stats/handleSessionStats';

/**
 * Handles the "redirect" message from the Signaling server.
 * @param {JSON} message
 * @private
 */
export const redirectHandler = (message) => {
  const {
    action, info, reason, rid, type,
  } = message;

  logger.log.INFO(['Server', null, type, 'System action warning:'], message);

  if (Object.keys((new SkylinkStates()).getAllStates()).length > 1 && action === SYSTEM_ACTION.REJECT) {
    disconnect();
  }

  Skylink.removeSkylinkState(Skylink.getSkylinkState(rid));

  new HandleSessionStats().send(rid, message);

  dispatchEvent(systemAction({
    action,
    info,
    reason,
    rid,
  }));
};

export default redirectHandler;
