import stopStreamHelpers from './index';

const stopAddedStreams = (state, streams, isScreensharing, fromLeaveRoom) => {
  streams.forEach((stream) => {
    stopStreamHelpers.stopAddedStream(state, stream, isScreensharing, fromLeaveRoom);
  });
};

export default stopAddedStreams;
