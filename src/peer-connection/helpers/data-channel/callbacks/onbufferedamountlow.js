import logger from '../../../../logger';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { onDataChannelStateChanged } from '../../../../skylink-events';
import PeerConnection from '../../../index';
import { DATA_CHANNEL_STATE } from '../../../../constants';
import Skylink from '../../../../index';
import Room from '../../../../room';

/**
 *
 * @param {Object} params
 * @fires DATA_CHANNEL_STATE
 * @memberOf PeerConnection.PeerConnectionHelpers.CreateDataChannelCallbacks
 */
const onbufferedamountlow = (params) => {
  const {
    dataChannel,
    peerId,
    channelName,
    channelProp,
    channelType,
    roomState,
  } = params;

  const state = Skylink.getSkylinkState(roomState.room.id);
  const { room } = state;
  logger.log.DEBUG([peerId, 'RTCDataChannel', channelProp, 'Datachannel buffering data transfer low']);

  dispatchEvent(onDataChannelStateChanged({
    state: DATA_CHANNEL_STATE.BUFFERED_AMOUNT_LOW,
    room: Room.getRoomInfo(room),
    peerId,
    channelName,
    channelType,
    bufferAmount: PeerConnection.getDataChannelBuffer(dataChannel),
  }));
};

export default onbufferedamountlow;
