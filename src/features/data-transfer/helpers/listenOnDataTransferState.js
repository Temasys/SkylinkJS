import logger from '../../../logger';
import {
  DATA_TRANSFER_DIRECTION, DATA_TRANSFER_STATE, EVENTS, TAGS,
} from '../../../constants';
import Skylink from '../../../index';
import MESSAGES from '../../../messages';
import { addEventListener, removeEventListener } from '../../../utils/skylinkEventManager';
import dataTransferHelpers from './index';

const listenOnDataTransferState = (roomKey, direction, peerId, transferId, resolve, reject) => {
  logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, transferId, 'Registering data transfer state listeners']);
  const resolveOrRejectAndRemoveEventListener = (evt) => {
    const { state, error } = evt.detail;
    const updatedState = Skylink.getSkylinkState(roomKey);

    logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, transferId,
      `${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_STATE} - ${state}`]);

    if (evt.detail.peerId === peerId) {
      if ((direction === DATA_TRANSFER_DIRECTION.UPLOAD && state === DATA_TRANSFER_STATE.UPLOAD_COMPLETED) || (direction === DATA_TRANSFER_DIRECTION.DOWNLOAD && state === DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED)) {
        removeEventListener(EVENTS.DATA_TRANSFER_STATE, resolveOrRejectAndRemoveEventListener);
        resolve({ [peerId]: { success: dataTransferHelpers.getTransferInfo(roomKey, transferId, peerId), transferType: DATA_TRANSFER_DIRECTION.UPLOAD } });

        updatedState.peerDataChannels[peerId].main.transferId = null;
      } else if (state === DATA_TRANSFER_STATE.ERROR || state === DATA_TRANSFER_STATE.CANCEL || state === DATA_TRANSFER_STATE.REJECTED || state === DATA_TRANSFER_STATE.REJECTED) {
        removeEventListener(EVENTS.DATA_TRANSFER_STATE, resolveOrRejectAndRemoveEventListener);
        reject({ [peerId]: { error: error.message, transferType: DATA_TRANSFER_DIRECTION.UPLOAD } });

        if (state === DATA_TRANSFER_STATE.CANCEL) {
          updatedState.dataTransfers[transferId].cancelled = true;
        }
        updatedState.peerDataChannels[peerId].main.transferId = null;
      }

      Skylink.setSkylinkState(updatedState, roomKey);
    }
  };

  addEventListener(EVENTS.DATA_TRANSFER_STATE, resolveOrRejectAndRemoveEventListener);
};

export default listenOnDataTransferState;
