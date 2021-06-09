import Skylink from '../../../../index';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { dataTransferState, onIncomingData } from '../../../../skylink-events';
import {
  DATA_TRANSFER_STATE, DATA_TRANSFER_DIRECTION, DATA_CHANNEL_MESSAGE_TYPE, TAGS,
} from '../../../../constants';
import dataTransferHelpers from '../../../../features/data-transfer/helpers';
import DataChannel from '../index';
import MESSAGES from '../../../../messages';
import logger from '../../../../logger';

const uploadData = (roomKey, peerId, transferId, channelProp, ackN, chunk) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { room, dataTransfers } = state;
  // sendChunkToDatachannel
  DataChannel.sendMessageToDataChannel(room.id, peerId, chunk, channelProp, DATA_CHANNEL_MESSAGE_TYPE.CHUNK);

  if (ackN < dataTransfers[transferId].chunks.length) {
    dispatchEvent(dataTransferState({
      state: DATA_TRANSFER_STATE.UPLOADING,
      transferId,
      peerId,
      transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
    }));
  }

  dataTransferHelpers.manageDataTransferTimeout(room.id, transferId, peerId, true);
};

const ACKProtocolHandler = (roomKey, peerId, data, channelProp) => {
  const updatedState = Skylink.getSkylinkState(roomKey);
  const { room, dataTransfers, peerDataChannels } = updatedState;
  let transferId = channelProp;

  if (channelProp === 'main') {
    // eslint-disable-next-line prefer-destructuring
    transferId = peerDataChannels[peerId].main.transferId;
  }

  dataTransferHelpers.manageDataTransferTimeout(room.id, transferId, peerId, false);

  if (data.ackN > -1) {
    if (data.ackN === 0) {
      logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, transferId,
        `${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_STATE} - ${DATA_TRANSFER_STATE.UPLOAD_STARTED}`]);

      dispatchEvent(dataTransferState({
        state: DATA_TRANSFER_STATE.UPLOAD_STARTED,
        transferId,
        peerId,
        transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
      }));
    } else if (dataTransfers[transferId] && data.ackN === dataTransfers[transferId].chunks.length) {
      updatedState.dataTransfers[transferId].sessions[peerId].ackN = data.ackN;

      dispatchEvent(dataTransferState({
        state: DATA_TRANSFER_STATE.UPLOAD_COMPLETED,
        transferId,
        peerId,
        transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
      }));

      dispatchEvent(onIncomingData({
        data: dataTransferHelpers.getTransferData(room.id, transferId),
        transferId,
        peerId,
        transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
        isSelf: true,
      }));

      return;
    }

    if (dataTransfers[transferId] && !dataTransfers[transferId].cancelled) {
    // chunk number greater than zero but less than completion
      dataTransfers[transferId].sessions[peerId].ackN = data.ackN;
      dataTransferHelpers.blobToBase64(dataTransfers[transferId].chunks[data.ackN])
        .then(base64BinaryString => uploadData(room.id, peerId, transferId, channelProp, data.ackN, base64BinaryString));
    }
  } else {
    dispatchEvent(dataTransferState({
      state: DATA_TRANSFER_STATE.REJECTED,
      transferId,
      peerId,
      transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
      error: {
        message: new Error(MESSAGES.DATA_CHANNEL.ERRORS.REMOTE_REJECTED_TRANSFER),
        transferType: DATA_TRANSFER_DIRECTION.UPLOAD,
      },
    }));
  }
};

export default ACKProtocolHandler;
