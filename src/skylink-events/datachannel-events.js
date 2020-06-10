import {
  DATA_CHANNEL_STATE, ON_INCOMING_MESSAGE, STORED_MESSAGES, ENCRYPT_SECRETS_UPDATED, PERSISTENT_MESSAGE_STATE,
} from './constants';

import SkylinkEvent from '../utils/skylinkEvent';

/**
 * @event SkylinkEvents.DATA_CHANNEL_STATE
 * @description Event triggered when a Datachannel connection state has changed.
 * @param {Object} detail - Event's payload.
 * @param {roomInfo} detail.room - The current room
 * @param {String} detail.peerId - The peer's id
 * @param {SkylinkConstants.DATA_CHANNEL_STATE} detail.state - The current Datachannel connection state.
 * @param {Error} detail.error - The error object. Defined only when <code>state</code> payload is <code>ERROR</code> or <code>SEND_MESSAGE_ERROR</code>.
 * @param {String} detail.channelName - The Datachannel ID.
 * @param {SkylinkConstants.DATA_CHANNEL_TYPE} detail.channelType - The Datachannel type.
 * @param {SkylinkConstants.DATA_CHANNEL_MESSAGE_ERROR} detail.messageType - The Datachannel sending Datachannel message error type.
 *   Defined only when <cod>state</code> payload is <code>SEND_MESSAGE_ERROR</code>.
 * @param {Object} detail.bufferAmount The Datachannel - buffered amount information.
 * @param {number} detail.bufferAmount.bufferedAmount - The size of currently queued data to send on the Datachannel connection.
 * @param {number} detail.bufferAmount.bufferedAmountLowThreshold - Threshold The current buffered amount low threshold configured.
 */
export const onDataChannelStateChanged = (detail = {}) => new SkylinkEvent(DATA_CHANNEL_STATE, { detail });

/**
 * @event SkylinkEvents.ON_INCOMING_MESSAGE
 * @description Event triggered when receiving message from Peer.
 * @param {Object} detail - Event's payload.
 * @param {roomInfo} detail.room - The current room
 * @param {JSON} detail.message - The message result.
 * @param {JSON|string} detail.message.content - The message.
 * @param {String} detail.message.senderPeerId - The sender Peer ID.
 * @param {String|Array} [detail.message.targetPeerId] The value of the <code>targetPeerId</code>
 *   defined in {@link Skylink#sendP2PMessage} or {@link Skylink#sendMessage|sendMessage}.
 *   Defined as User's Peer ID when <code>isSelf</code> payload value is <code>false</code>.
 *   Defined as <code>null</code> when provided <code>targetPeerId</code> in {@link Skylink#sendP2PMessage|sendP2PMessage} or
 *   {@link Skylink#sendMessage|sendMessage} is not defined.
 * @param {Array} [detail.message.listOfPeers] The list of Peers that the message has been sent to.
 *  Defined only when <code>isSelf</code> payload value is <code>true</code>.
 * @param {boolean} detail.message.isPrivate The flag if message is targeted or not, basing
 *   off the <code>targetPeerId</code> parameter being defined in
 *   {@link Skylink#sendP2PMessage|sendP2PMessage} or
 *   {@link Skylink#sendMessage|sendMessage}.
 * @param {boolean} detail.message.isDataChannel The flag if message is sent from
 *   {@link Skylink#sendP2PMessage|sendP2PMessage}.
 * @param {String} detail.message.timeStamp The time stamp when the message was sent.
 * @param {String} detail.peerId The Peer ID.
 * @param {peerInfo} detail.peerInfo The Peer session information.
 *   Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   {@link SkylinkEvents.event:PEER_JOINED|PEER JOINED} event.
 * @param {boolean} detail.isSelf - The flag if Peer is User.
 */
export const onIncomingMessage = (detail = {}) => new SkylinkEvent(ON_INCOMING_MESSAGE, { detail });

/**
 * @event SkylinkEvents.STORED_MESSAGES
 * @description Event triggered when receiving stored messages from the Signaling Server.
 * @param {Object} detail - Event's payload.
 * @param {roomInfo} detail.room - The current room
 * @param {Array} detail.storedMessages - The stored messages result.
 * @param {String} detail.storedMessages[].targetPeerId - The value of the <code>targetPeerId</code>
 *   defined in {@link Skylink#sendP2PMessage|sendP2PMessage} or {@link Skylink#sendMessage|sendMessage}.
 *   Defined as User's Peer ID when <code>isSelf</code> payload value is <code>false</code>.
 *   Defined as <code>null</code> when provided <code>targetPeerId</code> in {@link Skylink#sendP2PMessage|sendP2PMessage} or
 *   {@link Skylink#sendMessage|sendMessage} is not defined.
 * @param {JSON|String} detail.storedMessages[].senderPeerId - The sender Peer ID.
 * @param {JSON|String} detail.storedMessages[].content - The message.
 * @param {JSON|String} detail.storedMessages[].timeStamp - The timestamp when the message was sent, in simplified extended ISO format.
 * @param {boolean} detail.storedMessages.isPrivate - The flag if message is targeted or not, basing
 *   off the <code>targetPeerId</code> parameter being defined in {@link Skylink#sendP2PMessage|sendP2PMessage} or {@link Skylink#sendMessage|sendMessage}. Value will always
 *   be false for stored messages.
 * @param {boolean} detail.storedMessages.isDataChannel - The flag if message is sent from {@link Skylink#sendP2PMessage|sendP2PMessage}. Value will always be
 * true for stored messages.
 * @param {String} detail.peerId - The Peer ID.
 * @param {peerInfo} detail.peerInfo - The Peer session information.
 *   Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   {@link SkylinkEvents.event:PEER_JOINED|PEER JOINED} event.
 * @param {boolean} detail.isSelf - The flag if Peer is User.
 */
export const storedMessages = (detail = {}) => new SkylinkEvent(STORED_MESSAGES, { detail });

/**
 * @event SkylinkEvents.ENCRYPT_SECRETS_UPDATED
 * @description Event triggered when encrypt secret data is updated.
 * @param {Object} detail - Event's payload.
 * @param {roomInfo} detail.room - The current room
 * @param {Object} detail.encryptSecrets - The secretId and secret pair.
 * @param {String} detail.selectedSecretId - The id of the secret that is used for encryption and decryption of messages. If value is an
 * empty string, message will not be encrypted.
 * @param {String} detail.peerId - The Peer ID.
 * @param {peerInfo} detail.peerInfo - The Peer session information.
 *   Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   {@link SkylinkEvents.event:PEER_JOINED|PEER JOINED} event.
 */
export const encryptionSecretsUpdated = (detail = {}) => new SkylinkEvent(ENCRYPT_SECRETS_UPDATED, { detail });

/**
 * @event SkylinkEvents.PERSISTENT_MESSAGE_STATE
 * @description Event triggered when persistent message state changes.
 * @param {Object} detail - Event's payload.
 * @param {roomInfo} detail.room - The current room
 * @param {Object} detail.isPersistent - The flag if messages should be persistent.
 * @param {String} detail.peerId - The Peer ID.
 * @param {peerInfo} detail.peerInfo - The Peer session information.
 *   Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   {@link SkylinkEvents.event:PEER_JOINED|PEER JOINED} event.
 */
export const persistentMessageState = (detail = {}) => new SkylinkEvent(PERSISTENT_MESSAGE_STATE, { detail });
