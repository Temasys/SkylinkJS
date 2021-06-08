import Skylink from '../../../index';
import logger from '../../../logger';
import { DATA_CHANNEL_TYPE, PEER_CONNECTION_STATE, DATA_CHANNEL_STATE } from '../../../constants';
import callbacks from './callbacks/index';
import { onDataChannelStateChanged } from '../../../skylink-events';
import PeerConnection from '../..';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import HandleDataChannelStats from '../../../skylink-stats/handleDataChannelStats';

/* eslint-disable prefer-const */
/**
 * @param params
 * @returns {null}
 * @memberOf PeerConnection.PeerConnectionHelpers
 * @fires DATA_CHANNEL_STATE
 */
const createDataChannel = (params) => {
  let {
    peerId,
    dataChannel,
    bufferThreshold,
    createAsMessagingChannel,
    roomState,
  } = params;
  const state = Skylink.getSkylinkState(roomState.room.id);
  const { user, peerConnections, peerDataChannels } = state;
  const peerConnection = peerConnections[peerId];
  let channelName = `-_${peerId}`;
  let channelType = createAsMessagingChannel === true ? DATA_CHANNEL_TYPE.MESSAGING : DATA_CHANNEL_TYPE.DATA;
  let channelProp = channelType === DATA_CHANNEL_TYPE.MESSAGING ? 'main' : channelName;
  if (user && user.sid) {
    channelName = `${user.sid}_${peerId}`;
  } else {
    logger.log.ERROR([peerId, 'RTCDataChannel', channelProp, 'Aborting of creating or initializing DataChannel as User does not have Room session']);
    return null;
  }

  if (!(peerConnection && peerConnection.signalingState !== PEER_CONNECTION_STATE.CLOSED)) {
    logger.log.ERROR([peerId, 'RTCDataChannel', channelProp, 'Aborting of creating or initializing Datachannel as Peer connection does not exists']);
    return null;
  }

  if (dataChannel && typeof dataChannel === 'object') {
    channelName = dataChannel.label;
  } else if (typeof dataChannel === 'string') {
    channelName = dataChannel;
    dataChannel = null;
  }

  if (!peerDataChannels[peerId]) {
    channelProp = 'main';
    channelType = DATA_CHANNEL_TYPE.MESSAGING;
    peerDataChannels[peerId] = {};
    logger.log.DEBUG([peerId, 'RTCDataChannel', channelProp, 'initializing main DataChannel']);
  } else if (peerDataChannels[peerId].main && peerDataChannels[peerId].main.channel.label === channelName) {
    channelProp = 'main';
    channelType = DATA_CHANNEL_TYPE.MESSAGING;
  }

  if (!dataChannel) {
    try {
      dataChannel = peerConnection.createDataChannel(channelName, {
        reliable: true,
        ordered: true,
      });
    } catch (error) {
      logger.log.ERROR([peerId, 'RTCDataChannel', channelProp, 'Failed creating Datachannel ->'], error);

      const handleDataChannelStats = new HandleDataChannelStats();
      const { room } = roomState;

      handleDataChannelStats.send(room.id, DATA_CHANNEL_STATE.ERROR, peerId, { label: channelName }, channelProp, error);
      dispatchEvent(onDataChannelStateChanged({
        state: DATA_CHANNEL_STATE.CREATE_ERROR,
        peerId,
        error,
        channelName,
        channelType,
        buferAmount: PeerConnection.getDataChannelBuffer(dataChannel),
      }));
      return null;
    }
  }

  const callbackExtraParams = {
    dataChannel,
    peerId,
    channelName,
    channelProp,
    channelType,
    roomState,
    bufferThreshold,
  };

  dataChannel.onopen = callbacks.onopen.bind(dataChannel, callbackExtraParams);
  dataChannel.onmessage = callbacks.onmessage.bind(dataChannel, callbackExtraParams);
  dataChannel.onerror = callbacks.onerror.bind(dataChannel, callbackExtraParams);
  dataChannel.onbufferedamountlow = callbacks.onbufferedamountlow.bind(dataChannel, callbackExtraParams);
  dataChannel.onclose = callbacks.onclose.bind(dataChannel, callbackExtraParams);

  const channel = channelType === DATA_CHANNEL_TYPE.MESSAGING ? 'main' : channelName;
  state.peerDataChannels[peerId][channel] = {
    channelName,
    channelType,
    transferId: null,
    streamId: null,
    channel: dataChannel,
  };

  Skylink.setSkylinkState(state, roomState.room.id);

  return null;
};

export default createDataChannel;
