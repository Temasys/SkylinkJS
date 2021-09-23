import logger from '../../../../logger';
import { TAGS } from '../../../../constants';
import handleNegotiationStats from '../../../../skylink-stats/handleNegotiationStats';
import MESSAGES from '../../../../messages';

const logInfoOrErrorAndSendStats = (targetMid, type, room, negoMsg, isRemote, message, debugObj) => ({
  DEBUG: () => {
    logger.log.DEBUG([targetMid, TAGS.NEGOTIATION, type, message], debugObj);

    return handleNegotiationStats.send(room.id, MESSAGES.STATS_MODULE.HANDLE_NEGOTIATION_STATS[type.toUpperCase()].dropped, targetMid, negoMsg, isRemote, message);
  },
  ERROR: () => {
    logger.log.ERROR([targetMid, TAGS.NEGOTIATION, type, message], debugObj || null);

    return handleNegotiationStats.send(room.id, MESSAGES.STATS_MODULE.HANDLE_NEGOTIATION_STATS[type.toUpperCase()].error, targetMid, negoMsg, isRemote, message);
  },
});

export default logInfoOrErrorAndSendStats;
