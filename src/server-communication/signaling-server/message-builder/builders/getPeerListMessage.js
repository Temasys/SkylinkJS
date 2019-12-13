import { SIG_MESSAGE_TYPE } from '../../../../constants';


/**
 * @typedef peerListMessage
 * @property {SkylinkConstants.SIG_MESSAGE_TYPE.GET_PEERS} type
 * @property {boolean} showAll
 */

/**
 * @param {boolean} showAll
 * @return {peerListMessage}
 * @memberof SignalingMessageBuilder
 * @private
 */
const getPeerListMessage = showAll => ({
  type: SIG_MESSAGE_TYPE.GET_PEERS,
  showAll,
});

export default getPeerListMessage;
