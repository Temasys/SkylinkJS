import { isEmptyArray } from '../../../../utils/helpers';
import { TAGS } from '../../../../constants';
import MESSAGES from '../../../../messages';
import logger from '../../../../logger';

const getBufferedRemoteOffer = (state, targetMid) => {
  if (state.bufferedRemoteOffers[targetMid] && !isEmptyArray(state.bufferedRemoteOffers[targetMid])) {
    const offerMessage = state.bufferedRemoteOffers[targetMid].shift(); // the first buffered message
    logger.log.DEBUG([targetMid, TAGS.SESSION_DESCRIPTION, offerMessage.type, MESSAGES.NEGOTIATION_PROGRESS.APPLYING_BUFFERED_REMOTE_OFFER], offerMessage);
    return offerMessage;
  }

  return null;
};

export default getBufferedRemoteOffer;
