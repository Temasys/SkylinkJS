import Skylink from '../../index';
import helpers from './index';

const buildStreamObject = (room, user, stream, settings) => ({
  id: stream.id,
  stream,
  isReplaced: false,
  settings: settings.settings,
  constraints: settings.getUserMediaSettings,
});

const addStreamToState = (room, stream, settings, isScreensharing) => {
  const updatedState = Skylink.getSkylinkState(room.id);
  const streamKey = isScreensharing ? 'screenshare' : 'userMedia';

  if (isScreensharing) {
    updatedState.streams[streamKey] = buildStreamObject(updatedState.room, updatedState.user, stream, settings);
  } else {
    updatedState.streams[streamKey] = updatedState.streams[streamKey] ? updatedState.streams[streamKey] : {};
    updatedState.streams[streamKey][stream.id] = buildStreamObject(updatedState.room, updatedState.user, stream, settings);
  }

  Skylink.setSkylinkState(updatedState, room.id);
};

const processNewStream = (room, stream, settings, isScreensharing) => {
  addStreamToState(room, stream, settings, isScreensharing);
  helpers.updateStreamsMutedSettings(room.id, settings, stream);
  helpers.updateStreamsMediaStatus(room.id, settings, stream);
};

export default processNewStream;
