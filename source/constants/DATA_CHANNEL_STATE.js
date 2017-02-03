/**
 * The list of Datachannel connection states.
 * @attribute DATA_CHANNEL_STATE
 * @param {String} CONNECTING          <small>Value <code>"connecting"</code></small>
 *   The value of the state when Datachannel is attempting to establish a connection.
 * @param {String} OPEN                <small>Value <code>"open"</code></small>
 *   The value of the state when Datachannel has established a connection.
 * @param {String} CLOSING             <small>Value <code>"closing"</code></small>
 *   The value of the state when Datachannel connection is closing.
 * @param {String} CLOSED              <small>Value <code>"closed"</code></small>
 *   The value of the state when Datachannel connection has closed.
 * @param {String} ERROR               <small>Value <code>"error"</code></small>
 *   The value of the state when Datachannel has encountered an exception during connection.
 * @param {String} CREATE_ERROR        <small>Value <code>"createError"</code></small>
 *   The value of the state when Datachannel has failed to establish a connection.
 * @param {String} BUFFERED_AMOUNT_LOW <small>Value <code>"bufferedAmountLow"</code></small>
 *   The value of the state when Datachannel when the amount of data buffered to be sent
 *   falls below the Datachannel threshold.
 *   <small>This state should occur only during after <a href="#method_sendBlobData">
 *   <code>sendBlobData()</code> method</a> or <a href="#method_sendURLData"><code>sendURLData()</code> method</a> or
 *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.</small>
 * @param {String} SEND_MESSAGE_ERROR  <small>Value <code>"sendMessageError"</code></small>
 *   The value of the state when Datachannel when data transfer packets or P2P message fails to send.
 *   <small>This state should occur only during after <a href="#method_sendBlobData">
 *   <code>sendBlobData()</code> method</a> or <a href="#method_sendURLData"><code>sendURLData()</code> method</a> or
 *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_CHANNEL_STATE = {
  CONNECTING: 'connecting',
  OPEN: 'open',
  CLOSING: 'closing',
  CLOSED: 'closed',
  ERROR: 'error',
  CREATE_ERROR: 'createError',
  BUFFERED_AMOUNT_LOW: 'bufferedAmountLow',
  SEND_MESSAGE_ERROR: 'sendMessageError'
};