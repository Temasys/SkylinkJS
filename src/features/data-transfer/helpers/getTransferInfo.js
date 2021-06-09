import Skylink from '../../../index';
import { DATA_TRANSFER_DIRECTION } from '../../../constants';
import dataTransferHelpers from './index';

const getTransferInfo = (roomKey, transferId, peerId) => {
  const updatedState = Skylink.getSkylinkState(roomKey);
  const { room, dataTransfers } = updatedState;

  if (dataTransfers[transferId]) {
    const {
      name, chunkSize, chunkType, dataType, mimeType, direction, timeout, isPrivate, percentage, originalSize, size,
    } = dataTransfers[transferId];

    const transferInfo = {
      name,
      size,
      chunkSize,
      chunkType,
      dataType,
      mimeType,
      direction,
      timeout,
      isPrivate,
      percentage,
      originalSize,
      data: null,
    };

    if (direction === DATA_TRANSFER_DIRECTION.DOWNLOAD && dataTransfers[transferId].sessions[peerId]) {
      // multiple methods to determine if receivedSize === size of sent data, not specific to the type of data i.e blob or Base64 string
      if (dataTransfers[transferId].sessions[peerId].receivedSize === transferInfo.size) {
        transferInfo.percentage = 100;
      } else {
        transferInfo.percentage = parseFloat(((dataTransfers[transferId].sessions[peerId].receivedSize / dataTransfers[transferId].size) * 100).toFixed(2));
      }
    } else if (direction === DATA_TRANSFER_DIRECTION.UPLOAD && dataTransfers[transferId].sessions[peerId]) {
      if (dataTransfers[transferId].chunks.length === dataTransfers[transferId].sessions[peerId].ackN) {
        transferInfo.percentage = 100;
      } else {
        transferInfo.percentage = parseFloat(((dataTransfers[transferId].sessions[peerId].ackN / dataTransfers[transferId].chunks.length) * 100).toFixed(2));
      }
    }

    if (transferInfo.percentage === 100) {
      transferInfo.data = dataTransferHelpers.getTransferData(room.id, transferId);
    }

    updatedState.dataTransfers[transferId].percentage = transferInfo.percentage;
    Skylink.setSkylinkState(updatedState, room.id);

    return transferInfo;
  }
  // log?
  return null;
};

export default getTransferInfo;
