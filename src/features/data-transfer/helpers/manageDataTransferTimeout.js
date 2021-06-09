import logger from '../../../logger';
import {
  DATA_TRANSFER_STATE, DATA_CHANNEL_MESSAGE_TYPE, TAGS, DC_PROTOCOL_TYPE,
} from '../../../constants';
import Skylink from '../../../index';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { dataTransferState } from '../../../skylink-events';
import dataTransferHelpers from './index';
import DataChannel from '../../../peer-connection/helpers/data-channel';
import MESSAGES from '../../../messages';

// eslint-disable-next-line consistent-return
const manageDataTransferTimeout = (roomKey, transferId, peerId, restartTimeout) => {
  const updatedState = Skylink.getSkylinkState(roomKey);
  const {
    room, user, dataTransfers, peerDataChannels,
  } = updatedState;


  if (!(dataTransfers[transferId] && dataTransfers[transferId].sessions[peerId])) {
    return logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, transferId, `${MESSAGES.DATA_CHANNEL.IGNORE_TIMEOUT} - ${MESSAGES.DATA_CHANNEL.ERRORS.NO_DATA_TRANSFER_SESSION}`]);
  }

  logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, transferId, MESSAGES.DATA_CHANNEL.CLEAR_TIMEOUT]);

  if (dataTransfers[transferId].sessions[peerId].timer) {
    clearTimeout(dataTransfers[transferId].sessions[peerId].timer);
  }

  dataTransfers[transferId].sessions[peerId].timer = null;

  if (restartTimeout) {
    logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, transferId, MESSAGES.DATA_CHANNEL.SET_TIMEOUT]);

    // eslint-disable-next-line consistent-return
    updatedState.dataTransfers[transferId].sessions[peerId].timer = setTimeout(() => {
      if (!(dataTransfers[transferId] && dataTransfers[transferId].sessions[peerId])) {
        return logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, transferId, `${MESSAGES.DATA_CHANNEL.IGNORE_TIMEOUT} - ${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_COMPLETED}`]);
      }

      if (!(user && user.sid)) {
        return logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, transferId, `${MESSAGES.DATA_CHANNEL.IGNORE_TIMEOUT} - ${MESSAGES.ROOM.ERRORS.NOT_IN_ROOM}`]);
      }

      if (!peerDataChannels[peerId]) {
        return logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, transferId, `${MESSAGES.DATA_CHANNEL.IGNORE_TIMEOUT} - ${MESSAGES.DATA_CHANNEL.NO_DATA_CHANNEL_CONNECTION}`]);
      }

      logger.log.ERROR([peerId, TAGS.DATA_CHANNEL, transferId, MESSAGES.DATA_CHANNEL.ERRORS.DATA_TRANSFER_TIMEOUT]);

      const timeoutMessage = `${MESSAGES.DATA_CHANNEL.ERRORS.DATA_TRANSFER_TIMEOUT} - Longer than ${dataTransfers[transferId].timeout}`;

      const channelProperty = 'main';
      DataChannel.sendMessageToDataChannel(room.id, peerId, {
        type: DC_PROTOCOL_TYPE.ERROR,
        content: timeoutMessage,
        sender: user.sid,
        name: dataTransfers[transferId].name,
      }, channelProperty, DATA_CHANNEL_MESSAGE_TYPE.PROTOCOL);

      dispatchEvent(dataTransferState({
        state: DATA_TRANSFER_STATE.ERROR,
        transferId,
        peerId,
        transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
        error: {
          message: new Error(timeoutMessage),
          transferType: dataTransfers[transferId].direction,
        },
      }));
    }, dataTransfers[transferId].timeout * 1000);
  }
};

export default manageDataTransferTimeout;
