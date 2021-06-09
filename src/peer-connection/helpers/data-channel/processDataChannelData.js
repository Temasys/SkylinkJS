import {
  DATA_CHANNEL_STATE, DATA_CHANNEL_TYPE, DC_PROTOCOL_TYPE, TAGS, DATA_TRANSFER_DATA_TYPE,
} from '../../../constants';
import Skylink from '../../../index';
import logger from '../../../logger';
import { onDataChannelStateChanged } from '../../../skylink-events';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import dataChannelHandlers from './handlers';
import MESSAGES from '../../../messages';
import SkylinkError from '../../../utils/skylinkError';
import dataTransferHelpers from '../../../features/data-transfer/helpers/index';

// eslint-disable-next-line consistent-return
const isProtocol = (data, peerId, channelName, channelType, channelProp) => {
  try {
    return JSON.parse(data);
  } catch (error) {
    if (data.indexOf('{') > -1 && data.indexOf('}') > 0) {
      dispatchEvent(onDataChannelStateChanged({
        peerId,
        channelName,
        channelType,
        error,
        state: DATA_CHANNEL_STATE.ERROR,
        // bufferAmount: PeerConnection.getDataChannelBuffer(state.peerDataChannels[peerId][channelProp].channel),
      }));

      SkylinkError.throwError(peerId, TAGS.DATA_CHANNEL, MESSAGES.DATA_CHANNEL.ERRORS.FAILED_PARSING_PROTOCOL, channelProp, {
        error,
        data,
      });

      return false;
    }
  }
};

/**
 * Function that handles the data received from Datachannel and
 * routes to the relevant data transfer protocol handler.
 * @lends PeerConnection
 * @private
 * @since 2.0.0
 * @fires DATA_CHANNEL_STATE
 */
const processDataChannelData = (roomKey, rawData, peerId, channelName, channelType) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { room, dataTransfers } = state;
  let transferId = null;
  // let streamId = null;
  // eslint-disable-next-line no-unused-vars
  // let isStreamChunk = false;
  const channelProp = channelType === DATA_CHANNEL_TYPE.MESSAGING ? 'main' : channelName;

  // Safe access of _dataChannel object in case dataChannel has been closed unexpectedly | ESS-983
  /* eslint-disable prefer-destructuring */
  /* eslint-disable no-prototype-builtins */
  const objPeerDataChannel = state.peerDataChannels[peerId] || {};
  if (objPeerDataChannel.hasOwnProperty(channelProp) && typeof objPeerDataChannel[channelProp] === 'object') {
    transferId = objPeerDataChannel[channelProp].transferId;
    // streamId = objPeerDataChannel[channelProp].streamId;
  } else {
    // TODO: log data channel not open?
    return null; // dataChannel not available probably having being closed abruptly | ESS-983
  }

  // if (streamId && state.dataStreams && state.dataStreams[streamId]) {
  //   isStreamChunk = state.dataStreams[streamId].sessionChunkType === 'string' ? typeof rawData === 'string' : typeof rawData === 'object';
  // }

  if (!state.peerConnections[peerId]) {
    logger.log.WARN([peerId, TAGS.DATA_CHANNEL, channelProp, 'Dropping data received from Peer as connection is not present ->'], rawData);
    return null;
  }

  if (!(state.peerDataChannels[peerId] && state.peerDataChannels[peerId][channelProp])) {
    logger.log.WARN([peerId, TAGS.DATA_CHANNEL, channelProp, 'Dropping data received from Peer as Datachannel connection is not present ->'], rawData);
    return null;
  }

  // Expect as string
  if (typeof rawData === 'string') {
    const protocol = isProtocol(rawData, channelProp);

    // rawData as protocol message
    if (protocol) {
      logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, channelProp, `Received protocol ${protocol.type} message ->`], protocol);

      // TODO: implement ios bidirectional data check
      switch (protocol.type) {
        case DC_PROTOCOL_TYPE.WRQ:
          dataChannelHandlers.WRQProtocolHandler(room.id, peerId, protocol, channelProp);
          break;
        case DC_PROTOCOL_TYPE.ACK:
          dataChannelHandlers.ACKProtocolHandler(room.id, peerId, protocol, channelProp);
          break;
        case DC_PROTOCOL_TYPE.ERROR:
          dataChannelHandlers.ERRORProtocolHandler(room.id, peerId, protocol, channelProp);
          break;
        case DC_PROTOCOL_TYPE.CANCEL:
          dataChannelHandlers.CANCELProtocolHandler(room.id, peerId, protocol, channelProp);
          break;
        case DC_PROTOCOL_TYPE.MESSAGE:
          dataChannelHandlers.MESSAGEProtocolHandler(state, peerId, protocol, channelProp);
          break;
        default:
          logger.log.WARN([peerId, TAGS.DATA_CHANNEL, channelProp, `Discarded unknown ${protocol.type} message ->`], protocol);
      }

      // rawData as chunk
    } else {
      const chunk = rawData;
      if (!(transferId && dataTransfers[transferId] && dataTransfers[transferId].sessions[peerId])) {
        return logger.log.WARN([peerId, TAGS.DATA_CHANNEL, channelProp, `${MESSAGES.DATA_CHANNEL.ERRORS.DISCARDING_DATA_CHUNK - MESSAGES.DATA_CHANNEL.ERRORS.NO_DATA_TRANSFER_SESSION}`], chunk);
      }

      if (transferId && dataTransfers[transferId].chunks[dataTransfers[transferId].sessions[peerId].ackN]) {
        return logger.log.WARN([peerId, TAGS.DATA_CHANNEL, transferId, `${MESSAGES.DATA_CHANNEL.ERRORS.DISCARDING_DATA_CHUNK} - ${MESSAGES.DATA_CHANNEL.ERRORS.CHUNK_ADDED} @${dataTransfers[transferId].sessions[peerId].ackN}`], chunk);
      }

      const removedSpacesChunk = chunk.replace(/\s|\r|\n/g, '');
      logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, transferId, `${MESSAGES.DATA_CHANNEL.RECEIVED_CHUNK} @${dataTransfers[transferId].sessions[peerId].ackN}, Size:`], removedSpacesChunk.length || removedSpacesChunk.size || '-');
      return dataChannelHandlers.dataChunkHandler(room.id, peerId, dataTransferHelpers.base64ToBlob(removedSpacesChunk), DATA_TRANSFER_DATA_TYPE.BINARY_STRING, removedSpacesChunk.length || removedSpacesChunk.size || 0, channelProp);
    }
  }

  return null;
};

export default processDataChannelData;
