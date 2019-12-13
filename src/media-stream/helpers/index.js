import parseMediaOptions from './parseMediaOptions';
import processStreamInState from './processStreamInState';
import parseStreamSettings from './parseStreamSettings';
import prepMediaAccessRequest from './prepMediaAccessRequest';
import addLocalMediaStreams from './addLocalMediaStreams';
import onRemoteTrackAdded from './onRemoteTrackAdded';
import onStreamAccessError from './onStreamAccessError';
import replaceTrack from './replaceTrack';
import muteStream from './muteStream';
import sendStream from './sendStream';
import getStreamSources from './getStreamSources';
import retrieveStreams from './retrieveStreams';
import getScreenSources from './getScreenSources';
import updateStreamsMediaStatus from './updateStreamsMediaStatus';
import updateRemoteStreams from './updateRemoteStreams';
import retrieveVideoStreams from './retrieveVideoStreams';
import splitAudioAndVideoStream from './splitAudioAndVideoStream';
import processNewStream from './processNewStream';
import updateStreamsMutedSettings from './updateStreamsMutedSettings';
import onStreamAccessSuccess from './onStreamAccessSuccess';

/**
 * @namespace MediaStreamHelpers
 * @description All helper and utility functions for <code>{@link MediaStream}</code> class are listed here.
 * @private
 * @type {{parseMediaOptions, processStreamInState, parseStreamSettings, prepMediaAccessRequest, addLocalMediaStreams, onRemoteTrackAdded, onStreamAccessError, buildPeerStreamsInfo, replaceTrack, muteStream, getStreamSources, sendStream, retrieveStreams, getScreenSources, updateStreamsMediaStatus, updateRemoteStreams, retrieveVideoStreams, splitAudioAndVideoStream, processNewStream, updateStreamsMutedSettings, onStreamAccessSuccess}}
 */
const helpers = {
  parseMediaOptions,
  processStreamInState,
  parseStreamSettings,
  prepMediaAccessRequest,
  addLocalMediaStreams,
  onRemoteTrackAdded,
  onStreamAccessError,
  replaceTrack,
  muteStream,
  sendStream,
  getStreamSources,
  retrieveStreams,
  getScreenSources,
  updateStreamsMediaStatus,
  updateRemoteStreams,
  retrieveVideoStreams,
  splitAudioAndVideoStream,
  processNewStream,
  updateStreamsMutedSettings,
  onStreamAccessSuccess,
};

export default helpers;
