import Skylink from '../../index';

const retrieveVideoStreams = (room) => {
  const state = Skylink.getSkylinkState(room.id);
  const { streams } = state;
  const videoStreams = [];
  Object.values(streams.userMedia).forEach((streamObj) => {
    if (streamObj.stream.getVideoTracks().length > 0) {
      videoStreams.push(streamObj.stream);
    }
  });

  return videoStreams;
};

export default retrieveVideoStreams;
