import { DATA_CHANNEL_STATE, ON_INCOMING_MESSAGE } from './constants';

import SkylinkEvent from '../utils/skylinkEvent';

/**
 * @event SkylinkEvents.onDataChannelStateChanged
 * @description Event triggered when a Datachannel connection state has changed.
 * @param {Object} detail - Event's payload.
 * @param {SkylinkRoom} detail.room - The current room
 * @param {string} detail.peerId - The peer's id
 * @param {SkylinkConstants.DATA_CHANNEL_STATE} detail.state - The current Datachannel connection state.
 * @param {Error} detail.error - The error object. Defined only when <code>state</code> payload is <code>ERROR</code> or <code>SEND_MESSAGE_ERROR</code>.
 * @param {string} detail.channelName - The Datachannel ID.
 * @param {SkylinkConstants.DATA_CHANNEL_TYPE} detail.channelType - The Datachannel type.
 * @param {SkylinkConstants.DATA_CHANNEL_MESSAGE_ERROR} detail.messageType - The Datachannel sending Datachannel message error type.
 *   Defined only when <cod>state</code> payload is <code>SEND_MESSAGE_ERROR</code>.
 * @param {Object} detail.bufferAmount The Datachannel - buffered amount information.
 * @param {number} detail.bufferAmount.bufferedAmount - The size of currently queued data to send on the Datachannel connection.
 * @param {number} detail.bufferAmount.bufferedAmountLowThreshold - Threshold The current buffered amount low threshold configured.
 */
export const onDataChannelStateChanged = (detail = {}) => new SkylinkEvent(DATA_CHANNEL_STATE, { detail });

/**
 * @event SkylinkEvents.onIncomingMessage
 * @description Event triggered when receiving message from Peer.
 * @param {Object} detail - Event's payload.
 * @param {SkylinkRoom} detail.room - The current room
 * @param {JSON} detail.message - The message result.
 * @param {JSON|string} detail.message.content - The message object.
 * @param {string} detail.message.senderPeerId - The sender Peer ID.
 * @param {string|Array} [detail.message.targetPeerId] The value of the <code>targetPeerId</code>
 *   defined in {@link Skylink#sendP2PMessage} or
 *   {@link Skylink#sendMessage}.
 *   Defined as User's Peer ID when <code>isSelf</code> payload value is <code>false</code>.
 *   Defined as <code>null</code> when provided <code>targetPeerId</code> in
 *   {@link Skylink#sendP2PMessage} or
 *   {@link Skylink#sendMessage} is not defined.
 * @param {Array} [detail.message.listOfPeers] The list of Peers that the message has been sent to.
 *  Defined only when <code>isSelf</code> payload value is <code>true</code>.
 * @param {boolean} detail.message.isPrivate The flag if message is targeted or not, basing
 *   off the <code>targetPeerId</code> parameter being defined in
 *   {@link Skylink#sendP2PMessage} or
 *   {@link Skylink#sendMessage}.
 * @param {boolean} detail.message.isDataChannel The flag if message is sent from
 *   {@link Skylink#sendP2PMessage}.
 * @param {string} detail.peerId The Peer ID.
 * @param {peerInfo} detail.peerInfo The Peer session information.
 *   Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   {@link SkylinkEvents.event:peerJoined|peerJoinedEvent}.
 * @param {boolean} detail.isSelf - The flag if Peer is User.
 */
export const onIncomingMessage = (detail = {}) => new SkylinkEvent(ON_INCOMING_MESSAGE, { detail });
