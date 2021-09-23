import NegotiationState from '../../negotiationState/negotiationState';
import logger from '../../../../logger';

const offerHandler = (message) => {
  logger.log.INFO([message.mid, null, message.type, 'Received OFFER from peer:'], message);
  NegotiationState.onOfferReceived(message);
};

export default offerHandler;
