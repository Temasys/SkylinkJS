/* eslint-disable no-nested-ternary */
import Skylink from '../../index';
import { MEDIA_STATUS } from '../../constants';

const updateStreamsMediaStatus = (roomKey, settings, stream) => {
  const updatedState = Skylink.getSkylinkState(roomKey);
  const { room, streamsMediaStatus } = updatedState;
  const { mutedSettings: { shouldAudioMuted }, settings: { audio, video } } = settings;

  streamsMediaStatus[stream.id] = {};
  streamsMediaStatus[stream.id].audioMuted = audio ? (shouldAudioMuted ? MEDIA_STATUS.MUTED : MEDIA_STATUS.ACTIVE) : MEDIA_STATUS.UNAVAILABLE;
  streamsMediaStatus[stream.id].videoMuted = video ? (shouldAudioMuted ? MEDIA_STATUS.MUTED : MEDIA_STATUS.ACTIVE) : MEDIA_STATUS.UNAVAILABLE;

  Skylink.setSkylinkState(updatedState, room.id);
};

export default updateStreamsMediaStatus;
