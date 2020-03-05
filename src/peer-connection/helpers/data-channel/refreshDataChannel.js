import MESSAGES from '../../../messages';
import { isEmptyObj } from '../../../utils/helpers';
import PeerConnection from '../../index';
import logger from '../../../logger';
import { PEER_CONNECTION_STATE, HANDSHAKE_PROGRESS, DATA_CHANNEL_TYPE } from '../../../constants';

const hasPeerDataChannels = dataChannels => !isEmptyObj(dataChannels);

/**
 * Function that refreshes the main messaging Datachannel.
 * @param {SkylinkState} state
 * @param {String} peerId
 * @memberOf PeerConnection
 */
const refreshDataChannel = (state, peerId) => {
  const { dataChannels, peerConnections } = state;

  if (hasPeerDataChannels(dataChannels) && Object.hasOwnProperty.call(dataChannels, peerId)) {
    if (Object.hasOwnProperty.call(dataChannels[peerId], 'main')) {
      const mainDataChannel = dataChannels[peerId].main;
      const { channelName, channelType } = mainDataChannel;
      const bufferThreshold = mainDataChannel.channel.bufferedAmountLowThreshold || 0;

      if (channelType === DATA_CHANNEL_TYPE.MESSAGING) {
        setTimeout(() => {
          if (Object.hasOwnProperty.call(peerConnections, peerId)) {
            if (peerConnections[peerId].signalingState !== PEER_CONNECTION_STATE.CLOSED && peerConnections[peerId].localDescription.type === HANDSHAKE_PROGRESS.OFFER) {
              PeerConnection.closeDataChannel(state, peerId);
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
