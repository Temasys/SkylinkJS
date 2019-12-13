import processDataChannelData from '../processDataChannelData';

/**
 * @param {Object} params
 * @param {Event} event
 * @memberof PeerConnection.PeerConnectionHelpers.CreateDataChannelCallbacks
 */
const onmessage = (params, event) => {
  const {
    peerId,
    channelName,
    channelType,
    roomState,
  } = params;

  processDataChannelData(roomState, event.data, peerId, channelName, channelType);
};

export default onmessage;
