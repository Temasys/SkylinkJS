import Skylink from '../../index';

const retrieveTracks = (room) => {
  const state = Skylink.getSkylinkState(room.id);
  const { streams } = state;
  const tracks = [];

  const fStreams = Object.values(streams.userMedia).map(streamObj => streamObj.stream);
  fStreams.forEach((stream) => {
    stream.getTracks().forEach((track) => {
      tracks.push(track);
    });
  });

  return tracks;
};

export default retrieveTracks;
