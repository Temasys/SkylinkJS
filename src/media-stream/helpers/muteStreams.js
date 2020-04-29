/* eslint-disable no-nested-ternary */
import logger from '../../logger';
import MESSAGES from '../../messages';
import {
  isABoolean, isANumber, isAObj, hasAudioTrack, hasVideoTrack, isEmptyArray,
} from '../../utils/helpers';
import SkylinkSignalingServer from '../../server-communication/signaling-server/index';
import { localMediaMuted, peerUpdated, streamMuted } from '../../skylink-events';
import { dispatchEvent, addEventListener, removeEventListener } from '../../utils/skylinkEventManager';
import PeerData from '../../peer-data/index';
import Skylink from '../../index';
import {
  MEDIA_STATUS, MEDIA_INFO, MEDIA_STATE, TRACK_KIND, EVENTS, HANDSHAKE_PROGRESS, PEER_TYPE,
} from '../../constants';
import PeerMedia from '../../peer-media/index';

const dispatchStreamMutedEvent = (room, stream, isScreensharing) => {
  const roomState = Skylink.getSkylinkState(room.id);
  dispatchEvent(streamMuted({
    isSelf: true,
    peerId: roomState.user.sid,
    peerInfo: PeerData.getUserInfo(room),
    streamId: stream.id,
    isScreensharing,
    isAudio: hasAudioTrack(stream),
    isVideo: hasVideoTrack(stream),
  }));
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

const retrieveOriginalActiveStreamId = (roomState, currentActiveStreamId, replacedStreamIds) => {
  let originalActiveStreamId = currentActiveStreamId;
  const { streams: { userMedia } } = roomState;
  const pReplacedStreamIds = replacedStreamIds || Object.keys(userMedia).filter(streamId => userMedia[streamId].isReplaced);

  if (pReplacedStreamIds.length === 0) {
    return originalActiveStreamId;
  }

  if (pReplacedStreamIds.indexOf(originalActiveStreamId) > -1) {
    pReplacedStreamIds.splice(pReplacedStreamIds.indexOf(originalActiveStreamId), 1);
  }

  if (pReplacedStreamIds.length > 1) {
    for (let i = 0; i < pReplacedStreamIds.length; i += 1) {
      if (userMedia[pReplacedStreamIds[i]].newStream && userMedia[pReplacedStreamIds[i]].newStream.id === originalActiveStreamId) {
        originalActiveStreamId = pReplacedStreamIds[i];
        retrieveOriginalActiveStreamId(roomState, originalActiveStreamId, pReplacedStreamIds);
        break;
      }
    }
  }

  return pReplacedStreamIds[0];
};

const updateMediaInfo = (hasToggledVideo, hasToggledAudio, room, streamId) => {
  const roomState = Skylink.getSkylinkState(room.id);
  const originalStreamId = retrieveOriginalActiveStreamId(roomState, streamId);
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

// eslint-disable-next-line no-unused-vars
const sendSigMsgs = (hasToggledVideo, hasToggledAudio, room, streamId) => {
  const roomState = Skylink.getSkylinkState(room.id);
  const signaling = new SkylinkSignalingServer();
  const originalStreamId = retrieveOriginalActiveStreamId(roomState, streamId);

  if (hasToggledVideo) {
    signaling.muteVideoEvent(room, originalStreamId);
  }

  if (hasToggledAudio) {
    setTimeout(() => signaling.muteAudioEvent(room, originalStreamId), hasToggledVideo ? 1050 : 0);
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
  const { streams, streamsMutedSettings } = state;
  let hasToggledAudio = false;
  let hasToggledVideo = false;

  if (streams.screenshare && streams.screenshare.id === streamId && streamsMutedSettings[streamId].videoMuted !== options.videoMuted) {
    hasToggledVideo = true;
  } else if (streams.userMedia && streams.userMedia[streamId]) {
    if (hasAudioTrack(streams.userMedia[streamId].stream) && streamsMutedSettings[streamId].audioMuted !== options.audioMuted) {
      hasToggledAudio = true;
    }

    if (hasVideoTrack(streams.userMedia[streamId].stream) && streamsMutedSettings[streamId].videoMuted !== options.videoMuted) {
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
    streams, room, peerConnections, peerInformations,
  } = roomState;
  const toggleState = retrieveToggleState(roomState, options, streamId);
  const { hasToggledAudio, hasToggledVideo } = toggleState;
  let mutedStream = null;
  let isScreensharing = false;

  if (streams.userMedia && streams.userMedia[streamId]) {
    mutedStream = streams.userMedia[streamId].stream;
  } else if (streams.screenshare && streams.screenshare.id === streamId) {
    mutedStream = streams.screenshare.stream;
    isScreensharing = true;
  }

  if (!mutedStream) {
    return;
  }

  updateStreamsMutedSettings(roomState, toggleState, streamId);
  muteFn(mutedStream, roomState);
  dispatchLocalMediaMutedEvent(hasToggledVideo, hasToggledAudio, mutedStream, room.id, isScreensharing);
  dispatchPeerUpdatedEvent(room);
  dispatchStreamMutedEvent(room, mutedStream, isScreensharing);
  // TODO: remove audioMuteEvent and videoMuteEvent
  // sendSigMsgs(hasToggledVideo, hasToggledAudio, room, streamId);

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

const isValidStreamId = (streamId, state) => {
  const { streams } = state;
  let isValid = false;

  Object.keys(streams.userMedia).forEach((gumStreamId) => {
    if (gumStreamId === streamId) {
      isValid = true;
    }
  });

  if (streams.screenshare && streams.screenshare.id === streamId) {
    isValid = true;
  }

  return isValid;
};

/**
 * @param {SkylinkState} roomState
 * @param {boolean} options
 * @param {boolean} options.audioMuted
 * @param {boolean} options.videoMuted
 * @param {String} streamId
 * @memberOf MediaStreamHelpers
 * @fires streamMuted, peerUpdated, localMediaMuted
 */
const muteStreams = (roomState, options, streamId = null) => {
  const {
    streams, room,
  } = roomState;

  if (!isAObj(options)) {
    logger.log.ERROR(MESSAGES.MEDIA_STREAM.ERRORS.INVALID_MUTE_OPTIONS, options);
    return;
  }

  if (!streams.userMedia && !streams.screenshare) {
    logger.log.WARN(MESSAGES.MEDIA_STREAM.ERRORS.NO_STREAM);
    return;
  }

  if (streamId && !isValidStreamId(streamId, roomState)) {
    logger.log.ERROR(MESSAGES.MEDIA_STREAM.ERRORS.INVALID_MUTE_OPTIONS, options);
    return;
  }

  const fOptions = {
    audioMuted: isABoolean(options.audioMuted) ? options.audioMuted : (isANumber(options.audioMuted) ? retrieveMutedSetting(options.audioMuted) : true),
    videoMuted: isABoolean(options.videoMuted) ? options.videoMuted : (isANumber(options.videoMuted) ? retrieveMutedSetting(options.videoMuted) : true),
  };

  let streamIdsThatCanBeMuted = [];
  if (streamId && ((streams.userMedia[streamId] && !streams.userMedia[streamId].isReplaced) || (streams.screenshare.id === streamId && !streams.screenshare.isReplaced))) {
    streamIdsThatCanBeMuted.push(streamId);
  } else {
    streamIdsThatCanBeMuted = Object.keys(streams.userMedia).filter(id => !streams.userMedia[id].isReplaced);
    if (streams.screenshare && !streams.screenshare.isReplaced) {
      streamIdsThatCanBeMuted.push(streams.screenshare.id);
    }
  }

  if (isEmptyArray(streamIdsThatCanBeMuted)) {
    logger.log.ERROR(MESSAGES.MEDIA_STREAM.ERRORS.NO_STREAMS_MUTED, options);
    return;
  }

  const streamIdsToMute = Object.values(streamIdsThatCanBeMuted).filter(sId => (retrieveToggleState(roomState, fOptions, sId).hasToggledAudio || retrieveToggleState(roomState, fOptions, sId).hasToggledVideo));

  streamIdsToMute.forEach((streamIdToMute, i) => {
    setTimeout(() => startMuteEvents(room.id, streamIdToMute, fOptions), i === 0 ? 0 : 1050);
    // TODO: Implement peerUpdatedEvent timeout here?
  });
};

export default muteStreams;
