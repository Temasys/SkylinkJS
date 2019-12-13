import clone from 'clone';
import Skylink from '../../index';

const retrieveFormattedMediaInfo = (room, peerId) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerMedias } = state;
  const mediaInfos = Object.values(peerMedias[peerId]);
  const formattedMediaInfos = [];

  for (let m = 0; m < mediaInfos.length; m += 1) {
    const mediaInfo = mediaInfos[m];
    const clonedMediaInfo = clone(mediaInfo);
    delete clonedMediaInfo.trackId;
    delete clonedMediaInfo.streamId;
    formattedMediaInfos.push(clonedMediaInfo);
  }

  return formattedMediaInfos;
};

export default retrieveFormattedMediaInfo;
