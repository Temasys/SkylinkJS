import {
  onIncomingStream,
  streamEnded,
  streamMuted,
  onIncomingScreenStream,
} from './stream-events';
import {
  onDataChannelStateChanged, onIncomingMessage, storedMessages, encryptionSecretsUpdated, persistentMessageState,
} from './datachannel-events';
import { handshakeProgress, introduceStateChange } from './peer-handshake-events';
import { readyStateChange } from './init-events';
import {
  candidateProcessingState,
  candidateGenerationState,
  candidatesGathered,
  iceConnectionState,
} from './candidate-events';
import { roomLock, bye, roomRejoin } from './room-events';
import {
  dataStreamState,
  dataTransferState,
  onIncomingData,
  onIncomingDataRequest,
  onIncomingDataStream,
  onIncomingDataStreamStarted,
  onIncomingDataStreamStopped,
} from './data-transfer-events';
import {
  peerUpdated,
  peerJoined,
  peerLeft,
  serverPeerJoined,
  serverPeerLeft,
  getPeersStateChange,
  peerConnectionState,
  sessionDisconnect,
  getConnectionStatusStateChange,
} from './peer-events';
import {
  channelClose,
  channelError,
  channelMessage,
  channelOpen,
  channelReopen,
  channelRetry,
  socketError,
  systemAction,
} from './socket-events';
import {
  mediaAccessFallback,
  mediaAccessRequired,
  mediaAccessStopped,
  mediaAccessSuccess,
  recordingState,
  localMediaMuted,
  mediaAccessError,
  rtmpState,
  mediaInfoDeleted,
} from './media-events';

import {
  loggedOnConsole,
} from './logger-events';

/**
 * @namespace SkylinkEvents
 * @description
 * <p>Also referenced as <code>SkylinkConstants.EVENTS</code></p>
 * <strong>PEER EVENTS</strong> </br>
 *  <ul>
 *    <li>{@link SkylinkEvents.event:PEER_UPDATED|PEER_UPDATED}</li>
 *    <li>{@link SkylinkEvents.event:PEER_JOINED|PEER_JOINED}</li>
 *    <li>{@link SkylinkEvents.event:PEER_LEFT|PEER_LEFT}</li>
 *    <li>{@link SkylinkEvents.event:SERVER_PEER_JOINED|SERVER_PEER_JOINED}</li>
 *    <li>{@link SkylinkEvents.event:SERVER_PEER_LEFT|SERVER_PEER_LEFT}</li>
 *    <li>{@link SkylinkEvents.event:GET_PEERS_STATE_CHANGE|GET_PEERS_STATE_CHANGE}</li>
 *    <li>{@link SkylinkEvents.event:PEER_CONNECTION_STATE|PEER_CONNECTION_STATE}</li>
 *    <li>{@link SkylinkEvents.event:SESSION_DISCONNECT|SESSION_DISCONNECT}</li>
 *    <li>{@link SkylinkEvents.event:GET_CONNECTION_STATUS_STATE_CHANGE|GET_CONNECTION_STATUS_STATE_CHANGE}</li>
 *  </ul>
 *  <strong>STREAM EVENTS</strong> </br>
 *  <ul>
 *    <li>{@link SkylinkEvents.event:ON_INCOMING_STREAM|ON_INCOMING_STREAM}</li>
 *    <li>{@link SkylinkEvents.event:ON_INCOMING_SCREEN_STREAM|ON_INCOMING_SCREEN_STREAM}</li>
 *    <li>{@link SkylinkEvents.event:STREAM_ENDED|STREAM_ENDED}</li>
 *    <li>{@link SkylinkEvents.event:STREAM_MUTED|STREAM_MUTED}</li>
 *  </ul>
 *  <strong>MEDIA EVENTS</strong> </br>
 *  <ul>
 *    <li>{@link SkylinkEvents.event:MEDIA_ACCESS_FALLBACK|MEDIA_ACCESS_FALLBACK}</li>
 *    <li>{@link SkylinkEvents.event:MEDIA_ACCESS_REQUIRED|MEDIA_ACCESS_REQUIRED}</li>
 *    <li>{@link SkylinkEvents.event:MEDIA_ACCESS_STOPPED|MEDIA_ACCESS_STOPPED}</li>
 *    <li>{@link SkylinkEvents.event:MEDIA_ACCESS_SUCCESS|MEDIA_ACCESS_SUCCESS}</li>
 *    <li>{@link SkylinkEvents.event:MEDIA_ACCESS_ERROR|MEDIA_ACCESS_ERROR}</li>
 *    <li>{@link SkylinkEvents.event:RECORDING_STATE|RECORDING_STATE}</li>
 *    <li>{@link SkylinkEvents.event:RTMP_STATE|RTMP_STATE}</li>
 *    <li>{@link SkylinkEvents.event:LOCAL_MEDIA_MUTED|LOCAL_MEDIA_MUTED}</li>
 *  </ul>
 *  <strong>DATA CHANNEL EVENTS</strong> </br>
 *  <ul>
 *    <li>{@link SkylinkEvents.event:DATA_CHANNEL_STATE|DATA_CHANNEL_STATE}</li>
 *    <li>{@link SkylinkEvents.event:ON_INCOMING_MESSAGE|ON_INCOMING_MESSAGE}</li>
 *    <li>{@link SkylinkEvents.event:STORED_MESSAGES|STORED_MESSAGES}</li>
 *    <li>{@link SkylinkEvents.event:ENCRYPT_SECRETS_UPDATED|ENCRYPT_SECRETS_UPDATED}</li>
 *    <li>{@link SkylinkEvents.event:PERSISTENT_MESSAGE_STATE|PERSISTENT_MESSAGE_STATE}</li>
 *  </ul>
 *  <strong>DATA TRANSFER EVENTS</strong> </br>
 *  <ul>
 *    <li>{@link SkylinkEvents.event:ON_INCOMING_DATA|ON_INCOMING_DATA}</li>
 *  </ul>
 *  <strong>CANDIDATE EVENTS</strong> </br>
 *  <ul>
 *    <li>{@link SkylinkEvents.event:CANDIDATE_PROCESSING_STATE|CANDIDATE_PROCESSING_STATE}</li>
 *    <li>{@link SkylinkEvents.event:CANDIDATE_GENERATION_STATE|CANDIDATE_GENERATION_STATE}</li>
 *    <li>{@link SkylinkEvents.event:CANDIDATES_GATHERED|CANDIDATES_GATHERED}</li>
 *    <li>{@link SkylinkEvents.event:ICE_CONNECTION_STATE|ICE_CONNECTION_STATE}</li>
 *  </ul>
 *  <strong>INIT EVENTS</strong> </br>
 *  <ul>
 *    <li>{@link SkylinkEvents.event:READY_STATE_CHANGE|READY_STATE_CHANGE}</li>
 *  </ul>
 *  <strong>PEER HANDSHAKE EVENTS</strong> </br>
 *  <ul>
 *    <li>{@link SkylinkEvents.event:HANDSHAKE_PROGRESS|HANDSHAKE_PROGRESS}</li>
 *  </ul>
 *  <strong>ROOM EVENTS</strong> </br>
 *  <ul>
 *    <li>{@link SkylinkEvents.event:ROOM_LOCK|ROOM_LOCK}</li>
 *  </ul>
 *  <strong>SOCKET EVENTS</strong> </br>
 *  <ul>
 *    <li>{@link SkylinkEvents.event:CHANNEL_OPEN|CHANNEL_OPEN}</li>
 *    <li>{@link SkylinkEvents.event:CHANNEL_CLOSE|CHANNEL_CLOSE}</li>
 *    <li>{@link SkylinkEvents.event:CHANNEL_ERROR|CHANNEL_ERROR}</li>
 *    <li>{@link SkylinkEvents.event:CHANNEL_MESSAGE|CHANNEL_MESSAGE}</li>
 *    <li>{@link SkylinkEvents.event:SOCKET_ERROR|SOCKET_ERROR}</li>
 *    <li>{@link SkylinkEvents.event:SYSTEM_ACTION|SYSTEM_ACTION}</li>
 *  </ul>
 * @example
 * Import SkylinkEventManager and SkylinkConstants from 'skylinkjs'
 *
 * Example 1: Adding a listener
 * SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ON_INCOMING_STREAM, evt => {
 *   const { detail } = evt;
 *   // do something
 * });
 *
 * Example 2: Removing a listener
 * SkylinkEventManager.removeEventListener(SkylinkConstants.EVENTS.ON_INCOMING_STREAM, evt => {
 *   const { detail } = evt;
 *   // do something
 * });
 * @since 2.0
 */
export {
  onIncomingStream,
  onIncomingScreenStream,
  streamEnded,
  streamMuted,
  peerUpdated,
  peerJoined,
  peerLeft,
  onDataChannelStateChanged,
  onIncomingMessage,
  storedMessages,
  handshakeProgress,
  serverPeerJoined,
  serverPeerLeft,
  candidateProcessingState,
  candidateGenerationState,
  candidatesGathered,
  getPeersStateChange,
  dataStreamState,
  dataTransferState,
  onIncomingData,
  onIncomingDataRequest,
  onIncomingDataStream,
  onIncomingDataStreamStarted,
  onIncomingDataStreamStopped,
  peerConnectionState,
  sessionDisconnect,
  channelClose,
  channelError,
  channelMessage,
  channelOpen,
  channelReopen,
  channelRetry,
  socketError,
  systemAction,
  mediaAccessFallback,
  mediaAccessRequired,
  mediaAccessStopped,
  mediaAccessSuccess,
  recordingState,
  localMediaMuted,
  mediaAccessError,
  getConnectionStatusStateChange,
  readyStateChange,
  roomLock,
  introduceStateChange,
  iceConnectionState,
  bye,
  rtmpState,
  loggedOnConsole,
  mediaInfoDeleted,
  encryptionSecretsUpdated,
  persistentMessageState,
  roomRejoin,
};
