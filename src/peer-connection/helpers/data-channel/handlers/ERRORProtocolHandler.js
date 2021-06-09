import Skylink from '../../../../index';
import dataTransferHelpers from '../../../../features/data-transfer/helpers/index';
import logger from '../../../../logger';
import { DATA_TRANSFER_STATE, TAGS } from '../../../../constants';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { dataTransferState } from '../../../../skylink-events';
import MESSAGES from '../../../../messages';

const ERRORProtocolHandler = (roomKey, peerId, data, channelProp) => {
  const updatedState = Skylink.getSkylinkState(roomKey);
  const { room, peerDataChannels, dataTransfers } = updatedState;
  let transferId = channelProp;

  if (channelProp === 'main') {
    // eslint-disable-next-line prefer-destructuring
    transferId = peerDataChannels[peerId].main.transferId;
  }

  dataTransferHelpers.manageDataTransferTimeout(room.id, transferId, peerId, false);

  logger.log.ERROR([peerId, TAGS.DATA_CHANNEL, transferId, MESSAGES.DATA_CHANNEL.ERRORS.RECEIVED_ERROR], data);

  dispatchEvent(dataTransferState({
    state: DATA_TRANSFER_STATE.ERROR,
    transferId,
    peerId,
    transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
    error: {
      message: new Error(data.content),
      transferType: dataTransfers[transferId].direction,
    },
  }));
};

export default ERRORProtocolHandler;
