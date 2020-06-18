import Skylink from '../../index';

const buildStreamSettings = (room, stream, settings) => {
  const updatedState = Skylink.getSkylinkState(room.id);
  updatedState.streamsSettings[stream.id] = {
    settings: settings.settings,
    constraints: settings.getUserMediaSettings,
  };

  Skylink.setSkylinkState(updatedState, room.id);
};

export default buildStreamSettings;
