import Skylink from '../../index';

const updateStreamsMutedSettings = (roomKey, settings, stream) => {
  const updatedState = Skylink.getSkylinkState(roomKey);
  const { room, streamsMutedSettings } = updatedState;
  const { audio, video } = settings.settings;

  streamsMutedSettings[stream.id] = {};
  streamsMutedSettings[stream.id].audioMuted = !audio;
  streamsMutedSettings[stream.id].videoMuted = !video;

  Skylink.setSkylinkState(updatedState, room.id);
};

export default updateStreamsMutedSettings;
