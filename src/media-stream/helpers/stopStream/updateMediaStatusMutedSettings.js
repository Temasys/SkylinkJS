import Skylink from '../../../index';

const updateMediaStatusMutedSettings = (room, stream) => {
  const updatedState = Skylink.getSkylinkState(room.id);

  delete updatedState.streamsMediaStatus[stream.id];
  delete updatedState.streamsMutedSettings[stream.id];
  delete updatedState.streamsSettings[stream.id];

  Skylink.setSkylinkState(updatedState, room.id);
};

export default updateMediaStatusMutedSettings;
