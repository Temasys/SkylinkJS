import clone from 'clone';
import {
  DATA_TRANSFER_STATE,
  DATA_TRANSFER_DIRECTION,
  DATA_TRANSFER_SESSION_TYPE,
  CHUNK_FILE_SIZE,
  DATA_TRANSFER_DATA_TYPE,
  DC_PROTOCOL_TYPE,
  DATA_CHANNEL_MESSAGE_TYPE,
  ACK_PROTOCOL_NUMBER, TAGS,
} from '../../constants';
import { isANumber, isAObj, isAString } from '../../utils/helpers';
import dataTransferHelpers from './helpers/index';
import Skylink from '../../index';
import DataChannel from '../../peer-connection/helpers/data-channel';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { dataTransferState } from '../../skylink-events';
import MESSAGES from '../../messages';
import logger from '../../logger';

const resolvePromise = promise => promise.then(success => (success), error => (error));

/**
 * @classdesc Class that manages the data transfer features
 * @class
 * @private
 */
class DataTransfer {
  static sendBlobData(roomState, data, targetPeerId = null, timeout = null, sendChunksAsBinary = false) {
    const updatedState = roomState;
    const { user, peerInformations, room } = roomState;
    const transferId = `${user.sid}_${new Date().getTime()}`;
    const initOptions = Skylink.getInitOptions();
    const { enableDataChannel } = initOptions;
    const channelProperty = 'main';

    // TODO: implement sendChunkAsBinary
    // eslint-disable-next-line no-unused-vars
    const x = sendChunksAsBinary;

    // const sessionChunkType = SESSION_CHUNK_TYPE.STRING;
    let listOfPeers = Object.keys(peerInformations); // will not include MCU peer if MCU is on
    // const sessionType = DATA_TRANSFER_SESSION_TYPE.BLOB;

    // Validate data as blob object
    // eslint-disable-next-line no-undef
    if (!(data && isAObj(data) && data instanceof Blob)) {
      return Promise.reject(new Error(`${MESSAGES.DATA_CHANNEL.UNABLE_TO_SEND_BLOB} - ${MESSAGES.DATA_CHANNEL.ERRORS.NOT_BLOB}`));
    }

    if (data.size < 1) {
      return Promise.reject(new Error(`${MESSAGES.DATA_CHANNEL.UNABLE_TO_SEND_BLOB} - ${MESSAGES.DATA_CHANNEL.ERRORS.INVALID_DATA}`));
    }

    if (!enableDataChannel) {
      return Promise.reject(new Error(`${MESSAGES.DATA_CHANNEL.UNABLE_TO_SEND_BLOB} - ${MESSAGES.DATA_CHANNEL.ERRORS.DATA_CHANNEL_DISABLED}`));
    }

    if (listOfPeers.length === 0) {
      return Promise.reject(new Error(`${MESSAGES.DATA_CHANNEL.UNABLE_TO_SEND_BLOB} - ${MESSAGES.ROOM.ERRORS.NO_PEERS}`));
    }

    // sendBlobData(.., .., targetPeerId)
    if (Array.isArray(targetPeerId)) {
      listOfPeers = targetPeerId;
    } else if (targetPeerId && isAString(targetPeerId)) {
      listOfPeers = [targetPeerId];
    } else if (targetPeerId && isANumber(targetPeerId)) {
      // eslint-disable-next-line no-param-reassign
      timeout = targetPeerId;
    } else if (targetPeerId) {
      // reject for incorrect targetPeerId type
      return Promise.reject(new Error(`${MESSAGES.DATA_CHANNEL.UNABLE_TO_SEND_BLOB} - ${MESSAGES.DATA_CHANNEL.ERRORS.PEER_ID_INVALID_TYPE}`));
    }

    if (timeout && !isANumber(timeout)) {
      // reject for incorrect timeout type
      return Promise.reject(new Error(`${MESSAGES.DATA_CHANNEL.UNABLE_TO_SEND_BLOB} - ${MESSAGES.DATA_CHANNEL.ERRORS.TIMEOUT_INVALID_TYPE}`));
    }

    const transferInfo = {
      name: data.name || transferId,
      size: 4 * Math.ceil(data.size / 3), // Conversion to Base64 increases size by 33% - compare against receivedSize to determine completion of data transfer in chunks on the remote peer
      chunkSize: CHUNK_FILE_SIZE,
      chunkType: DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
      dataType: DATA_TRANSFER_SESSION_TYPE.BLOB,
      mimeType: data.type || null,
      direction: DATA_TRANSFER_DIRECTION.UPLOAD,
      timeout: timeout || 60,
      isPrivate: false,
      percentage: 0,
      originalSize: data.size,
      cancelled: false,
    };

    const chunks = dataTransferHelpers.chunkBlobData(data, transferInfo.chunkSize);

    // update state
    updatedState.dataTransfers[transferId] = clone(transferInfo);
    updatedState.dataTransfers[transferId].sessions = {};
    updatedState.dataTransfers[transferId].chunks = chunks;
    updatedState.dataTransfers[transferId].enforceBSPeers = [];
    updatedState.dataTransfers[transferId].enforcedBSInfo = {};
    updatedState.dataTransfers[transferId].sessionType = transferInfo.dataType;
    updatedState.dataTransfers[transferId].sessionChunkType = transferInfo.chunkType;
    updatedState.dataTransfers[transferId].senderPeerId = user.sid;

    Skylink.setSkylinkState(updatedState, room.id);

    const peerDataTransferPromises = [];
    listOfPeers.forEach((peerId) => {
      peerDataTransferPromises.push(resolvePromise(this.transferDataToPeer(room.id, peerId, transferId, channelProperty)));
    });

    return Promise.all(peerDataTransferPromises);
  }

  static acceptDataTransfer(roomState, peerId, transferId, accept) {
    return new Promise((resolve, reject) => {
      const { room, user } = roomState;
      const channelProp = 'main';

      // add listener for data channel transfer complete before resolving or rejecting?
      dataTransferHelpers.listenOnDataTransferState(room.id, DATA_TRANSFER_DIRECTION.DOWNLOAD, peerId, transferId, resolve, reject);

      if (dataTransferHelpers.canDataTransferProceed(room.id, DATA_TRANSFER_DIRECTION.DOWNLOAD, peerId, transferId, channelProp, accept, reject)) {
        // check: when will transferId be the channel prop?
        // if (self._dataChannels[peerId][transferId]) {
        //   channelProp = transferId;
        // }

        // Send ACK protocol to start data transfer
        dataTransferHelpers.sendACKProtocol(room.id, peerId, user.sid, ACK_PROTOCOL_NUMBER.ACCEPT, channelProp);

        logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, transferId,
          `${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_STATE} - ${DATA_TRANSFER_STATE.DOWNLOAD_STARTED}`]);

        dispatchEvent(dataTransferState({
          state: DATA_TRANSFER_STATE.DOWNLOAD_STARTED,
          transferId,
          peerId,
          transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
        }));
      }
    });
  }

  static cancelBlobTransfer(roomState, peerId, transferId) {
    return new Promise((resolve, reject) => {
      const { room, user, dataTransfers } = roomState;
      const channelProp = 'main';

      if (dataTransferHelpers.canDataTransferProceed(room.id, DATA_TRANSFER_STATE.CANCEL, peerId, transferId, channelProp, null, reject)) {
        // Currently all messages and transfer are conducted using main channel
        // if (peerDataChannels[peerId][transferId]) {
        //   channelProp = transferId;
        // }\\

        DataChannel.sendMessageToDataChannel(room.id, peerId, {
          type: DC_PROTOCOL_TYPE.CANCEL,
          sender: user.sid,
          content: MESSAGES.DATA_CHANNEL.ERRORS.REMOTE_CANCELLED_TRANSFER,
          name: dataTransfers[transferId].name,
          ackN: ACK_PROTOCOL_NUMBER.CANCEL,
        }, channelProp, DATA_CHANNEL_MESSAGE_TYPE.PROTOCOL);

        dispatchEvent(dataTransferState({
          state: DATA_TRANSFER_STATE.CANCEL,
          transferId,
          peerId,
          transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
          error: {
            message: MESSAGES.DATA_CHANNEL.ERRORS.USER_CANCELLED_TRANSFER,
            transferType: dataTransfers[transferId].direction,
          },
        }));

        dataTransferHelpers.manageDataTransferTimeout(room.id, transferId, peerId, false);
      }
    });
  }

  static transferDataToPeer(roomKey, peerId, transferId, channelProp) {
    // eslint-disable-next-line consistent-return
    return new Promise((resolve, reject) => {
      const updatedState = Skylink.getSkylinkState(roomKey);
      if (dataTransferHelpers.canDataTransferProceed(roomKey, DATA_TRANSFER_DIRECTION.UPLOAD, peerId, transferId, channelProp, null, reject)) {
        updatedState.dataTransfers[transferId].sessions[peerId] = {
          timer: null,
          ackN: 0,
        };

        updatedState.peerDataChannels[peerId].main.transferId = transferId;
        Skylink.setSkylinkState(updatedState, updatedState.room.id);

        dataTransferHelpers.sendWRQMessage(updatedState.room.id, transferId, peerId, channelProp);
        return dataTransferHelpers.listenOnDataTransferState(roomKey, DATA_TRANSFER_DIRECTION.UPLOAD, peerId, transferId, resolve, reject);
      }
    });
  }
}

export default DataTransfer;
