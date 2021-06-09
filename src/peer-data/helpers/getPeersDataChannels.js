import { isEmptyObj } from '../../utils/helpers';
import { SkylinkConstants } from '../../index';
import PeerConnection from '../../peer-connection';

const hasPeerDataChannels = peerDataChannels => !isEmptyObj(peerDataChannels);

/**
 * @description Function that gets the current list of connected Peers Datachannel connections in the Room.
 * @private
 * @param {SkylinkState} roomState
 * @return {Object} listOfPeersDataChannels
 * @memberOf PeerDataHelpers
 */
const getPeersDataChannels = (roomState) => {
  const { peerDataChannels } = roomState;
  const listOfPeersDataChannels = {};
  const listOfPeers = Object.keys(peerDataChannels);

  for (let i = 0; i < listOfPeers.length; i += 1) {
    const peerId = listOfPeers[i];
    listOfPeersDataChannels[peerId] = {};

    if (hasPeerDataChannels(peerDataChannels)) {
      const channelProp = Object.keys(peerDataChannels[peerId]);
      for (let y = 0; y < channelProp.length; y += 1) {
        const channel = peerDataChannels[peerId][channelProp[y]];
        const {
          channelName,
          channelType,
          transferId,
          streamId,
        } = channel;
        let peerChannel = null;
        peerChannel = PeerConnection.getDataChannelBuffer(channel);
        peerChannel.channelProp = channelProp[y];
        peerChannel.channelName = channelName;
        peerChannel.channelType = channelType;
        peerChannel.currentTransferId = transferId;
        peerChannel.currentStreamId = streamId;
        peerChannel.readyState = channel.channel
          ? channel.channel.readyState : SkylinkConstants.DATA_CHANNEL_STATE.CREATE_ERROR;

        listOfPeersDataChannels[peerId][channelName] = peerChannel;
      }
    }
  }

  return listOfPeersDataChannels;
};

export default getPeersDataChannels;
