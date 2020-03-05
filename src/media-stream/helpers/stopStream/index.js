import prepStopStreams from './prepStopStreams';
import prepStopUserMediaStreams from './prepStopUserMediaStreams';
import stopAddedStream from './stopAddedStream';
import tryStopStream from './tryStopStream';
import removeTracks from './removeTracks';
import listenForEventAndDeleteMediaInfo from './listenForEventAndDeleteMediaInfo';
import stopAddedStreams from './stopAddedStreams';
import updateMediaInfoMediaState from './updateMediaInfoMediaState';
import deleteStreamFromState from './deleteStreamFromState';
import dispatchOnLocalStreamEnded from './dispatchOnLocalStreamEnded';
import prepStopScreenStream from './prepStopScreenStream';
import initRefreshConnectionAndResolve from './initRefreshConnectionAndResolve';
import stopReplacedStream from './stopReplacedStream';
import stopReplacedStreams from './stopReplacedStreams';

const stopStreamHelpers = {
  prepStopStreams,
  prepStopUserMediaStreams,
  stopAddedStream,
  tryStopStream,
  removeTracks,
  listenForEventAndDeleteMediaInfo,
  stopAddedStreams,
  updateMediaInfoMediaState,
  deleteStreamFromState,
  dispatchOnLocalStreamEnded,
  prepStopScreenStream,
  initRefreshConnectionAndResolve,
  stopReplacedStream,
  stopReplacedStreams,
};

export default stopStreamHelpers;
