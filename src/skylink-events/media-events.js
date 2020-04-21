import {
  MEDIA_ACCESS_FALLBACK,
  MEDIA_ACCESS_REQUIRED,
  MEDIA_ACCESS_STOPPED,
  MEDIA_ACCESS_SUCCESS,
  RECORDING_STATE,
  LOCAL_MEDIA_MUTED,
  MEDIA_ACCESS_ERROR,
  RTMP_STATE,
  MEDIA_INFO_DELETED,
} from './constants';
import SkylinkEvent from '../utils/skylinkEvent';

/**
 * @event SkylinkEvents.mediaAccessFallback
 * @description Event triggered when Stream retrieval fallback state has changed.
 * @param {Object} detail - Event's payload.
 * @param {JSON} detail.error - The error result.
 * @param {String} detail.error.error - The error object.
 * @param {JSON} detail.error.diff - The list of excepted but received audio and video tracks in Stream. Defined only when <code>state</code> payload is <code>FALLBACKED</code>.
 * @param {JSON} detail.error.video - The expected and received video tracks.
 * @param {Number} detail.error.video.expected - The expected video tracks.
 * @param {Number} detail.error.video.received - The received video tracks.
 * @param {JSON} detail.error.audio - The expected and received audio tracks.
 * @param {Number} detail.error.audio.expected - The expected audio tracks.
 * @param {Number} detail.error.audio.received - The received audio tracks.
 * @param {SkylinkConstants.MEDIA_ACCESS_FALLBACK_STATE} detail.state - The fallback state.
 * @param {boolean} detail.isScreensharing - The flag if event occurred during <code>shareScreen()</code> method and not <code>getUserMedia()</code> method.
 * @param {boolean} detail.isAudioFallback - The flag if event occurred during retrieval of audio tracks only when <code>getUserMedia()</code> method had failed to retrieve both audio and video tracks.
 * @param {String} detail.streamId - The Stream ID. Defined only when <code>state</code> payload is <code>FALLBACKED</code>.
 */
export const mediaAccessFallback = (detail = {}) => new SkylinkEvent(MEDIA_ACCESS_FALLBACK, { detail });

/**
 * @event SkylinkEvents.mediaAccessRequired
 * @description Event triggered when retrieval of Stream is required to complete <code>joinRoom()</code> method request.
 * @param {Object} detail -Event's payload.
 */
export const mediaAccessRequired = (detail = {}) => new SkylinkEvent(MEDIA_ACCESS_REQUIRED, { detail });

/**
 * @event SkylinkEvents.mediaAccessStopped
 * @description Event triggered when Stream has stopped streaming.
 * @param {Object} detail.isScreensharing - The flag if event occurred during <code>shareScreen()</code> method and not <code>getUserMedia()</code> method.
 * @param {boolean} detail.isAudioFallback - The flag if event occurred during retrieval of audio tracks only when <code>getUserMedia()</code> method had failed to retrieve both audio and video tracks.
 * @param {String} detail.streamId - The Stream ID.
 */
export const mediaAccessStopped = (detail = {}) => new SkylinkEvent(MEDIA_ACCESS_STOPPED, { detail });

/**
 * @event SkylinkEvents.mediaAccessSuccess
 * @description Event triggered when retrieval of Stream is successful.
 * @param {Object} detail
 * @param {MediaStream} detail.stream - The Stream object. To attach it to an element: <code>attachMediaStream(videoElement, stream);</code>.
 * @param {Boolean} detail.isScreensharing - The flag if event occurred during <code>shareScreen()</code> method and not <code>getUserMedia()</code> method.
 * @param {Boolean} detail.isAudioFallback - The flag if event occurred during retrieval of audio tracks only when <code>getUserMedia()</code> method had failed to retrieve both audio and video tracks.
 * @param {String} detail.streamId - The Stream ID.
 * @param {boolean} detail.isVideo - The flag if the incoming stream has a video track.
 * @param {boolean} detail.isAudio - The flag if the incoming stream has an audio track.
 * @alias SkylinkEvents.mediaAccessSuccess
 */
export const mediaAccessSuccess = (detail = {}) => new SkylinkEvent(MEDIA_ACCESS_SUCCESS, { detail });

/**
 * @event SkylinkEvents.recordingState
 * @description Event triggered when recording session state has changed.
 * @param {Object} detail - Event's payload.
 * @param {SkylinkConstants.RECORDING_STATE} detail.state - The current recording session state.
 * @param {String} detail.recordingId - The recording session ID.
 * @param {Error | String} detail.error - The error object. Defined only when <code>state</code> payload is <code>ERROR</code>.
 */
export const recordingState = (detail = {}) => new SkylinkEvent(RECORDING_STATE, { detail });

/**
 * @event SkylinkEvents.rtmpState
 * @description Event triggered when rtmp session state has changed.
 * @param {Object} detail - Event's payload.
 * @param {SkylinkConstants.RTMP_STATE} detail.state - The current recording session state.
 * @param {String} detail.rtmpId - The rtmp session ID.
 * @param {Error | String} detail.error - The error object. Defined only when <code>state</code> payload is <code>ERROR</code>.
 */
export const rtmpState = (detail = {}) => new SkylinkEvent(RTMP_STATE, { detail });

/**
 * @event SkylinkEvents.localMediaMuted
 * @description Event triggered when <code>muteStreams()</code> method changes User Streams audio and video tracks muted status.
 * @param {Object} detail - Event's payload.
 * @param {String} detail.streamId - The muted Stream Id.
 * @param {Boolean} detail.isScreensharing - The flag if the media muted was screensharing.
 * @param {JSON} detail.mediaStatus - The Peer streaming media status. This indicates the media status for both <code>getUserMedia()</code> Stream and <code>shareScreen()</code> Stream.
 * @param {Boolean} detail.mediaStatus.audioMuted - The value of the audio status. If Peer <code>mediaStatus</code> is <code>-1</code>, audio is not present in the stream. If Peer <code>mediaStatus</code> is <code>1</code>, audio is present
 *   in the stream and active (not muted). If Peer <code>mediaStatus</code> is <code>0</code>, audio is present in the stream and muted.
 * @param {Boolean} detail.mediaStatus.videoMuted - The value of the video status. If Peer <code>mediaStatus</code> is <code>-1</code>, video is not present in the stream. If Peer <code>mediaStatus</code> is <code>1</code>, video is present
 *   in the stream and active (not muted). If Peer <code>mediaStatus</code> is <code>0</code>, video is present in the stream and muted.
 */
export const localMediaMuted = (detail = {}) => new SkylinkEvent(LOCAL_MEDIA_MUTED, { detail });

/**
 * @event SkylinkEvents.mediaAccessError
 * @description Event triggered when retrieval of Stream failed.
 * @param {Object} detail - Event's payload.
 * @param {Error | String} detail.error - The error object.
 * @param {Boolean} detail.isScreensharing - The flag if event occurred during <code>shareScreen()</code> method and not <code>getUserMedia()</code> method.
 * @param {Boolean} detail.isAudioFallbackError - The flag if event occurred during retrieval of audio tracks only when <code>getUserMedia()</code> method had failed to retrieve both audio and video tracks.
 */
export const mediaAccessError = (detail = {}) => new SkylinkEvent(MEDIA_ACCESS_ERROR, { detail });

/**
 * @event SkylinkEvents.mediaInfo
 * @description Event triggered when media info changes.
 * @param {Object} detail - Event's payload.
 * @param {Object} detail.mediaInfo - The media info object.
 * @private
 */
export const mediaInfoDeleted = (detail = {}) => new SkylinkEvent(MEDIA_INFO_DELETED, { detail });
