import { DATA_CHANNEL_STATE, TAGS } from '../../../constants';
import { onDataChannelStateChanged } from '../../../skylink-events';
import MESSAGES from '../../../messages';
import HandleDataChannelStats from '../../../skylink-stats/handleDataChannelStats';
import logger from '../../../logger';
import PeerConnection from '../../index';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import Skylink from '../../../index';

const closeFn = (roomState, peerId, channelNameProp) => {
  const { dataChannels } = roomState;
  const targetDataChannel = dataChannels[peerId][channelNameProp];
  const { channelName, channelType } = targetDataChannel.channelName;

  if (targetDataChannel.readyState !== DATA_CHANNEL_STATE.CLOSED) {
    const { room } = roomState;
    const handleDataChannelStats = new HandleDataChannelStats();
    logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, channelNameProp, MESSAGES.DATA_CHANNEL.CLOSING]);

    handleDataChannelStats.send(room.id, DATA_CHANNEL_STATE.CLOSING, peerId, targetDataChannel.channel, channelNameProp);

    dispatchEvent(onDataChannelStateChanged({
      room,
      peerId,
      state: DATA_CHANNEL_STATE.CLOSING,
      channelName,
      channelType,
      bufferAmount: PeerConnection.getDataChannelBuffer(targetDataChannel.channel),
    }));

    targetDataChannel.channel.close();

    delete dataChannels[peerId][channelNameProp];
  }
};

const closeAllDataChannels = (roomState, peerId) => {
  const { dataChannels } = roomState;
  const channelNameProp = Object.keys(dataChannels[peerId]);
  for (let i = 0; i < channelNameProp.length; i += 1) {
    if (Object.hasOwnProperty.call(dataChannels[peerId], channelNameProp[i])) {
      closeFn(roomState, peerId, channelNameProp[i]);
    }
  }

  delete dataChannels[peerId];
};

/**
 * Function that closes the datachannel.
 * @param {SkylinkState} roomState
 * @param {String} peerId - The Peer Id.
 * @param {String} [channelProp=main] - The channel property.
 * @memberOf PeerConnection.PeerConnectionHelpers
 * @fires DATA_CHANNEL_STATE
 */
const closeDataChannel = (roomState, peerId, channelProp = 'main') => {
  try {
    const updatedState = Skylink.getSkylinkState(roomState.room.id);
    const { dataChannels, room } = updatedState;

    if (!dataChannels[peerId] || !dataChannels[peerId][channelProp]) {
      logger.log.WARN([peerId, TAGS.DATA_CHANNEL, channelProp || null,
        MESSAGES.DATA_CHANNEL.ERRORS.NO_SESSIONS]);
      return;
    }

    if (channelProp === 'main') {
      closeAllDataChannels(updatedState, peerId);
      return;
    }

    closeFn(updatedState, peerId, channelProp);
    Skylink.setSkylinkState(updatedState, room.id);
  } catch (error) {
    logger.log.ERROR([peerId, TAGS.DATA_CHANNEL, channelProp || null,
      MESSAGES.DATA_CHANNEL.ERRORS.FAILED_CLOSING], error);
  }
};

export default closeDataChannel;
