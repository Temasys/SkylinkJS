import Skylink from '../../index';

const isMatchedTrack = (streamTrack, track) => streamTrack.id === track.id;

const retrieveStreamIdOfTrack = (room, track) => {
  const state = Skylink.getSkylinkState(room.id);
  const { streams } = state;
  const streamObjs = Object.values(streams.userMedia);
  let streamId = null;

  for (let i = 0; i < streamObjs.length; i += 1) {
    const tracks = streamObjs[i].stream.getTracks();

    for (let j = 0; j < tracks.length; j += 1) {
      if (isMatchedTrack(tracks[j], track)) {
        streamId = streamObjs[i].id;
        break;
      }
    }
  }

  return streamId;
};

export default retrieveStreamIdOfTrack;
