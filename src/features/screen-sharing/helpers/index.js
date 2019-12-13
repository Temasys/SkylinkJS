import handleScreenStreamStates from './updateScreenStreamState';
import { MEDIA_TYPE } from '../../../constants';
import { isEmptyObj } from '../../../utils/helpers';
import stopStreamHelpers from '../../../media-stream/helpers/stopStream';

const retrievePeersScreenStreamId = (state) => {
  const { peerMedias, user } = state;
  const peersScreenStreamId = {};

  const peerIds = Object.keys(peerMedias).filter(peerId => peerId !== user.sid);
  for (let i = 0; i < peerIds.length; i += 1) {
    const peerId = peerIds[i];
    Object.values(peerMedias[peerId]).forEach((mInfo) => {
      if (mInfo.mediaType === MEDIA_TYPE.VIDEO_SCREEN) {
        peersScreenStreamId[peerId] = mInfo.streamId;
      }
    });
  }

  return peersScreenStreamId;
};

const retrievePeerScreenStream = (state) => {
  const { remoteStreams } = state;
  const peersScreenStreamId = retrievePeersScreenStreamId(state);

  if (isEmptyObj(peersScreenStreamId)) {
    return null;
  }

  const peersScreenStream = {};

  Object.keys(peersScreenStreamId).forEach((peerId) => {
    const peerRemoteStreams = Object.values(remoteStreams[peerId]);
    // eslint-disable-next-line prefer-destructuring
    peersScreenStream[peerId] = peerRemoteStreams.filter(stream => stream.id === peersScreenStreamId[peerId].id);
  });

  return peersScreenStream;
};

const stopScreenStream = (room, screenStream) => {
  const fromLeaveRoom = false;
  const isScreensharing = true;
  stopStreamHelpers.prepStopStream(room.id, screenStream.id, fromLeaveRoom, isScreensharing);
};

const addScreenStreamCallbacks = (state, stream) => {
  const tracks = stream.getTracks();
  tracks.forEach((track) => {
    // eslint-disable-next-line no-param-reassign
    track.onended = () => stopScreenStream(state.room, stream);
  });
};

const helpers = {
  handleScreenStreamStates,
  addScreenStreamCallbacks,
  retrievePeersScreenStreamId,
  retrievePeerScreenStream,
  stopScreenStream,
};

export default helpers;
