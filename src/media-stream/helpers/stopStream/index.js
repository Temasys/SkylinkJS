import prepStopStreams from './prepStopStreams';
import prepStopUserMediaStreams from './prepStopUserMediaStreams';
import stopAddedStream from './stopAddedStream';
import tryStopStream from './tryStopStream';
import removeTracks from './removeTracks';
import listenForEventAndDeleteMediaInfo from './listenForEventAndDeleteMediaInfo';
import stopAddedStreams from './stopAddedStreams';
import updateMediaInfoMediaState from './updateMediaInfoMediaState';
import dispatchEvents from './dispatchEvents';
import prepStopScreenStream from './prepStopScreenStream';
import initRefreshConnectionAndResolve from './initRefreshConnectionAndResolve';
import updateMediaStatusMutedSettings from './updateMediaStatusMutedSettings';

const stopStreamHelpers = {
  prepStopStreams,
  prepStopUserMediaStreams,
  stopAddedStream,
  tryStopStream,
  removeTracks,
  listenForEventAndDeleteMediaInfo,
  stopAddedStreams,
  updateMediaInfoMediaState,
  dispatchEvents,
  prepStopScreenStream,
  initRefreshConnectionAndResolve,
  updateMediaStatusMutedSettings,
};

export default stopStreamHelpers;
