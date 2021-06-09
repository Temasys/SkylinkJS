import Skylink from '../../../index';
import DataChannel from '../../../peer-connection/helpers/data-channel';
import {
  DATA_CHANNEL_MESSAGE_TYPE, DATA_TRANSFER_STATE, DC_PROTOCOL_TYPE, TAGS,
} from '../../../constants';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { dataTransferState, onIncomingDataRequest } from '../../../skylink-events';
import dataTransferHelpers from './index';
import logger from '../../../logger';
import MESSAGES from '../../../messages';

const sendWRQMessage = (roomKey, transferId, peerId, channelProp) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { dataTransfers, user, room } = state;
  const { size, chunkSize, sessionChunkType } = dataTransfers[transferId];
  const { AdapterJS } = window;

  // TODO: implement for binary data

  DataChannel.sendMessageToDataChannel(room.id, peerId, {
    type: DC_PROTOCOL_TYPE.WRQ,
    transferId,
    name: dataTransfers[transferId].name,
    size,
    originalSize: dataTransfers[transferId].originalSize,
    dataType: dataTransfers[transferId].sessionType,
    mimeType: dataTransfers[transferId].mimeType,
    chunkType: sessionChunkType,
    chunkSize,
    timeout: dataTransfers[transferId].timeout,
    isPrivate: dataTransfers[transferId].isPrivate,
    sender: user.sid,
    agent: AdapterJS.webrtcDetectedBrowser,
    version: AdapterJS.webrtcDetectedVersion,
    target: peerId,
  }, channelProp, DATA_CHANNEL_MESSAGE_TYPE.PROTOCOL);

  dispatchEvent(onIncomingDataRequest({
    transferId,
    peerId: user.sid,
    transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
    isSelf: true,
  }));

  logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, transferId,
    `${MESSAGES.DATA_CHANNEL.DATA_TRANSFER_STATE} - ${DATA_TRANSFER_STATE.USER_UPLOAD_REQUEST}`]);

  dispatchEvent(dataTransferState({
    state: DATA_TRANSFER_STATE.USER_UPLOAD_REQUEST,
    transferId,
    peerId,
    transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
  }));
};

export default sendWRQMessage;
