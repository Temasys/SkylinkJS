import { DATA_CHANNEL_STATE, DATA_CHANNEL_TYPE, DC_PROTOCOL_TYPE } from '../../../constants';
import Skylink from '../../../index';
import logger from '../../../logger';
import { onDataChannelStateChanged, onIncomingMessage } from '../../../skylink-events';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import sendMessageToDataChannel from './sendMessageToDataChannel';
import PeerData from '../../../peer-data';
import PeerConnection from '../../index';

/**
 * Function that handles the "MESSAGE" data transfer protocol.
 * @private
 * @lends PeerConnection
 * @param {SkylinkState} roomState
 * @since 2.0.0
 * @fires ON_INCOMING_MESSAGE
 */
const messageProtocolHandler = (roomState, peerId, data, channelProp) => {
  const senderPeerId = data.sender || peerId;
  logger.log.INFO([senderPeerId, 'RTCDataChannel', channelProp, 'Received P2P message from peer:'], data);
  dispatchEvent(onIncomingMessage({
    room: roomState.room,
    message: {
      targetPeerId: data.target,
      content: data.data,
      senderPeerId,
      isDataChannel: true,
      isPrivate: data.isPrivate,
    },
    isSelf: false,
    peerId: senderPeerId,
    peerInfo: PeerData.getPeerInfo(senderPeerId, roomState.room),
  }));
};

/**
 * Function that handles the data received from Datachannel and
 * routes to the relevant data transfer protocol handler.
 * @lends PeerConnection
 * @private
 * @since 2.0.0
 * @fires DATA_CHANNEL_STATE
 */
const processDataChannelData = (roomState, rawData, peerId, channelName, channelType) => {
  const state = Skylink.getSkylinkState(roomState.room.id);
  let transferId = null;
  let streamId = null;
  // eslint-disable-next-line no-unused-vars
  let isStreamChunk = false;
  const channelProp = channelType === DATA_CHANNEL_TYPE.MESSAGING ? 'main' : channelName;

  // Safe access of _dataChannel object in case dataChannel has been closed unexpectedly | ESS-983
  /* eslint-disable prefer-destructuring */
  /* eslint-disable no-prototype-builtins */
  const objPeerDataChannel = state.dataChannels[peerId] || {};
  if (objPeerDataChannel.hasOwnProperty(channelProp) && typeof objPeerDataChannel[channelProp] === 'object') {
    transferId = objPeerDataChannel[channelProp].transferId;
    streamId = objPeerDataChannel[channelProp].streamId;
  } else {
    return null; // dataChannel not avaialble propbably having being closed abruptly | ESS-983
  }

  if (streamId && state.dataStreams && state.dataStreams[streamId]) {
    isStreamChunk = state.dataStreams[streamId].sessionChunkType === 'string' ? typeof rawData === 'string' : typeof rawData === 'object';
  }

  if (!state.peerConnections[peerId]) {
    logger.log.WARN([peerId, 'RTCDataChannel', channelProp, 'Dropping data received from Peer as connection is not present ->'], rawData);
    return null;
  }

  if (!(state.dataChannels[peerId] && state.dataChannels[peerId][channelProp])) {
    logger.log.WARN([peerId, 'RTCDataChannel', channelProp, 'Dropping data received from Peer as Datachannel connection is not present ->'], rawData);
    return null;
  }

  // Expect as string
  if (typeof rawData === 'string') {
    try {
      const protocolData = JSON.parse(rawData);
      isStreamChunk = false;

      logger.log.DEBUG([peerId, 'RTCDataChannel', channelProp, `Received protocol ${protocolData.type} message ->`], protocolData);

      // Ignore ACK, ERROR and CANCEL if there is no data transfer session in-progress
      if ([DC_PROTOCOL_TYPE.ACK, DC_PROTOCOL_TYPE.ERROR, DC_PROTOCOL_TYPE.CANCEL].indexOf(protocolData.type) > -1
        && !(transferId && state.dataTransfers[transferId] && state.dataTransfers[transferId].sessions[peerId])) {
        logger.log.WARN([peerId, 'RTCDataChannel', channelProp, 'Discarded protocol message as data transfer session is not present ->'], protocolData);
        return null;
      }

      // TODO: Complete other DataChannel handlers in the below switch case
      switch (protocolData.type) {
        case DC_PROTOCOL_TYPE.WRQ:
          // Discard iOS bidirectional upload when Datachannel is in-progress for data transfers
          if (transferId && state.dataTransfers[transferId] && state.dataTransfers[transferId].sessions[peerId]) {
            logger.log.WARN([peerId, 'RTCDataChannel', channelProp, 'Rejecting bidirectional data transfer request as it is currently not supported in the SDK ->'], protocolData);
            sendMessageToDataChannel(roomState, peerId, {
              type: DC_PROTOCOL_TYPE.ACK,
              ackN: -1,
              sender: state.user.sid,
            }, channelProp);
            break;
          }
          // self._WRQProtocolHandler(peerId, protocolData, channelProp);
          break;
        // case self._DC_PROTOCOL_TYPE.ACK:
        //   self._ACKProtocolHandler(peerId, protocolData, channelProp);
        //   break;
        // case self._DC_PROTOCOL_TYPE.ERROR:
        //   self._ERRORProtocolHandler(peerId, protocolData, channelProp);
        //   break;
        // case self._DC_PROTOCOL_TYPE.CANCEL:
        //   self._CANCELProtocolHandler(peerId, protocolData, channelProp);
        //   break;
        case DC_PROTOCOL_TYPE.MESSAGE:
          messageProtocolHandler(state, peerId, protocolData, channelProp);
          break;
        default:
          logger.log.WARN([peerId, 'RTCDataChannel', channelProp, `Discarded unknown ${protocolData.type} message ->`], protocolData);
      }
    } catch (error) {
      // if (rawData.indexOf('{') > -1 && rawData.indexOf('}') > 0) {
      //   logger.log.ERROR([peerId, 'RTCDataChannel', channelProp, 'Failed parsing protocol step data error ->'], {
      //     data: rawData,
      //     error,
      //   });
      //

      dispatchEvent(onDataChannelStateChanged({
        peerId,
        channelName,
        channelType,
        error,
        state: DATA_CHANNEL_STATE.ERROR,
        bufferAmount: PeerConnection.getDataChannelBuffer(state.dataChannels[peerId][channelProp].channel),
      }));
      //   throw error;
      // }
      //
      // if (!isStreamChunk && !(transferId && state.dataTransfers[transferId] && state.dataTransfers[transferId].sessions[peerId])) {
      //   logger.log.WARN([peerId, 'RTCDataChannel', channelProp, 'Discarded data chunk without session ->'], rawData);
      //   return null;
      // }
      //
      // if (!isStreamChunk && transferId) {
      //   if (state.dataTransfers[transferId].chunks[state.dataTransfers[transferId].sessions[peerId].ackN]) {
      //     logger.log.WARN([peerId, 'RTCDataChannel', transferId, 'Dropping data chunk ' + (!isStreamChunk ? '@' +
      //       state.dataTransfers[transferId].sessions[peerId].ackN : '') + ' as it has already been added ->'], rawData);
      //     return null;
      //   }
      // }
      //
      // if (!isStreamChunk ? self._dataTransfers[transferId].dataType === self.DATA_TRANSFER_SESSION_TYPE.DATA_URL : true) {
      //   log.debug([peerId, 'RTCDataChannel', channelProp, 'Received string data chunk ' + (!isStreamChunk ? '@' +
      //     self._dataTransfers[transferId].sessions[peerId].ackN : '') + ' with size ->'], rawData.length || rawData.size);
      //
      //   self._DATAProtocolHandler(peerId, rawData, self.DATA_TRANSFER_DATA_TYPE.STRING,
      //     rawData.length || rawData.size || 0, channelProp);
      //
      // } else {
      //   var removeSpaceData = rawData.replace(/\s|\r|\n/g, '');
      //
      //   log.debug([peerId, 'RTCDataChannel', channelProp, 'Received binary string data chunk @' +
      //     self._dataTransfers[transferId].sessions[peerId].ackN + ' with size ->'],
      //     removeSpaceData.length || removeSpaceData.size);
      //
      //   self._DATAProtocolHandler(peerId, self._base64ToBlob(removeSpaceData), self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
      //     removeSpaceData.length || removeSpaceData.size || 0, channelProp);
      // }
    }
  } else {
    // if (!isStreamChunk && !(transferId && self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
    //   log.warn([peerId, 'RTCDataChannel', channelProp, 'Discarded data chunk without session ->'], rawData);
    //   return;
    // }
    //
    // if (!isStreamChunk && transferId) {
    //   if (self._dataTransfers[transferId].chunks[self._dataTransfers[transferId].sessions[peerId].ackN]) {
    //     log.warn([peerId, 'RTCDataChannel', transferId, 'Dropping data chunk ' + (!isStreamChunk ? '@' +
    //       self._dataTransfers[transferId].sessions[peerId].ackN : '') + ' as it has already been added ->'], rawData);
    //     return;
    //   }
    // }
    //
    // if (rawData instanceof Blob) {
    //   log.debug([peerId, 'RTCDataChannel', channelProp, 'Received blob data chunk ' + (isStreamChunk ? '' :
    //     '@' + self._dataTransfers[transferId].sessions[peerId].ackN) + ' with size ->'], rawData.size);
    //
    //   self._DATAProtocolHandler(peerId, rawData, self.DATA_TRANSFER_DATA_TYPE.BLOB, rawData.size, channelProp);
    //
    // } else {
    //   var byteArray = rawData;
    //   var blob = null;
    //
    //   // Plugin binary handling
    //   if (rawData.constructor && rawData.constructor.name === 'Array') {
    //     // Need to re-parse on some browsers
    //     byteArray = new Int8Array(rawData);
    //   }
    //
    //   // Fallback for older IE versions
    //   if (AdapterJS.webrtcDetectedBrowser === 'IE') {
    //     if (window.BlobBuilder) {
    //       var bb = new BlobBuilder();
    //       bb.append(rawData.constructor && rawData.constructor.name === 'ArrayBuffer' ?
    //         byteArray : (new Uint8Array(byteArray)).buffer);
    //       blob = bb.getBlob();
    //     }
    //   } else {
    //     blob = new Blob([byteArray]);
    //   }
    //
    //   log.debug([peerId, 'RTCDataChannel', channelProp, 'Received arraybuffer data chunk ' + (isStreamChunk ? '' :
    //     '@' + self._dataTransfers[transferId].sessions[peerId].ackN) + ' with size ->'], blob.size);
    //
    //   self._DATAProtocolHandler(peerId, blob, self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER, blob.size, channelProp);
    // }
  }
  return null;
};

export default processDataChannelData;
