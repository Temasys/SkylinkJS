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
 * @event SkylinkEvents.PEER_UPDATED
 * @description Event triggered when a Peer session information has been updated.
 * @param {Object} detail - Event's payload.
 * @param {roomInfo} detail.room - The current room
 * @param {String} detail.peerId - The peer's id
 * @param {boolean} detail.isSelf -The flag if Peer is User.
 * @param {peerInfo} detail.peerInfo - The Peer session information. Object signature matches the <code>peerInfo</code> parameter payload received in the <code> {@link SkylinkEvents.event:PEER_JOINED|PEER JOINED}</code> event.
 */
export const peerUpdated = (detail = {}) => new SkylinkEvent(PEER_UPDATED, { detail });

/**
 * @event SkylinkEvents.PEER_JOINED
 * @description Event triggered when a Peer joins the room.
 * <blockquote><code>PEER_JOINED</code> event with <code>isSelf=true</code> indicates that the local peer has successfully joined the
 * room. All call actions should be done after the <code>PEER_JOINED</code> event is registered.
 * If <code>MCU</code> feature is enabled on the appKey, {@link SkylinkEvents.event:SERVER_PEER_JOINED|SERVER PEER JOINED} is the
 * corresponding event.
 * </blockquote>
 * @param {Object} detail - Event's payload
 * @param {roomInfo} detail.room - The current room.
 * @param {String} detail.peerId - The Peer ID.
 * @param {peerInfo} detail.peerInfo - The Peer session information.
 * @param {boolean} detail.isSelf - The flag if Peer is User.
 */
export const peerJoined = (detail = {}) => new SkylinkEvent(PEER_JOINED, { detail });

/**
 * @event SkylinkEvents.PEER_LEFT
 * @description Event triggered when a Peer leaves the room.
 * @param {Object} detail - Event's payload.
 * @param {String} detail.peerId - The Peer ID.
 * @param {peerInfo} detail.peerInfo - The Peer session information. Object signature matches the <code>peerInfo</code> parameter payload received in the<code>peerJoined</code> event.
 * @param {boolean} detail.isSelf - The flag if Peer is User.
 * @param {roomInfo} detail.room - The room.
 */
export const peerLeft = (detail = {}) => new SkylinkEvent(PEER_LEFT, { detail });

/**
 * @event SkylinkEvents.SERVER_PEER_JOINED
 * @description Event triggered when a server Peer joins the room.
 *  * <blockquote><code>SERVER_PEER_JOINED</code> event indicates that the <code>MCU</code> has successfully joined the
 * room. All call actions should be done after the <code>SERVER_PEER_JOINED</code> event is registered.
 * For <code>P2P</code> key, {@link SkylinkEvents.event:PEER_JOINED|PEER JOINED} is the
 * corresponding event.
 * </blockquote>
 * @param {Object} detail - Event's payload.
 * @param {roomInfo} detail.room - The current room
 * @param {String} detail.peerId - The peer's id
 * @param {SkylinkConstants.PEER_TYPE} detail.serverPeerType - The server Peer type
 */
export const serverPeerJoined = (detail = {}) => new SkylinkEvent(SERVER_PEER_JOINED, { detail });

/**
 * @event SkylinkEvents.SERVER_PEER_LEFT
 * @description Event triggered when a server Peer leaves the room.
 * - Handling an MCU disconnect using the <code>serverPeerLeft</code> event - {@link Reconnection}
 * @param {Object} detail - Event's payload
 * @param {String} detail.peerId - The Peer ID
 * @param {roomInfo} detail.room - The room.
 * @param {SkylinkConstants.PEER_TYPE} detail.serverPeerType - The server Peer type
 */
export const serverPeerLeft = (detail = {}) => new SkylinkEvent(SERVER_PEER_LEFT, { detail });

/**
 * @event SkylinkEvents.GET_PEERS_STATE_CHANGE
 * @description Event triggered when <code>{@link Skylink#getPeers|getPeers}</code> method retrieval state changes.
 * @param {Object} detail - Event's payload
 * @param {SkylinkConstants.GET_PEERS_STATE} detail.state - The current <code>{@link Skylink#getPeers|getPeers}</code> retrieval state.
 * @param {SkylinkUser.sid} detail.privilegePeerId - The Users privileged Peer Id.
 * @param {Object} detail.peerList - The list of Peer IDs Rooms within the same App space.
 * @param {Array} detail.peerList.#room - The list of Peer IDs associated with the Room defined in <code>#room</code> property.
 * @memberOf SkylinkEvents
 */
export const getPeersStateChange = (detail = {}) => new SkylinkEvent(GET_PEERS_STATE_CHANGE, { detail });

/**
 * @event SkylinkEvents.PEER_CONNECTION_STATE
 * @description Event triggered when a Peer connection session description exchanging state has changed.
 *  <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.io/ice-and-webrtc-what-is-this-sorcery-we-explain/">article here</a>.
 * </blockquote>
 * @param {Object} detail - Event's payload
 * @param {SkylinkConstants.PEER_CONNECTION_STATE} detail.state - The current Peer connection session description exchanging states.
 * @param {String} detail.peerId - The Peer ID
 */
export const peerConnectionState = (detail = {}) => new SkylinkEvent(PEER_CONNECTION_STATE, { detail });

/**
 * @event SkylinkEvents.SESSION_DISCONNECT
 * @description Event triggered when Room session has ended abruptly due to network disconnections.
 * - Handling a socket disconnect using the <code>sessionDisconnect</code> event - {@link Reconnection}
 * @param {Object} detail - Event's payload.
 * @param {String} detail.peerId - The User's Room session Peer ID
 * @param {peerInfo} detail.peerInfo - The User's Room session information. Object signature matches the <code>peerInfo</code> parameter payload received in the<code> {@link SkylinkEvents.event:PEER_JOINED|PEER JOINED}</code> event.
 * @param {peerInfo} detail.reason - Reason for the disconnect
 */
export const sessionDisconnect = (detail = {}) => new SkylinkEvent(SESSION_DISCONNECT, { detail });

/**
 * Event triggered when <code>{@link
  * Skylink#getConnectionStatus|getConnectionStatus}</code> method
 * retrieval state changes.
 * @event SkylinkEvents.GET_CONNECTION_STATUS_STATE_CHANGE
 * @param {Object} detail - Event's payload/
 * @param {SkylinkConstants.GET_CONNECTION_STATUS_STATE} detail.state The current retrieval state from <code>{@link
  * Skylink#getConnectionStatus|getConnectionStatus}</code> method.
 * @param {String} detail.peerId The Peer ID.
 * @param {statistics} [detail.stats] The Peer connection current stats.
 * @param {Error} detail.error - The error object. Defined only when <code>state</code> payload is <code>RETRIEVE_ERROR</code>.
 */
export const getConnectionStatusStateChange = (detail = {}) => new SkylinkEvent(GET_CONNECTION_STATUS_STATE_CHANGE, { detail });
