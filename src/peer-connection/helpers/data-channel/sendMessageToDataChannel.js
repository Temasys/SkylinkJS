import logger from '../../../logger';
import Skylink from '../../../index';
import { onDataChannelStateChanged } from '../../../skylink-events';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import SkylinkError from '../../../utils/skylinkError';
import {
  PEER_CONNECTION_STATE,
  DATA_CHANNEL_TYPE,
  DATA_CHANNEL_STATE, TAGS,
  DATA_CHANNEL_MESSAGE_TYPE,
} from '../../../constants';
import MESSAGES from '../../../messages';
import { isAString } from '../../../utils/helpers';

const canSendMessage = (state, peerId, data, channelProperty, type) => {
  const peerConnection = state.peerConnections[peerId];
  const dataChannel = state.peerDataChannels[peerId];
  const channelProp = channelProperty;
  const { channelName, channelType, channel } = dataChannel[channelProp];
  const messageType = DATA_CHANNEL_TYPE.MESSAGING;

  if (type === DATA_CHANNEL_MESSAGE_TYPE.PROTOCOL && !(typeof data === 'object' && data)) {
    logger.log.WARN([peerId, TAGS.DATA_CHANNEL, channelProp, `${MESSAGES.DATA_CHANNEL.ERRORS.DROP_SENDING_MESSAGE} - ${MESSAGES.DATA_CHANNEL.ERRORS.INVALID_DATA}`], data);
    return false;
  }

  if (type === DATA_CHANNEL_MESSAGE_TYPE.CHUNK && !(typeof data === 'string' && data)) {
    logger.log.WARN([peerId, TAGS.DATA_CHANNEL, channelProp, `${MESSAGES.DATA_CHANNEL.ERRORS.DROP_SENDING_MESSAGE} - ${MESSAGES.DATA_CHANNEL.ERRORS.INVALID_DATA}`], data);
    return false;
  }

  if (!peerConnection) {
    logger.log.WARN([peerId, TAGS.DATA_CHANNEL, channelProp, `${MESSAGES.DATA_CHANNEL.ERRORS.DROP_SENDING_MESSAGE} - ${MESSAGES.PEER_CONNECTION.NO_PEER_CONNECTION}`], data);
    return false;
  }

  if (peerConnection && peerConnection.signalingState === PEER_CONNECTION_STATE.CLOSED) {
    logger.log.WARN([peerId, TAGS.DATA_CHANNEL, channelProp, `${MESSAGES.DATA_CHANNEL.ERRORS.DROP_SENDING_MESSAGE} - ${MESSAGES.PEER_CONNECTION.PEER_CONNECTION_CLOSED}`], data);
    return false;
  }

  if (!(dataChannel && dataChannel[channelProp])) {
    logger.log.WARN([peerId, TAGS.DATA_CHANNEL, channelProp, `${MESSAGES.DATA_CHANNEL.ERRORS.DROP_SENDING_MESSAGE} - ${MESSAGES.DATA_CHANNEL.NO_DATA_CHANNEL_CONNECTION}`], data);
    return false;
  }

  if (channel.readyState !== DATA_CHANNEL_STATE.OPEN) {
    dispatchEvent(onDataChannelStateChanged({
      peerId,
      channelName,
      channelType,
      messageType,
      error: `${MESSAGES.DATA_CHANNEL.ERRORS.FAILED_SENDING_MESSAGE} - ${MESSAGES.DATA_CHANNEL.DATA_CHANNEL_NOT_OPEN}`,
      state: DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR,
      // bufferAmount: PeerConnection.getDataChannelBuffer(dataChannel[channelProp].channel),
    }));

    SkylinkError.throwError(peerId, TAGS.DATA_CHANNEL, `${MESSAGES.DATA_CHANNEL.ERRORS.FAILED_SENDING_MESSAGE} - ${MESSAGES.DATA_CHANNEL.DATA_CHANNEL_NOT_OPEN}`, `Current readyState is ${channel.readyState}`, data);
  }

  return true;
};

/**
 * Function that sends data of type message over the DataChannel connection.
 * @param {string} roomKey - The room id
 * @param {string} peerId - The peer id
 * @param {object} data - The protocol message
 * @param {string} channelProperty - The channel property
 * @param {string} type - The type of message - protocol or chunk
 * @private
 * @memberOf PeerConnection
 * @since 2.0.0
 * @fires DATA_CHANNEL_STATE
 */
const sendMessageToDataChannel = (roomKey, peerId, data, channelProperty, type) => {
  const state = Skylink.getSkylinkState(roomKey);
  const dataChannel = state.peerDataChannels[peerId];
  const channelProp = channelProperty;
  const { channelName, channelType } = dataChannel[channelProp];
  const messageType = DATA_CHANNEL_TYPE.MESSAGING;

  if (canSendMessage(state, peerId, data, channelProperty, type)) {
    try {
      const dataToSend = isAString(data) ? data : JSON.stringify(data);
      if (type === DATA_CHANNEL_MESSAGE_TYPE.PROTOCOL) {
        logger.log.DEBUG([peerId, TAGS.DATA_CHANNEL, channelProp, `Sending ${data.type} protocol message ->`], data);
      }
      dataChannel[channelProp].channel.send(dataToSend);
    } catch (error) {
      dispatchEvent(onDataChannelStateChanged({
        peerId,
        channelName,
        channelType,
        messageType,
        error,
        state: DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR,
      }));
      SkylinkError.throwError(peerId, TAGS.DATA_CHANNEL, MESSAGES.DATA_CHANNEL.ERRORS.FAILED_SENDING_MESSAGE, null, { error, data });
    }
  }


  return null;
};

export default sendMessageToDataChannel;
