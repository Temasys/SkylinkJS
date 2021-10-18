import Skylink from '../../../../index';
import { TAGS } from '../../../../constants';
import MESSAGES from '../../../../messages';
import logger from '../../../../logger';

const bufferRemoteOffer = (room, targetMid, offer) => {
  const updatedState = Skylink.getSkylinkState(room.id);
  logger.log.DEBUG([targetMid, TAGS.SESSION_DESCRIPTION, offer.type, MESSAGES.NEGOTIATION_PROGRESS.ERRORS.ADDING_REMOTE_OFFER_TO_BUFFER], offer);
  updatedState.bufferedRemoteOffers[targetMid] = updatedState.bufferedRemoteOffers[targetMid] ? updatedState.bufferedRemoteOffers[targetMid] : [];
  updatedState.bufferedRemoteOffers[targetMid].push(offer);
  Skylink.setSkylinkState(updatedState, room.id);
};

export default bufferRemoteOffer;
