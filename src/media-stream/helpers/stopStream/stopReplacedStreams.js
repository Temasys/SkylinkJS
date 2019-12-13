import stopStreamHelpers from './index';

const stopReplacedStreams = (state, streams, isScreensharing, fromLeaveRoom) => {
  streams.forEach((stream) => {
    stopStreamHelpers.stopReplacedStream(state, stream, isScreensharing, fromLeaveRoom);
  });
};

export default stopReplacedStreams;
