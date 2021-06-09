import Skylink from '../../../../index';
import logger from '../../../../logger';
import { DATA_TRANSFER_STATE, TAGS } from '../../../../constants';
import MESSAGES from '../../../../messages';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { dataTransferState } from '../../../../skylink-events';
import dataTransferHelpers from '../../../../features/data-transfer/helpers';

const CANCELProtocolHandler = (roomKey, peerId, data, channelProp) => {
  const updatedState = Skylink.getSkylinkState(roomKey);
  const { room, peerDataChannels, dataTransfers } = updatedState;
  const transferId = channelProp === 'main' ? peerDataChannels[peerId].main.transferId : channelProp; // obtain transferId of the active transfer

  logger.log.ERROR([peerId, TAGS.DATA_CHANNEL, channelProp || null,
    MESSAGES.DATA_CHANNEL.ERRORS.CANCEL_TRANSFER], data);

  dataTransferHelpers.manageDataTransferTimeout(room.id, transferId, peerId, false);

  dispatchEvent(dataTransferState({
    state: DATA_TRANSFER_STATE.CANCEL,
    transferId,
    peerId,
    transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
    error: {
      message: data.content,
      transferType: dataTransfers[transferId] ? dataTransfers[transferId].direction : null,
    },
  }));
};

export default CANCELProtocolHandler;
