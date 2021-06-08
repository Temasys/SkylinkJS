import Skylink from '../../../../index';
import logger from '../../../../logger';
import {
  TAGS, DATA_TRANSFER_STATE,
} from '../../../../constants';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { dataTransferState, onIncomingData } from '../../../../skylink-events';
import dataTransferHelpers from '../../../../features/data-transfer/helpers';

const dataChunkHandler = (roomKey, peerId, chunk, chunkType, chunkSize, channelProp) => {
  const updatedState = Skylink.getSkylinkState(roomKey);
  const {
    room, dataTransfers, peerDataChannels, user,
  } = updatedState;
  let transferId = channelProp;
  let senderPeerId = peerId;

  if (!(peerDataChannels[peerId] && peerDataChannels[peerId][channelProp])) {
    return;
  }

  // TODO: implement data stream

  // const streamId = peerDataChannels[peerId][channelProp].streamId;

  // if (streamId && self._dataStreams[streamId] && ((typeof chunk === 'string' &&
  //   self._dataStreams[streamId].sessionChunkType === 'string') || (chunk instanceof Blob &&
  //   self._dataStreams[streamId].sessionChunkType === 'binary'))) {
  //   senderPeerId = self._dataStreams[streamId].senderPeerId || peerId;
  //   self._trigger('dataStreamState', self.DATA_STREAM_STATE.RECEIVED, streamId, senderPeerId, {
  //     chunk: chunk,
  //     chunkSize: chunkSize,
  //     chunkType: chunkType,
  //     isPrivate: self._dataStreams[streamId].sessionChunkType.isPrivate,
  //     isStringStream: self._dataStreams[streamId].sessionChunkType === 'string',
  //     senderPeerId: senderPeerId
  //   }, null);
  //   self._trigger('incomingDataStream', chunk, transferId, senderPeerId, {
  //     chunkSize: chunkSize,
  //     chunkType: chunkType,
  //     isPrivate: self._dataStreams[streamId].sessionChunkType.isPrivate,
  //     isStringStream: self._dataStreams[streamId].sessionChunkType === 'string',
  //     senderPeerId: senderPeerId
  //   }, false);
  //   return;
  // }

  if (channelProp === 'main') {
    // eslint-disable-next-line prefer-destructuring
    transferId = peerDataChannels[peerId].main.transferId;
  }

  if (dataTransfers[transferId].senderPeerId) {
    // eslint-disable-next-line prefer-destructuring
    senderPeerId = dataTransfers[transferId].senderPeerId;
  }

  dataTransferHelpers.manageDataTransferTimeout(room.id, transferId, peerId, false);

  updatedState.dataTransfers[transferId].chunkType = chunkType;
  updatedState.dataTransfers[transferId].sessions[peerId].receivedSize += chunkSize;
  updatedState.dataTransfers[transferId].chunks[dataTransfers[transferId].sessions[peerId].ackN] = chunk;
  Skylink.setSkylinkState(updatedState, room.id);

  if (dataTransfers[transferId].sessions[peerId].receivedSize >= dataTransfers[transferId].size) {
    logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, channelProp, 'Data transfer has been completed. Computed size ->'], dataTransfers[transferId].sessions[peerId].receivedSize);

    // Send last ACK to Peer to indicate completion of data transfers
    dataTransferHelpers.sendACKProtocol(room.id, peerId, user.sid, dataTransfers[transferId].sessions[peerId].ackN + 1, channelProp);

    dispatchEvent(onIncomingData({
      data: dataTransferHelpers.getTransferData(room.id, transferId),
      transferId,
      peerId,
      transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, senderPeerId),
      isSelf: true,
    }));

    dispatchEvent(dataTransferState({
      state: DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED,
      transferId,
      peerId: senderPeerId,
      transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, senderPeerId),
    }));
  } else if (!dataTransfers[transferId].cancelled) {
    updatedState.dataTransfers[transferId].sessions[peerId].ackN += 1;
    Skylink.setSkylinkState(updatedState, room.id);

    dataTransferHelpers.sendACKProtocol(room.id, peerId, user.sid, dataTransfers[transferId].sessions[peerId].ackN, channelProp);

    dispatchEvent(dataTransferState({
      state: DATA_TRANSFER_STATE.DOWNLOADING,
      transferId,
      peerId: senderPeerId,
      transferInfo: dataTransferHelpers.getTransferInfo(room.id, transferId, senderPeerId),
    }));

    dataTransferHelpers.manageDataTransferTimeout(room.id, transferId, peerId, true);
  }
};

export default dataChunkHandler;
