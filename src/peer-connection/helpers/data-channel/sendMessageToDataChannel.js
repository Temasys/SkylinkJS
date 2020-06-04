import logger from '../../../logger';
import Skylink from '../../../index';
import { onDataChannelStateChanged } from '../../../skylink-events';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import PeerConnection from '../..';

import {
  PEER_CONNECTION_STATE,
  DC_PROTOCOL_TYPE,
  DATA_CHANNEL_MESSAGE_ERROR,
  DATA_CHANNEL_STATE,
} from '../../../constants';

/**
 * Function that sends data over the DataChannel connection.
 * @private
 * @memberOf PeerConnection
 * @since 2.0.0
 * @fires DATA_CHANNEL_STATE
 */
const sendMessageToDataChannel = (roomState, peerId, data, channelProperty, doNotConvert) => {
  const state = Skylink.getSkylinkState(roomState.room.id);
  const peerConnection = state.peerConnections[peerId];
  const dataChannel = state.dataChannels[peerId];
  let channelProp = channelProperty;

  if (!channelProp || channelProp === peerId) {
    channelProp = 'main';
  }

  // TODO: What happens when we want to send binary data over or ArrayBuffers?
  if (!(typeof data === 'object' && data) && !(data && typeof data === 'string')) {
    logger.log.WARN([peerId, 'RTCDataChannel', channelProp, 'Dropping invalid data ->'], data);
    return null;
  }

  if (!(peerConnection && peerConnection.signalingState !== PEER_CONNECTION_STATE.CLOSED)) {
    logger.log.WARN([peerId, 'RTCDataChannel', channelProp, 'Dropping for sending message as Peer connection does not exists or is closed ->'], data);
    return null;
  }

  if (!(dataChannel && dataChannel[channelProp])) {
    logger.log.WARN([peerId, 'RTCDataChannel', channelProp, 'Dropping for sending message as Datachannel connection does not exists ->'], data);
    return null;
  }

  /* eslint-disable prefer-destructuring */
  const channelName = dataChannel[channelProp].channelName;
  const channelType = dataChannel[channelProp].channelType;
  const readyState = dataChannel[channelProp].channel.readyState;
  const messageType = typeof data === 'object' && data.type === DC_PROTOCOL_TYPE.MESSAGE ? DATA_CHANNEL_MESSAGE_ERROR.MESSAGE : DATA_CHANNEL_MESSAGE_ERROR.TRANSFER;

  if (readyState !== DATA_CHANNEL_STATE.OPEN) {
    const notOpenError = new Error(`Failed sending message as Datachannel connection state is not opened. Current readyState is ${readyState}`);
    logger.log.ERROR([peerId, 'RTCDataChannel', channelProp, notOpenError], data);
    dispatchEvent(onDataChannelStateChanged({
      peerId,
      channelName,
      channelType,
      messageType,
      error: notOpenError,
      state: DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR,
      bufferAmount: PeerConnection.getDataChannelBuffer(dataChannel[channelProp].channel),
    }));
    throw notOpenError;
  }

  try {
    if (!doNotConvert && typeof data === 'object') {
      logger.log.DEBUG([peerId, 'RTCDataChannel', channelProp, `Sending ${data.type} protocol message ->`], data);
      dataChannel[channelProp].channel.send(JSON.stringify(data));
    } else {
      logger.log.DEBUG([peerId, 'RTCDataChannel', channelProp, 'Sending data with size ->'], data.size || data.length || data.byteLength);
      dataChannel[channelProp].channel.send(data);
    }
  } catch (error) {
    logger.log.ERROR([peerId, 'RTCDataChannel', channelProp, 'Failed sending data)'], { error, data });
    dispatchEvent(onDataChannelStateChanged({
      peerId,
      channelName,
      channelType,
      messageType,
      error,
      state: DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR,
      bufferAmount: PeerConnection.getDataChannelBuffer(dataChannel[channelProp].channel),
    }));
    throw error;
  }
  return null;
};

export default sendMessageToDataChannel;
