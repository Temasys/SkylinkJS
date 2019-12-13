/**
 * Get RTCDataChannel buffer thresholds
 * @param {RTCDataChannel.channel} channel
 * @returns {{bufferedAmountLow: number, bufferedAmountLowThreshold: number}}
 * @memberOf PeerConnection.PeerConnectionHelpers
 */
const getDataChannelBuffer = channel => ({
  bufferedAmountLow: parseInt(channel.bufferedAmountLow, 10) || 0,
  bufferedAmountLowThreshold: parseInt(channel.bufferedAmountLowThreshold, 10) || 0,
});
export default getDataChannelBuffer;
