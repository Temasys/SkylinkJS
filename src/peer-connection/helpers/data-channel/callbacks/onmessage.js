import processDataChannelData from '../processDataChannelData';

/**
 * @param {Object} params
 * @param {Event} event
 * @memberOf PeerConnection.PeerConnectionHelpers.CreateDataChannelCallbacks
 */
const onmessage = (params, event) => {
  const {
    peerId,
    channelName,
    channelType,
    roomState,
  } = params;

  processDataChannelData(roomState.room.id, event.data, peerId, channelName, channelType);
};

export default onmessage;
