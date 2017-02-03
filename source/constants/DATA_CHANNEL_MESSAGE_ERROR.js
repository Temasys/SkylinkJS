/**
 * The list of Datachannel sending message error types.
 * @attribute DATA_CHANNEL_MESSAGE_ERROR
 * @param {String} MESSAGE  <small>Value <code>"message"</code></small>
 *   The value of the Datachannel sending message error type when encountered during
 *   sending P2P message from <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.
 * @param {String} TRANSFER <small>Value <code>"transfer"</code></small>
 *   The value of the Datachannel sending message error type when encountered during
 *   data transfers from <a href="#method_sendURLData"><code>sendURLData()</code> method</a> or
 *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.DATA_CHANNEL_MESSAGE_ERROR = {
  MESSAGE: 'message',
  TRANSFER: 'transfer'
};