const retrieveValueGivenTransceiverMid = (state, peerId, transceiverMid, key) => {
  const { peerMedias } = state;
  const mediaInfos = Object.values(peerMedias[peerId]);
  for (let m = 0; m < mediaInfos.length; m += 1) {
    if (mediaInfos[m].transceiverMid === transceiverMid) {
      return mediaInfos[m][key];
    }
  }

  return null;
};

export default retrieveValueGivenTransceiverMid;
