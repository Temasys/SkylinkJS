import MESSAGES from '../../../messages';
import { isEmptyObj } from '../../../utils/helpers';
import PeerConnection from '../../index';
import logger from '../../../logger';
import { PEER_CONNECTION_STATE, HANDSHAKE_PROGRESS, DATA_CHANNEL_TYPE } from '../../../constants';

const hasPeerDataChannels = peerDataChannels => !isEmptyObj(peerDataChannels);

/**
 * Function that refreshes the main messaging Datachannel.
 * @param {SkylinkState} state
 * @param {String} peerId
 * @memberOf PeerConnection
 */
const refreshDataChannel = (state, peerId) => {
  const { room, peerDataChannels, peerConnections } = state;

  if (hasPeerDataChannels(peerDataChannels) && Object.hasOwnProperty.call(peerDataChannels, peerId)) {
    if (Object.hasOwnProperty.call(peerDataChannels[peerId], 'main')) {
      const mainDataChannel = peerDataChannels[peerId].main;
      const { channelName, channelType } = mainDataChannel;
      const bufferThreshold = mainDataChannel.channel.bufferedAmountLowThreshold || 0;

      if (channelType === DATA_CHANNEL_TYPE.MESSAGING) {
        setTimeout(() => {
          if (Object.hasOwnProperty.call(peerConnections, peerId)) {
            if (peerConnections[peerId].signalingState !== PEER_CONNECTION_STATE.CLOSED && peerConnections[peerId].localDescription.type === HANDSHAKE_PROGRESS.OFFER) {
              PeerConnection.closeDataChannel(room.id, peerId);
              logger.log.DEBUG([peerId, 'RTCDataChannel', 'main', MESSAGES.DATA_CHANNEL.reviving_dataChannel]);
              PeerConnection.createDataChannel({
                roomState: state,
                peerId,
                dataChannel: channelName,
                bufferThreshold,
                createAsMessagingChannel: true,
              });
            }
          }
        }, 100);
      }
    }
  } else {
    logger.log.DEBUG([peerId, 'RTCDataChannel', MESSAGES.DATA_CHANNEL.refresh_error]);
  }
};

export default refreshDataChannel;
