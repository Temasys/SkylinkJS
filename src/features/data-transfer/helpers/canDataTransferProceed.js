import Skylink from '../../../index';
import {
  ACK_PROTOCOL_NUMBER,
  DATA_CHANNEL_STATE,
  DATA_TRANSFER_DIRECTION,
  DATA_TRANSFER_STATE,
  PEER_CONNECTION_STATE,
  TAGS,
} from '../../../constants';
import MESSAGES from '../../../messages';
import dataTransferHelpers from './index';
import logger from '../../../logger';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { dataTransferState } from '../../../skylink-events';
import { isAString } from '../../../utils/helpers';

const canDataTransferProceed = (roomKey, direction, peerId, transferId, channelProp, accept, reject) => {
  const state = Skylink.getSkylinkState(roomKey);
  const {
    user, peerConnections, peerInformations, dataTransfers, peerDataChannels, room,
  } = state;

  try {
    switch (direction) {
      case DATA_TRANSFER_DIRECTION.UPLOAD:
        // When Peer connection does not exist
        if (!peerConnections[peerId]) {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_UPLOAD_TERMINATED} - ${MESSAGES.PEER_CONNECTION.NO_PEER_CONNECTION}`);
        }

        // When Peer session does not exist
        if (!peerInformations[peerId]) {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_UPLOAD_TERMINATED} - ${MESSAGES.PEER_CONNECTION.NO_PEER_CONNECTION}`);
        }

        // When Peer connection is not STABLE
        if (peerConnections[peerId].signalingState !== PEER_CONNECTION_STATE.STABLE) {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_UPLOAD_TERMINATED} - ${MESSAGES.PEER_CONNECTION.ERRORS.NOT_STABLE}`);
        }

        if (!dataTransfers[transferId]) {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_UPLOAD_TERMINATED} - ${MESSAGES.DATA_CHANNEL.ERRORS.NO_DATA_TRANSFER_SESSION}`);
        }

        if (!(peerDataChannels[peerId] && peerDataChannels[peerId].main)) {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_UPLOAD_TERMINATED} - ${MESSAGES.DATA_CHANNEL.NO_DATA_CHANNEL_CONNECTION}`);
        }

        if (peerDataChannels[peerId].main.channel.readyState !== DATA_CHANNEL_STATE.OPEN) {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_UPLOAD_TERMINATED} - ${MESSAGES.DATA_CHANNEL.DATA_CHANNEL_NOT_OPEN}`);
        }

        if (peerDataChannels[peerId].main.transferId && channelProp === 'main') {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_UPLOAD_TERMINATED} - ${MESSAGES.DATA_CHANNEL.ERRORS.DATA_TRANSFER_IN_PROGRESS}`);
        }

        return true;
      case DATA_TRANSFER_DIRECTION.DOWNLOAD:
        if (!accept) {
          // send ACK message
          dataTransferHelpers.sendACKProtocol(room.id, peerId, user.sid, ACK_PROTOCOL_NUMBER.REJECT, channelProp);

          logger.log.ERROR([peerId, TAGS.DATA_CHANNEL, channelProp, `${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_DOWNLOAD_TERMINATED} - ${MESSAGES.DATA_CHANNEL.ERRORS.USER_REJECTED_TRANSFER}`]);

          dispatchEvent(dataTransferState({
            state: DATA_TRANSFER_STATE.USER_REJECTED,
            transferId,
            peerId,
            transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
            error: {
              message: new Error(MESSAGES.DATA_CHANNEL.ERRORS.REJECTED_TRANSFER),
              transferType: direction,
            },
          }));

          return false;
        }

        if (!isAString(transferId)) {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_DOWNLOAD_TERMINATED} - ${MESSAGES.DATA_CHANNEL.ERRORS.NO_TRANSFER_ID}`);
        }

        if (!isAString(peerId)) {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_DOWNLOAD_TERMINATED} - ${MESSAGES.DATA_CHANNEL.ERRORS.NO_PEER_ID}`);
        }

        if (!peerDataChannels[peerId]) {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_DOWNLOAD_TERMINATED} - ${MESSAGES.DATA_CHANNEL.ERRORS.NO_SESSIONS}`);
        }

        if (!dataTransfers[transferId]) {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_DOWNLOAD_TERMINATED} - ${MESSAGES.DATA_CHANNEL.ERRORS.NO_DATA_TRANSFER_SESSION}`);
        }

        return true;
      case DATA_TRANSFER_STATE.CANCEL:
        if (!isAString(transferId)) {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_CANCEL_TERMINATED} - ${MESSAGES.DATA_CHANNEL.ERRORS.NO_TRANSFER_ID}`);
        }

        if (!isAString(peerId)) {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_CANCEL_TERMINATED} - ${MESSAGES.DATA_CHANNEL.ERRORS.NO_PEER_ID}`);
        }

        if (!peerDataChannels[peerId]) {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_CANCEL_TERMINATED} - ${MESSAGES.DATA_CHANNEL.ERRORS.NO_SESSIONS}`);
        }

        if (!dataTransfers[transferId]) {
          throw new Error(`${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_CANCEL_TERMINATED} - ${MESSAGES.DATA_CHANNEL.ERRORS.NO_DATA_TRANSFER_SESSION}`);
        }

        return true;
      default:
        // should not come here
        return false;
    }
  } catch (error) {
    logger.log.ERROR([peerId, TAGS.DATA_CHANNEL, channelProp, MESSAGES.DATA_CHANNEL.DATA_TRANSFER_ERROR], error);

    dispatchEvent(dataTransferState({
      state: DATA_TRANSFER_STATE.ERROR,
      transferId,
      peerId,
      transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
      error: {
        message: error,
        transferType: direction,
      },
    }));

    return reject(error);
  }
};

export default canDataTransferProceed;
