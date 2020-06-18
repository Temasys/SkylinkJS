import Skylink from '../../index';

const isMatchedTrack = (streamTrack, track) => streamTrack.id === track.id;

const retrieveStreamIdOfTrack = (room, track) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerStreams, user } = state;
  const streams = Object.values(peerStreams[user.sid]);
  let streamId = null;

  for (let i = 0; i < streams.length; i += 1) {
    const tracks = streams[i].getTracks();

    for (let j = 0; j < tracks.length; j += 1) {
      if (isMatchedTrack(tracks[j], track)) {
        streamId = streams[i].id;
        break;
      }
    }
  }

  return streamId;
};

export default retrieveStreamIdOfTrack;
