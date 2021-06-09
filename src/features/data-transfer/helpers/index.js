import chunkBlobData from './chunkBlobData';
import getTransferInfo from './getTransferInfo';
import blobToBase64 from './blobToBase64';
import getTransferData from './getTransferData';
import base64ToBlob from './base64ToBlob';
import sendACKProtocol from './sendACKProtocol';
import manageDataTransferTimeout from './manageDataTransferTimeout';
import canDataTransferProceed from './canDataTransferProceed';
import listenOnDataTransferState from './listenOnDataTransferState';
import sendWRQMessage from './sendWRQMessage';

/**
 * @namespace DataTransferHelpers
 * @description All helper and utility functions for <code>{@link DataTransfer}</code> class are listed here.
 * @private
 * @memberOf DataTransfer
 * @type {{chunkBlobData, getTransferInfo, blobToBase64, getTransferData, base64ToBlob, manageDataTransferTimeout, canDataTransferProceed, listenOnDataTransferState, sendWRQMessage}}
 */
export default {
  chunkBlobData,
  getTransferInfo,
  blobToBase64,
  getTransferData,
  base64ToBlob,
  sendACKProtocol,
  manageDataTransferTimeout,
  canDataTransferProceed,
  listenOnDataTransferState,
  sendWRQMessage,
};
