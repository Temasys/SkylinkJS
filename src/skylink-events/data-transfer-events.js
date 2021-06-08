import {
  DATA_STREAM_STATE,
  DATA_TRANSFER_STATE,
  ON_INCOMING_DATA,
  ON_INCOMING_DATA_REQUEST,
  ON_INCOMING_DATA_STREAM,
  ON_INCOMING_DATA_STREAM_STARTED,
  ON_INCOMING_DATA_STREAM_STOPPED,
} from './constants';

import SkylinkEvent from '../utils/skylinkEvent';

/**
 * @description Event triggered when a data streaming state has changed.
 * @event SkylinkEvents.dataStreamState
 * @param {Object} detail - Event's payload.
 * @param {SkylinkConstants.DATA_STREAM_STATE} detail.state The current data streaming state.
 * @param {String} detail.streamId The data streaming session ID.
 *   Note that this is defined as <code>null</code> when <code>state</code> payload is <code>START_ERROR</code>.
 * @param {String} detail.peerId The Peer ID.
 *   Note that this could be defined as <code>null</code> when <code>state</code> payload is
 *   <code>START_ERROR</code> and there is no Peers to start data streaming with.
 * @param {JSON} detail.streamInfo The data streaming information.
 * @param {Blob|String} [detail.streamInfo.chunk] The data chunk received.
 *   Defined only when <code>state</code> payload is <code>RECEIVED</code> or <code>SENT</code>.
 * @param {Number} detail.streamInfo.chunkSize The data streaming data chunk size received.
 * @param {SkylinkConstants.DATA_TRANSFER_DATA_TYPE} detail.streamInfo.chunkType The data streaming data chunk type received.
 *   The initial data chunks value may change depending on the currently received data chunk type or the
 *   agent supported sending type of data chunks.
 * @param {String} detail.streamInfo.isStringStream The flag if data streaming data chunks are strings.
 * @param {Boolean} detail.streamInfo.isPrivate The flag if data streaming is targeted or not, basing
 *   off the <code>targetPeerId</code> parameter being defined in
 *   {@link Skylink#startStreamingData}.
 * @param {String} detail.streamInfo.senderPeerId The sender Peer ID.
 * @param {Error} [detail.error] The error object.
 *   Defined only when <code>state</code> payload is <code>ERROR</code> or <code>START_ERROR</code>.
 * @ignore
 */
export const dataStreamState = detail => new SkylinkEvent(DATA_STREAM_STATE, { detail });

/**
 * @description Event triggered when a data transfer state has changed.
 * @event SkylinkEvents.dataTransferState
 * @param {Object} detail - Event's payload.
 * @param {SkylinkConstants.DATA_TRANSFER_STATE} detail.state The current data transfer state.
 * @param {String} detail.transferId The data transfer ID.
 *   Note that this is defined as <code>null</code> when <code>state</code> payload is <code>START_ERROR</code>.
 * @param {String} detail.peerId The Peer ID.
 *   Note that this could be defined as <code>null</code> when <code>state</code> payload is
 *   <code>START_ERROR</code> and there is no Peers to start data transfer with.
 * @param {JSON} detail.transferInfo The data transfer information.
 * @param {Blob|String} [detail.transferInfo.data] The data object.
 *   Defined only when <code>state</code> payload is <code>UPLOAD_STARTED</code> or
 *   <code>DOWNLOAD_COMPLETED</code>.
 * @param {String} detail.transferInfo.name The data transfer name.
 * @param {Number} detail.transferInfo.size The data transfer data object size.
 * @param {SkylinkConstants.DATA_TRANSFER_SESSION_TYPE} detail.transferInfo.dataType The data transfer session type.
 * @param {SkylinkConstants.DATA_TRANSFER_DATA_TYPE} detail.transferInfo.chunkType The data transfer type of data chunk being used to send to Peer for transfers.
 *   For {@link Skylink#sendBlobData} data transfers, the
 *   initial data chunks value may change depending on the currently received data chunk type or the
 *   agent supported sending type of data chunks.
 *   For {@link Skylink#sendURLData} data transfers, it is
 *   <code>STRING</code> always.
 * @param {String} [detail.transferInfo.mimeType] The data transfer data object MIME type.
 *   Defined only when {@link Skylink#sendBlobData}
 *   data object sent MIME type information is defined.
 * @param {Number} detail.transferInfo.chunkSize The data transfer data chunk size.
 * @param {Number} detail.transferInfo.percentage The data transfer percentage of completion progress.
 * @param {Number} detail.transferInfo.timeout The flag if data transfer is targeted or not, basing
 *   off the <code>targetPeerId</code> parameter being defined in
 *   {@link Skylink#sendURLData} or
 *   {@link Skylink#sendBlobData}.
 * @param {Boolean} detail.transferInfo.isPrivate The flag if message is targeted or not, basing
 *   off the <code>targetPeerId</code> parameter being defined in
 *   {@link Skylink#sendBlobData} or
 *   {@link Skylink#sendURLData}.
 * @param {SkylinkConstants.DATA_TRANSFER_TYPE} detail.transferInfo.direction The data transfer direction.
 * @param {JSON} [detail.error] The error result.
 *   Defined only when <code>state</code> payload is <code>ERROR</code>, <code>CANCEL</code>,
 *   <code>REJECTED</code>, <code>START_ERROR</code> or <code>USER_REJECTED</code>.
 * @param {Error|String} detail.error.message The error object.
 * @param {SkylinkConstants.DATA_TRANSFER_TYPE} detail.error.transferType The data transfer direction from where the error occurred.
 * @ignore
 */
export const dataTransferState = detail => new SkylinkEvent(DATA_TRANSFER_STATE, { detail });

/**
 * @event SkylinkEvents.ON_INCOMING_DATA
 * @description Event triggered when receiving completed data transfer from Peer.
 * @param {Object} detail - Event's payload.
 * @param {Blob|String} detail.data The data.
 * @param {String} detail.transferId The data transfer ID.
 * @param {String} detail.peerId The Peer ID.
 * @param {JSON} detail.transferInfo The data transfer information.
 *   Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   {@link SkylinkEvents.event:dataTransferState|dataTransferStateEvent}
 *   except without the <code>data</code> property.
 * @param {Boolean} detail.isSelf The flag if Peer is User.
 * @ignore
 */
export const onIncomingData = detail => new SkylinkEvent(ON_INCOMING_DATA, { detail });

/**
 * @description Event triggered when receiving upload data transfer from Peer.
 * @event SkylinkEvents.onIncomingDataRequest
 * @param {Object} detail - Event's payload.
 * @param {String} detail.transferId The transfer ID.
 * @param {String} detail.peerId The Peer ID.
 * @param {String} detail.transferInfo The data transfer information.
 *   Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   {@link SkylinkEvents.event:dataTransferState|dataTransferStateEvent}
 *   except without the <code>data</code> property.
 * @param {Boolean} detail.isSelf The flag if Peer is User.
 * @ignore
 */
export const onIncomingDataRequest = detail => new SkylinkEvent(ON_INCOMING_DATA_REQUEST, { detail });

/**
 * @description Event triggered when data streaming session has been stopped from Peer to User.
 * @event SkylinkEvents.onIncomingDataStream
 * @param {Object} detail - Event's payload.
 * @param {Blob|String} detail.chunk The data chunk received.
 * @param {String} detail.streamId The data streaming session ID.
 * @param {String} detail.peerId The Peer ID.
 * @param {JSON} detail.streamInfo The data streaming session information.
 *   Object signature matches the <code>streamInfo</code> parameter payload received in the
 *   {@link SkylinkEvents.event:dataStreamState|dataStreamStateEvent}
 *   except without the <code>chunk</code> property.
 * @param {Boolean} detail.isSelf The flag if Peer is User.
 * @ignore
 */
export const onIncomingDataStream = detail => new SkylinkEvent(ON_INCOMING_DATA_STREAM, { detail });

/**
 * @description Event triggered when data streaming session has been started from Peer to User.
 * @event SkylinkEvents.onIncomingDataStreamStarted
 * @param {Object} detail - Event's payload.
 * @param {String} detail.streamId The data streaming session ID.
 * @param {String} detail.peerId The Peer ID.
 * @param {JSON} detail.streamInfo The data streaming session information.
 *   Object signature matches the <code>streamInfo</code> parameter payload received in the
 *   {@link SkylinkEvents.event:dataStreamState|dataStreamStateEvent}
 *   except without the <code>chunk</code> property.
 * @param {Boolean} detail.isSelf The flag if Peer is User.
 * @ignore
 */
export const onIncomingDataStreamStarted = detail => new SkylinkEvent(ON_INCOMING_DATA_STREAM_STARTED, { detail });

/**
 * @description Event triggered when data streaming session has been stopped from Peer to User.
 * @event SkylinkEvents.onIncomingDataStreamStopped
 * @param {Object} detail - Event's payload.
 * @param {String} detail.streamId The data streaming session ID.
 * @param {String} detail.peerId The Peer ID.
 * @param {JSON} detail.streamInfo The data streaming session information.
 *   Object signature matches the <code>streamInfo</code> parameter payload received in the
 *   {@link SkylinkEvents.event:dataStreamState|dataStreamStateEvent}
 *   except without the <code>chunk</code> property.
 * @param {Boolean} detail.isSelf The flag if Peer is User.
 * @ignore
 */
export const onIncomingDataStreamStopped = detail => new SkylinkEvent(ON_INCOMING_DATA_STREAM_STOPPED, { detail });
