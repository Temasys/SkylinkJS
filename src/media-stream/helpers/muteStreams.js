import logger from '../../logger';
import MESSAGES from '../../messages';
import {
  isABoolean, isANumber, isAObj, hasAudioTrack, hasVideoTrack, isEmptyArray,
} from '../../utils/helpers';
import { localMediaMuted, peerUpdated } from '../../skylink-events';
import { dispatchEvent, addEventListener, removeEventListener } from '../../utils/skylinkEventManager';
import PeerData from '../../peer-data/index';
import Skylink from '../../index';
import {
  MEDIA_STATUS, MEDIA_INFO, MEDIA_STATE, TRACK_KIND, EVENTS, HANDSHAKE_PROGRESS, PEER_TYPE,
} from '../../constants';
import PeerMedia from '../../peer-media/index';
import PeerStream from '../../peer-stream';
import { STREAM_MUTED } from '../../skylink-events/constants';

const dispatchStreamMutedEvent = (room, stream, isScreensharing) => {
  const roomState = Skylink.getSkylinkState(room.id);
  PeerStream.dispatchStreamEvent(STREAM_MUTED, {
    isSelf: true,
    peerId: roomState.user.sid,
    peerInfo: PeerData.getUserInfo(room),
    streamId: stream.id,
    isScreensharing,
    isAudio: hasAudioTrack(stream),
    isVideo: hasVideoTrack(stream),
  });
};

const dispatchPeerUpdatedEvent = (room) => {
  const roomState = Skylink.getSkylinkState(room.id);
  const isSelf = true;
  const peerId = roomState.user.sid;
  const peerInfo = PeerData.getCurrentSessionInfo(room);

  dispatchEvent(peerUpdated({
    isSelf,
    peerId,
    peerInfo,
  }));
};

const getAudioTracks = stream => stream.getAudioTracks();

const getVideoTracks = stream => stream.getVideoTracks();

const dispatchLocalMediaMutedEvent = (hasToggledVideo, hasToggledAudio, stream, roomKey, isScreensharing = false) => {
  const state = Skylink.getSkylinkState(roomKey);

  if ((hasVideoTrack(stream) && hasToggledVideo) || (hasAudioTrack(stream) && hasToggledAudio)) {
    dispatchEvent(localMediaMuted({
      streamId: stream.id,
      isScreensharing,
      mediaStatus: state.streamsMediaStatus[stream.id],
    }));
  }

  return true;
};

const updateMediaInfo = (hasToggledVideo, hasToggledAudio, room, streamId) => {
  const roomState = Skylink.getSkylinkState(room.id);
  const originalStreamId = streamId;
  const { streamsMutedSettings } = roomState;

  if (hasToggledVideo) {
    const mediaId = PeerMedia.retrieveMediaId(TRACK_KIND.VIDEO, originalStreamId);
    PeerMedia.updatePeerMediaInfo(room, roomState.user.sid, mediaId, MEDIA_INFO.MEDIA_STATE, streamsMutedSettings[originalStreamId].videoMuted ? MEDIA_STATE.MUTED : MEDIA_STATE.ACTIVE);
  }

  if (hasToggledAudio) {
    const mediaId = PeerMedia.retrieveMediaId(TRACK_KIND.AUDIO, originalStreamId);
    setTimeout(() => PeerMedia.updatePeerMediaInfo(room, roomState.user.sid, mediaId, MEDIA_INFO.MEDIA_STATE, streamsMutedSettings[originalStreamId].audioMuted ? MEDIA_STATE.MUTED : MEDIA_STATE.ACTIVE), hasToggledVideo ? 1050 : 0);
  }
};

const muteFn = (stream, state) => {
  const updatedState = state;
  const { room } = updatedState;
  const audioTracks = getAudioTracks(stream);
  const videoTracks = getVideoTracks(stream);
  updatedState.streamsMediaStatus[stream.id].audioMuted = MEDIA_STATUS.UNAVAILABLE;
  updatedState.streamsMediaStatus[stream.id].videoMuted = MEDIA_STATUS.UNAVAILABLE;

  audioTracks.forEach((audioTrack) => {
    // eslint-disable-next-line no-param-reassign
    audioTrack.enabled = !updatedState.streamsMutedSettings[stream.id].audioMuted;
    updatedState.streamsMediaStatus[stream.id].audioMuted = updatedState.streamsMutedSettings[stream.id].audioMuted ? MEDIA_STATUS.MUTED : MEDIA_STATUS.ACTIVE;
  });

  videoTracks.forEach((videoTrack) => {
    // eslint-disable-next-line no-param-reassign
    videoTrack.enabled = !updatedState.streamsMutedSettings[stream.id].videoMuted;
    updatedState.streamsMediaStatus[stream.id].videoMuted = updatedState.streamsMutedSettings[stream.id].videoMuted ? MEDIA_STATUS.MUTED : MEDIA_STATUS.ACTIVE;
  });

  Skylink.setSkylinkState(updatedState, room.id);

  logger.log.DEBUG(MESSAGES.MEDIA_STREAM.UPDATE_MEDIA_STATUS, updatedState.streamsMediaStatus, stream.id);
};

const retrieveToggleState = (state, options, streamId) => {
  const { peerStreams, streamsMutedSettings, user } = state;
  let hasToggledAudio = false;
  let hasToggledVideo = false;

  if (peerStreams[user.sid] && peerStreams[user.sid][streamId]) {
    if (hasAudioTrack(peerStreams[user.sid][streamId]) && streamsMutedSettings[streamId].audioMuted !== options.audioMuted) {
      hasToggledAudio = true;
    }

    if (hasVideoTrack(peerStreams[user.sid][streamId]) && streamsMutedSettings[streamId].videoMuted !== options.videoMuted) {
      hasToggledVideo = true;
    }
  }

  return {
    hasToggledAudio,
    hasToggledVideo,
  };
};

const updateStreamsMutedSettings = (state, toggleState, streamId) => {
  const updatedState = state;
  const { room } = updatedState;

  if (toggleState.hasToggledAudio) {
    updatedState.streamsMutedSettings[streamId].audioMuted = !updatedState.streamsMutedSettings[streamId].audioMuted;
  }

  if (toggleState.hasToggledVideo) {
    updatedState.streamsMutedSettings[streamId].videoMuted = !updatedState.streamsMutedSettings[streamId].videoMuted;
  }

  logger.log.DEBUG(MESSAGES.MEDIA_STREAM.UPDATE_MUTED_SETTINGS, updatedState.streamsMutedSettings, streamId);
  Skylink.setSkylinkState(updatedState, room.id);
};

const startMuteEvents = (roomKey, streamId, options) => {
  const roomState = Skylink.getSkylinkState(roomKey);
  const {
    room, peerConnections, peerInformations, peerStreams, user,
  } = roomState;
  const toggleState = retrieveToggleState(roomState, options, streamId);
  const { hasToggledAudio, hasToggledVideo } = toggleState;
  let mutedStream = null;

  if (peerStreams[user.sid] && peerStreams[user.sid][streamId]) {
    mutedStream = peerStreams[user.sid][streamId];
  }
  const isScreensharing = !!PeerMedia.retrieveScreenMediaInfo(room, user.sid, { streamId });

  if (!mutedStream) {
    return;
  }

  updateStreamsMutedSettings(roomState, toggleState, streamId);
  muteFn(mutedStream, roomState);
  dispatchLocalMediaMutedEvent(hasToggledVideo, hasToggledAudio, mutedStream, room.id, isScreensharing);
  dispatchPeerUpdatedEvent(room);
  dispatchStreamMutedEvent(room, mutedStream, isScreensharing);

  // wait for at least 1 connection before sending mediaInfoEvent otherwise sig message will be dropped at sendMediaInfoMsg if there are no
  // connections
  if ((!peerConnections[PEER_TYPE.MCU] && isEmptyArray(Object.keys(peerConnections))) || (peerConnections[PEER_TYPE.MCU] && isEmptyArray(Object.keys(peerInformations)))) { // no P2P peers || no MCU peers
    const updateMediaInfoAndRemoveListener = (evt) => {
      const { state } = evt.detail;
      if (state === HANDSHAKE_PROGRESS.ANSWER_ACK) {
        updateMediaInfo(hasToggledVideo, hasToggledAudio, room, streamId);
        removeEventListener(EVENTS.HANDSHAKE_PROGRESS, updateMediaInfoAndRemoveListener);
      }
    };

    addEventListener(EVENTS.HANDSHAKE_PROGRESS, updateMediaInfoAndRemoveListener);
  } else {
    // Workaround for sendStream with mute option and existing peerConnections throwing "no streamId" error message:
    // delay sending the mediaInfoEvent sig message to ensure that ontrack on the remote is fired and the streamId is populated in mediaInfo
    // before mediaInfoEvent is received
    setTimeout(() => {
      updateMediaInfo(hasToggledVideo, hasToggledAudio, room, streamId);
    }, 500);
  }
};

const retrieveMutedSetting = (mediaMutedOption) => {
  switch (mediaMutedOption) {
    case 1:
      return false;
    case 0:
      return true;
    default:
      return true;
  }
};

/**
 * @param {SkylinkState} roomState
 * @param {boolean} options
 * @param {boolean} options.audioMuted
 * @param {boolean} options.videoMuted
 * @param {String} streamId
 * @memberOf MediaStreamHelpers
 * @fires STREAM_MUTED
 * @fires PEER_UPDATED
 * @fires LOCAL_MEDIA_MUTED
 */
const muteStreams = (roomState, options, streamId = null) => {
  const {
    peerStreams, room, user,
  } = roomState;

  if (!isAObj(options)) {
    logger.log.ERROR(MESSAGES.MEDIA_STREAM.ERRORS.INVALID_MUTE_OPTIONS, options);
    return;
  }

  if (!peerStreams[user.sid]) {
    logger.log.WARN(MESSAGES.MEDIA_STREAM.ERRORS.NO_STREAM);
    return;
  }

  if (streamId && !peerStreams[user.sid][streamId]) {
    logger.log.ERROR(MESSAGES.MEDIA_STREAM.ERRORS.INVALID_MUTE_OPTIONS, options);
    return;
  }

  const fOptions = {
    // eslint-disable-next-line no-nested-ternary
    audioMuted: isABoolean(options.audioMuted) ? options.audioMuted : (isANumber(options.audioMuted) ? retrieveMutedSetting(options.audioMuted) : true),
    // eslint-disable-next-line no-nested-ternary
    videoMuted: isABoolean(options.videoMuted) ? options.videoMuted : (isANumber(options.videoMuted) ? retrieveMutedSetting(options.videoMuted) : true),
  };

  const streamIdsThatCanBeMuted = Object.keys(peerStreams[user.sid]) || [];

  if (isEmptyArray(streamIdsThatCanBeMuted)) {
    logger.log.ERROR(MESSAGES.MEDIA_STREAM.ERRORS.NO_STREAMS_MUTED, options);
    return;
  }

  const streamIdsToMute = Object.values(streamIdsThatCanBeMuted).filter(sId => (retrieveToggleState(roomState, fOptions, sId).hasToggledAudio || retrieveToggleState(roomState, fOptions, sId).hasToggledVideo));

  streamIdsToMute.forEach((streamIdToMute) => {
    startMuteEvents(room.id, streamIdToMute, fOptions);
  });
};

export default muteStreams;
