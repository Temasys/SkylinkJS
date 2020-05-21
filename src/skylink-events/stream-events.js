import {
  ON_INCOMING_STREAM,
  ON_INCOMING_SCREEN_STREAM,
  STREAM_ENDED,
  STREAM_MUTED,
} from './constants';

import SkylinkEvent from '../utils/skylinkEvent';

/**
 * @event SkylinkEvents.ON_INCOMING_STREAM
 * @description Event triggered when receiving Peer Stream.
 * @param {Object} detail - Event's payload.
 * @param {SkylinkRoom} detail.room - The current room
 * @param {String} detail.peerId - The peer's id
 * @param {MediaStream} detail.stream - The Stream object. To attach it to an element: <code>attachMediaStream(videoElement, stream);</code>.
 * @param {String} detail.streamId - The stream id.
 * @param {boolean} detail.isSelf -The flag if Peer is User.
 * @param {peerInfo} detail.peerInfo - The Peer session information.
 * @param {String} detail.isReplace - The The flag if the incoming stream has replaced an existing stream.
 * @param {String} detail.replacedStreamId - The streamId of the replaced stream.
 * @param {boolean} detail.isVideo - The flag if the incoming stream has a video track.
 * @param {boolean} detail.isAudio - The flag if the incoming stream has an audio track.
 * */
export const onIncomingStream = (detail = {}) => new SkylinkEvent(ON_INCOMING_STREAM, { detail });

/**
 * @event SkylinkEvents.ON_INCOMING_SCREEN_STREAM
 * @description Event triggered when receiving Peer Screenshare Stream.
 * @param {Object} detail - Event's payload.
 * @param {SkylinkRoom} detail.room - The current room.
 * @param {String} detail.peerId - The peer's id.
 * @param {MediaStream} detail.stream - The Stream object.
 * @param {String} detail.streamId - The Stream id.
 * @param {Boolean} detail.isSelf - The flag if Peer is User.
 * @param {peerInfo} detail.peerInfo - The Peer session information.
 * @param {Boolean} detail.isReplace - The flag if the incoming screenshare stream results from {@link Skylink#shareScreen|shareScreen} called
 * with <code>replaceUserMediaStream=true</code>.
 * @param {boolean} detail.isVideo - The flag if the incoming screen stream has a video track.
 * @param {boolean} detail.isAudio - The flag if the incoming screen stream has an audio track.
 * */
export const onIncomingScreenStream = (detail = {}) => new SkylinkEvent(ON_INCOMING_SCREEN_STREAM, { detail });

/**
 * @event SkylinkEvents.STREAM_ENDED
 * @description Event triggered when a Peer Stream streaming has stopped. Note that it may not be the currently sent Stream to User, and it also triggers when User leaves the Room for any currently sent Stream to User from Peer.
 * @param {Object} detail - Event's payload.
 * @param {String} detail.peerId - The Peer ID.
 * @param {SkylinkRoom} detail.room - The room.
 * @param {peerInfo} detail.peerInfo - The Peer session information. Object signature matches the <code>peerInfo</code> parameter payload received
 * in the <code> {@link SkylinkEvents.event:PEER_JOINED|PEER JOINED}</code> event.
 * @param {Boolean} detail.isSelf The flag if Peer is User.
 * @param {Boolean} detail.isScreensharing The flag if Peer Stream is a screensharing Stream.
 * @param {String} detail.streamId The Stream ID.
 * @param {boolean} detail.isVideo - The flag if the ended stream has a video track.
 * @param {boolean} detail.isAudio - The flag if the ended stream has an audio track.
 * */
export const streamEnded = (detail = {}) => new SkylinkEvent(STREAM_ENDED, { detail });

/**
 * @event SkylinkEvents.STREAM_MUTED
 * @description Event triggered when Peer Stream audio or video tracks has been muted / unmuted.
 * @param {Object} detail - Event's payload.
 * @param {String} detail.peerId -  The Peer ID.
 * @param {peerInfo} detail.peerInfo The Peer session information. Object signature matches the <code>peerInfo</code> parameter payload received in the <code> {@link SkylinkEvents.event:PEER_JOINED|PEER JOINED}</code> event.
 * @param {Boolean} detail.isSelf The flag if Peer is User.
 * @param {boolean} detail.isVideo - The flag if the muted stream has a video track.
 * @param {boolean} detail.isAudio - The flag if the muted stream has an audio track.
 * @param {boolean} detail.isScreensharing - The flag if the muted stream is a screensharing stream.
 * */
export const streamMuted = (detail = {}) => new SkylinkEvent(STREAM_MUTED, { detail });
