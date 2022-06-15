import { SIG_MESSAGE_TYPE } from '../../../../constants';

/**
 * @typedef peerListMessage
 * @property {SkylinkConstants.SIG_MESSAGE_TYPE.GET_PEERS} type
 * @property {boolean} showAll
 */

/**
 * @param {object} roomState
 * @param {boolean} showAll
 * @return {peerListMessage}
 * @memberOf SignalingMessageBuilder
 * @private
 */
const getPeerListMessage = (roomState, showAll) => ({
  type: SIG_MESSAGE_TYPE.GET_PEERS,
  showAll,
  rid: roomState.room.id,
});

export default getPeerListMessage;
