import Skylink from '../../../index';
import { DATA_TRANSFER_SESSION_TYPE } from '../../../constants';

const getTransferData = (roomKey, transferId) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { dataTransfers } = state;

  if (!dataTransfers[transferId]) {
    return null;
  }

  if (dataTransfers[transferId].dataType === DATA_TRANSFER_SESSION_TYPE.BLOB) {
    const mimeType = {
      name: dataTransfers[transferId].name,
    };

    if (dataTransfers[transferId].mimeType) {
      mimeType.type = dataTransfers[transferId].mimeType;
    }

    // eslint-disable-next-line no-undef
    return new Blob(dataTransfers[transferId].chunks, mimeType);
  }

  return dataTransfers[transferId].chunks.join('');
};

export default getTransferData;
