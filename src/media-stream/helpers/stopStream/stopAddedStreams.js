import stopStreamHelpers from './index';

const stopAddedStreams = (state, streams, isScreensharing) => {
  streams.forEach((stream) => {
    stopStreamHelpers.stopAddedStream(state, stream, isScreensharing);
  });
};

export default stopAddedStreams;
