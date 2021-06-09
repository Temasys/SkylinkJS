import Skylink from '../../../../index';
import {
  DATA_TRANSFER_SESSION_TYPE, DATA_TRANSFER_DATA_TYPE, DATA_TRANSFER_DIRECTION, DATA_TRANSFER_STATE,
} from '../../../../constants';
import { dataTransferState, onIncomingDataRequest } from '../../../../skylink-events';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import dataTransferHelpers from '../../../../features/data-transfer/helpers/index';

const WRQProtocolHandler = (roomKey, peerId, data, channelProp) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { room, dataTransfers, peerDataChannels } = state;

  let transferId = channelProp === 'main' ? data.transferId || null : channelProp;

  // TODO: implement binary transfer & data streaming

  if (!transferId) {
    transferId = `transfer_${peerId}_${(new Date()).getTime()}`;
  }

  dataTransfers[transferId] = {
    name: data.name || transferId,
    size: data.size || 0,
    chunkSize: data.chunkSize,
    originalSize: data.originalSize || 0,
    timeout: data.timeout || 60,
    isPrivate: !!data.isPrivate,
    senderPeerId: data.sender || peerId,
    dataType: DATA_TRANSFER_SESSION_TYPE.BLOB,
    mimeType: data.mimeType || null,
    chunkType: DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
    direction: DATA_TRANSFER_DIRECTION.DOWNLOAD,
    chunks: [],
    sessions: {},
    sessionType: data.dataType || 'blob',
    sessionChunkType: data.chunkType || 'string',
    cancelled: false,
  };

  peerDataChannels[peerId][channelProp].transferId = transferId;
  dataTransfers[transferId].sessions[peerId] = {
    timer: null,
    ackN: 0,
    receivedSize: 0,
  };

  dispatchEvent(onIncomingDataRequest({
    transferId,
    peerId,
    transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
    isSelf: false,
  }));

  dispatchEvent(dataTransferState({
    state: DATA_TRANSFER_STATE.UPLOAD_REQUEST,
    transferId,
    peerId,
    transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, peerId),
  }));
};

export default WRQProtocolHandler;
