/**
 * Function that returns all active user streams including screenshare stream if present.
 * @param {SkylinkState} roomState
 * @return {streamList} streamList
 * @memberOf MediaStreamHelpers
 */
const getStreams = (roomState) => {
  const { streams: { userMedia, screenshare } } = roomState;
  const streamList = {
    userMedia: null,
    screenshare: null,
  };

  if (!userMedia && !screenshare) {
    return streamList;
  }

  if (userMedia) {
    const streamIds = Object.keys(userMedia);
    streamList.userMedia = {};
    streamIds.forEach((streamId) => {
      streamList.userMedia[streamId] = userMedia[streamId].stream;
    });
  }

  if (screenshare) {
    streamList.screenshare = screenshare.stream;
  }

  return streamList;
};

export default getStreams;
