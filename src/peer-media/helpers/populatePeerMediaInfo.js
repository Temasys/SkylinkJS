import { isEmptyObj } from '../../utils/helpers';

// peerMedia will have a previous state if setPeerMediaInfo is called from renegotiation
const peerMediaHasPreviousState = (clonedPeerMedia, mediaId) => !isEmptyObj(clonedPeerMedia) && clonedPeerMedia[mediaId];

const populatePeerMediaInfo = (updatedState, clonedPeerMedia, mediaInfo) => {
  const peerMedia = updatedState.peerMedias[mediaInfo.publisherId] || {};
  peerMedia[mediaInfo.mediaId] = mediaInfo;

  if (peerMediaHasPreviousState(clonedPeerMedia, mediaInfo.mediaId)) {
    peerMedia[mediaInfo.mediaId].streamId = (mediaInfo.transceiverMid === clonedPeerMedia[mediaInfo.mediaId].transceiverMid) ? clonedPeerMedia[mediaInfo.mediaId].streamId : '';
  }

  return peerMedia;
};

export default populatePeerMediaInfo;
