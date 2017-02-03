/**
 * The list of Peer connection states.
 * @attribute HANDSHAKE_PROGRESS
 * @param {String} ENTER   <small>Value <code>"enter"</code></small>
 *   The value of the connection state when Peer has just entered the Room.
 *   <small>At this stage, <a href="#event_peerJoined"><code>peerJoined</code> event</a>
 *   is triggered.</small>
 * @param {String} WELCOME <small>Value <code>"welcome"</code></small>
 *   The value of the connection state when Peer is aware that User has entered the Room.
 *   <small>At this stage, <a href="#event_peerJoined"><code>peerJoined</code> event</a>
 *   is triggered and Peer connection may commence.</small>
 * @param {String} OFFER   <small>Value <code>"offer"</code></small>
 *   The value of the connection state when Peer connection has set the local / remote <code>"offer"</code>
 *   session description to start streaming connection.
 * @param {String} ANSWER  <small>Value <code>"answer"</code></small>
 *   The value of the connection state when Peer connection has set the local / remote <code>"answer"</code>
 *   session description to establish streaming connection.
 * @param {String} ERROR   <small>Value <code>"error"</code></small>
 *   The value of the connection state when Peer connection has failed to establish streaming connection.
 *   <small>This happens when there are errors that occurs in creating local <code>"offer"</code> /
 *   <code>"answer"</code>, or when setting remote / local <code>"offer"</code> / <code>"answer"</code>.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.HANDSHAKE_PROGRESS = {
  ENTER: 'enter',
  WELCOME: 'welcome',
  OFFER: 'offer',
  ANSWER: 'answer',
  ERROR: 'error'
};