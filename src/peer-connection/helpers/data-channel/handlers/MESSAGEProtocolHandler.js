import logger from '../../../../logger';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { onIncomingMessage } from '../../../../skylink-events';
import PeerData from '../../../../peer-data';
import { TAGS } from '../../../../constants';
import MESSAGES from '../../../../messages';

/**
 * Function that handles the "MESSAGE" data transfer protocol.
 * @private
 * @lends PeerConnection
 * @param {SkylinkState} roomState
 * @param {string} peerId
 * @param {object} data
 * @param {string} channelProp
 * @since 2.0.0
 * @fires ON_INCOMING_MESSAGE
 */
const MESSAGEProtocolHandler = (roomState, peerId, data, channelProp) => {
  const senderPeerId = data.sender || peerId;
  logger.log.INFO([senderPeerId, TAGS.DATA_CHANNEL, channelProp, MESSAGES.DATA_CHANNEL.RECEIVED_P2P_MESSAGE], data);
  dispatchEvent(onIncomingMessage({
    room: roomState.room,
    message: {
      targetPeerId: data.target,
      content: data.data,
      senderPeerId,
      isDataChannel: true,
      isPrivate: data.isPrivate,
    },
    isSelf: false,
    peerId: senderPeerId,
    peerInfo: PeerData.getPeerInfo(senderPeerId, roomState.room),
  }));
};

export default MESSAGEProtocolHandler;
