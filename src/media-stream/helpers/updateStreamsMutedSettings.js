import Skylink from '../../index';

const updateStreamsMutedSettings = (roomKey, settings, stream) => {
  const updatedState = Skylink.getSkylinkState(roomKey);
  const { room, streamsMutedSettings } = updatedState;
  const { mutedSettings: { shouldAudioMuted, shouldVideoMuted }, settings: { audio, video } } = settings;

  streamsMutedSettings[stream.id] = {};
  streamsMutedSettings[stream.id].audioMuted = audio ? shouldAudioMuted : true;
  streamsMutedSettings[stream.id].videoMuted = video ? shouldVideoMuted : true;

  Skylink.setSkylinkState(updatedState, room.id);
};

export default updateStreamsMutedSettings;
