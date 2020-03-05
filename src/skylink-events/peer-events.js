import {
  PEER_UPDATED,
  PEER_JOINED,
  PEER_LEFT,
  SERVER_PEER_JOINED,
  SERVER_PEER_LEFT,
  GET_PEERS_STATE_CHANGE,
  PEER_CONNECTION_STATE,
  SESSION_DISCONNECT,
  GET_CONNECTION_STATUS_STATE_CHANGE,
} from './constants';
import SkylinkEvent from '../utils/skylinkEvent';

/**
 * @event SkylinkEvents.peerUpdated
 * @description Event triggered when a Peer session information has been updated.
 * @param {Object} detail - Event's payload.
 * @param {SkylinkRoom} detail.room - The current room
 * @param {String} detail.peerId - The peer's id
 * @param {boolean} detail.isSelf -The flag if Peer is User.
 * @param {peerInfo} detail.peerInfo - The Peer session information. Object signature matches the <code>peerInfo</code> parameter payload received in the <code>peerJoined</code> event.
 */
export const peerUpdated = (detail = {}) => new SkylinkEvent(PEER_UPDATED, { detail });

/**
 * @event SkylinkEvents.peerJoined
 * @description Event triggered when a Peer joins the room.
 * @param {Object} detail - Event's payload
 * @param {SkylinkRoom} detail.room - The current room.
 * @param {String} detail.peerId - The Peer ID.
 * @param {peerInfo} detail.peerInfo - The Peer session information.
 * @param {boolean} detail.isSelf - The flag if Peer is User.
 */
export const peerJoined = (detail = {}) => new SkylinkEvent(PEER_JOINED, { detail });

/**
 * @event SkylinkEvents.peerLeft
 * @description Event triggered when a Peer leaves the room.
 * @param {Object} detail - Event's payload.
 * @param {String} detail.peerId - The Peer ID.
 * @param {peerInfo} detail.peerInfo - The Peer session information. Object signature matches the <code>peerInfo</code> parameter payload received in the<code>peerJoined</code> event.
 * @param {boolean} detail.isSelf - The flag if Peer is User.
 */
export const peerLeft = (detail = {}) => new SkylinkEvent(PEER_LEFT, { detail });

/**
 * @event SkylinkEvents.serverPeerJoined
 * @description Event triggered when a server Peer joins the room.
 * @param {Object} detail - Event's payload.
 * @param {SkylinkRoom} detail.room - The current room
 * @param {String} detail.peerId - The peer's id
 * @param {SkylinkConstants.SERVER_PEER_TYPE} detail.serverPeerType - The server Peer type
 */
export const serverPeerJoined = (detail = {}) => new SkylinkEvent(SERVER_PEER_JOINED, { detail });

/**
 * @event SkylinkEvents.serverPeerLeft
 * @description Event triggered when a server Peer leaves the room.
 * @param {Object} detail - Event's payload
 * @param {String} detail.peerId - The Peer ID
 * @param {SkylinkRoom} detail.room - The room.
 * @param {SkylinkConstants.SERVER_PEER_TYPE} detail.serverPeerType - The server Peer type
 */
export const serverPeerLeft = (detail = {}) => new SkylinkEvent(SERVER_PEER_LEFT, { detail });

/**
 * @event SkylinkEvents.getPeersStateChange
 * @description Event triggered when <code>getPeers()</code> method retrieval state changes.
 * @param {Object} detail - Event's payload
 * @param {SkylinkConstants.GET_PEERS_STATE} detail.state - The current <code>getPeers()</code> retrieval state.
 * @param {SkylinkUser.sid} detail.privilegePeerId - The Users privileged Peer Id.
 * @param {Object} detail.peerList - The list of Peer IDs Rooms within the same App space.
 * @param {Array} detail.peerList.#room - The list of Peer IDs associated with the Room defined in <code>#room</code> property.
 * @memberOf SkylinkEvents
 */
export const getPeersStateChange = (detail = {}) => new SkylinkEvent(GET_PEERS_STATE_CHANGE, { detail });

/**
 * @event SkylinkEvents.peerConnectionState
 * @description Event triggered when a Peer connection session description exchanging state has changed.
 *  <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * @param {Object} detail - Event's payload
 * @param {SkylinkConstants.PEER_CONNECTION_STATE} detail.state - The current Peer connection session description exchanging states.
 * @param {String} detail.peerId - The Peer ID
 */
export const peerConnectionState = (detail = {}) => new SkylinkEvent(PEER_CONNECTION_STATE, { detail });

/**
 * @event SkylinkEvents.sessionDisconnect
 * @description Event triggered when Room session has ended abruptly due to network disconnections.
 * @param {Object} detail - Event's payload.
 * @param {String} detail.peerId - The User's Room session Peer ID
 * @param {peerInfo} detail.peerInfo - The User's Room session information. Object signature matches the <code>peerInfo</code> parameter payload received in the<code>peerJoined</code> event.
 */
export const sessionDisconnect = (detail = {}) => new SkylinkEvent(SESSION_DISCONNECT, { detail });

/**
 * Event triggered when <code>{@link PeerConnection.getConnectionStatus}</code> method
 * retrieval state changes.
 * @event SkylinkEvents.getConnectionStatusStateChange
 * @param {Object} detail - Event's payload/
 * @param {SkylinkConstants.GET_CONNECTION_STATUS_STATE} detail.state The current <code>getConnectionStatus()</code> retrieval state.
 * @param {String} detail.peerId The Peer ID.
 * @param {statistics} [detail.stats] The Peer connection current stats.
 * @param {Error} detail.error - The error object. Defined only when <code>state</code> payload is <code>RETRIEVE_ERROR</code>.
 */
export const getConnectionStatusStateChange = (detail = {}) => new SkylinkEvent(GET_CONNECTION_STATUS_STATE_CHANGE, { detail });
