/**
 * @description Function that updates the removeStream method for Firefox.
 * @param peerConnection
 * @return {Function}
 * @memberOf module:Compatibility
 */
const updateRemoveStream = (peerConnection) => {
  const { getSenders, removeTrack } = peerConnection;

  return (stream) => {
    const { getTracks } = stream;
    const senders = getSenders();

    for (let s = 0; s < senders.length; s += 1) {
      const tracks = getTracks();
      for (let t = 0; t < tracks.length; t += 1) {
        if (tracks[t] === senders[s].track) {
          removeTrack(senders[s]);
        }
      }
    }
  };
};

export default updateRemoveStream;
