import { onDataChannelStateChanged } from '../../../../skylink-events';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import logger from '../../../../logger';
import { DATA_CHANNEL_STATE } from '../../../../constants';
import messages from '../../../../messages';
import PeerConnection from '../../../index';
import HandleDataChannelStats from '../../../../skylink-stats/handleDataChannelStats';

/**
 * @param {Object} params
 * @fires DATA_CHANNEL_STATE
 * @memberOf PeerConnection.PeerConnectionHelpers.CreateDataChannelCallbacks
 */
const onopen = (params) => {
  const {
    dataChannel,
    channelProp,
    channelName,
    channelType,
    peerId,
    roomState,
    bufferThreshold,
  } = params;
  const handleDataChannelStats = new HandleDataChannelStats();
  const { room } = roomState;
  const { STATS_MODULE } = messages;

  logger.log.DEBUG([peerId, 'RTCDataChannel', channelProp, 'Datachannel has opened']);
  dataChannel.bufferedAmountLowThreshold = bufferThreshold || 0;
  handleDataChannelStats.send(room.id, STATS_MODULE.HANDLE_DATA_CHANNEL_STATS.closed, peerId, dataChannel, channelProp);
  dispatchEvent(onDataChannelStateChanged({
    state: DATA_CHANNEL_STATE.OPEN,
    peerId,
    channelName,
    channelType,
    bufferAmount: PeerConnection.getDataChannelBuffer(dataChannel),
  }));
};

export default onopen;
