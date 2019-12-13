import prepStopStream from './prepStopStream';
import prepStopUserMediaStream from './prepStopUserMediaStream';
import stopAddedStream from './stopAddedStream';
import tryStopStream from './tryStopStream';
import removeTracks from './removeTracks';
import listenForEventAndDeleteMediaInfo from './listenForEventAndDeleteMediaInfo';
import stopAddedStreams from './stopAddedStreams';
import updateMediaInfoMediaState from './updateMediaInfoMediaState';
import deleteStreamFromState from './deleteStreamFromState';
import dispatchOnLocalStreamEnded from './dispatchOnLocalStreamEnded';
import prepStopScreenStream from './prepStopScreenStream';
import initRefreshConnection from './initRefreshConnection';
import stopReplacedStream from './stopReplacedStream';
import stopReplacedStreams from './stopReplacedStreams';

const stopStreamHelpers = {
  prepStopStream,
  prepStopUserMediaStream,
  stopAddedStream,
  tryStopStream,
  removeTracks,
  listenForEventAndDeleteMediaInfo,
  stopAddedStreams,
  updateMediaInfoMediaState,
  deleteStreamFromState,
  dispatchOnLocalStreamEnded,
  prepStopScreenStream,
  initRefreshConnection,
  stopReplacedStream,
  stopReplacedStreams,
};

export default stopStreamHelpers;
