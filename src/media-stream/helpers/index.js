import parseMediaOptions from './parseMediaOptions';
import processStreamInState from './processStreamInState';
import parseStreamSettings from './parseStreamSettings';
import prepMediaAccessRequest from './prepMediaAccessRequest';
import addLocalMediaStreams from './addLocalMediaStreams';
import onRemoteTrackAdded from './onRemoteTrackAdded';
import onStreamAccessError from './onStreamAccessError';
import replaceTrack from './replaceTrack';
import muteStreams from './muteStreams';
import sendStream from './sendStream';
import getStreamSources from './getStreamSources';
import getStreams from './getStreams';
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
 * @type {{parseMediaOptions, processStreamInState, parseStreamSettings, prepMediaAccessRequest, addLocalMediaStreams, onRemoteTrackAdded, onStreamAccessError, buildPeerStreamsInfo, replaceTrack, muteStreams, getStreamSources, sendStream, getStreams, updateStreamsMediaStatus, updateRemoteStreams, retrieveVideoStreams, splitAudioAndVideoStream, processNewStream, updateStreamsMutedSettings, onStreamAccessSuccess}}
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
  muteStreams,
  sendStream,
  getStreamSources,
  getStreams,
  updateStreamsMediaStatus,
  updateRemoteStreams,
  retrieveVideoStreams,
  splitAudioAndVideoStream,
  processNewStream,
  updateStreamsMutedSettings,
  onStreamAccessSuccess,
};

export default helpers;
