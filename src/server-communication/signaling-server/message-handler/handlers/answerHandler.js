import NegotiationState from '../../negotiationState/negotiationState';
import logger from '../../../../logger';

const answerHandler = (message) => {
  logger.log.INFO([message.mid, null, message.type, 'Received ANSWER from peer:'], message);
  NegotiationState.onAnswerReceived(message);
};

export default answerHandler;
