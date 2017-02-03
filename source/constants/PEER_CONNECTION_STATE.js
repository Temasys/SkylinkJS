/**
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection session description exchanging states.
 * @attribute PEER_CONNECTION_STATE
 * @param {String} STABLE            <small>Value <code>"stable"</code></small>
 *   The value of the state when there is no session description being exchanged between Peer connection.
 * @param {String} HAVE_LOCAL_OFFER  <small>Value <code>"have-local-offer"</code></small>
 *   The value of the state when local <code>"offer"</code> session description is set.
 *   <small>This should transition to <code>STABLE</code> state after remote <code>"answer"</code>
 *   session description is set.</small>
 *   <small>See <a href="#event_handshakeProgress"><code>handshakeProgress</code> event</a> for a more
 *   detailed exchanging of session description states.</small>
 * @param {String} HAVE_REMOTE_OFFER <small>Value <code>"have-remote-offer"</code></small>
 *   The value of the state when remote <code>"offer"</code> session description is set.
 *   <small>This should transition to <code>STABLE</code> state after local <code>"answer"</code>
 *   session description is set.</small>
 *   <small>See <a href="#event_handshakeProgress"><code>handshakeProgress</code> event</a> for a more
 *   detailed exchanging of session description states.</small>
 * @param {String} CLOSED            <small>Value <code>"closed"</code></small>
 *   The value of the state when Peer connection is closed and no session description can be exchanged and set.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.PEER_CONNECTION_STATE = {
  STABLE: 'stable',
  HAVE_LOCAL_OFFER: 'have-local-offer',
  HAVE_REMOTE_OFFER: 'have-remote-offer',
  CLOSED: 'closed'
};