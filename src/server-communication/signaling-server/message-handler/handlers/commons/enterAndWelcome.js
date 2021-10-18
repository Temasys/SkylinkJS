import Skylink from '../../../../../index';
import { TAGS } from '../../../../../constants';
import handleNegotiationStats from '../../../../../skylink-stats/handleNegotiationStats';
import logger from '../../../../../logger';
import messages from '../../../../../messages';
import parsers from '../../../parsers';
import NegotiationState from '../../../negotiationState/negotiationState';

/**
 * Function that parses the enter and welcome message and sends the welcome or offer message.
 * @param {JSON} message
 * @memberOf SignalingMessageHandler
 */
// eslint-disable-next-line consistent-return
const enterAndWelcomeHandler = (message) => {
  const parsedMsg = parsers.enterAndWelcome(message);
  const {
    rid, mid, publisherId,
  } = parsedMsg;
  const state = Skylink.getSkylinkState(rid);
  const { hasMCU, user } = state;
  const targetMid = hasMCU && publisherId ? publisherId : mid;

  if (!user.sid) {
    return logger.log.DEBUG([targetMid, TAGS.PEER_CONNECTION, null, [messages.SIGNALING.DROPPING_ENTER]]);
  }

  logger.log.INFO([targetMid, TAGS.PEER_CONNECTION, null, `Peer ${parsedMsg.type} received ->`], message);
  handleNegotiationStats.send(rid, parsedMsg.type, targetMid, message, true);

  if (parsedMsg.type === 'enter') {
    return NegotiationState.onEnterReceived(message);
  }

  if (parsedMsg.type === 'welcome') {
    return NegotiationState.onWelcomeReceived(message);
  }
};

export default enterAndWelcomeHandler;
