import {
  onIncomingStream,
  streamEnded,
  streamMuted,
  onIncomingScreenStream,
} from './stream-events';
import { onDataChannelStateChanged, onIncomingMessage } from './datachannel-events';
import { handshakeProgress, introduceStateChange } from './peer-handshake-events';
import { readyStateChange } from './init-events';
import {
  candidateProcessingState,
  candidateGenerationState,
  candidatesGathered,
  iceConnectionState,
} from './candidate-events';
import { roomLock, bye } from './room-events';
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
  serverPeerRestart,
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
 * @description Events triggered by SkylinkJS. Event constants referenced here - {@link SkylinkConstants.EVENTS}
 * @example
 * Import SkylinkEventManager and SkylinkConstants from 'skylink.esm.js'
 *
 * Example 1: Adding a listener
 * SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.INCOMING_STREAM, evt => {
 *   const { detail } = evt;
 *   // do something
 * });
 *
 * Example 2: Removing a listener
 * SkylinkEventManager.removeEventListener(SkylinkConstants.EVENTS.INCOMING_STREAM, evt => {
 *   const { detail } = evt;
 *   // do something
 * });
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
  handshakeProgress,
  serverPeerJoined,
  serverPeerLeft,
  serverPeerRestart,
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
};
