import parseMediaOptions from './parseMediaOptions';
import parseStreamSettings from './parseStreamSettings';
import prepMediaAccessRequest from './prepMediaAccessRequest';
import addLocalMediaStreams from './addLocalMediaStreams';
import onRemoteTrackAdded from './onRemoteTrackAdded';
import onStreamAccessError from './onStreamAccessError';
import muteStreams from './muteStreams';
import sendStream from './sendStream';
import getStreamSources from './getStreamSources';
import getStreams from './getStreams';
import updateStreamsMediaStatus from './updateStreamsMediaStatus';
import splitAudioAndVideoStream from './splitAudioAndVideoStream';
import updateStreamsMutedSettings from './updateStreamsMutedSettings';
import onStreamAccessSuccess from './onStreamAccessSuccess';
import buildStreamSettings from './buildStreamSettings';

/**
 * @namespace MediaStreamHelpers
 * @description All helper and utility functions for <code>{@link MediaStream}</code> class are listed here.
 * @private
 * @type {{parseMediaOptions, parseStreamSettings, prepMediaAccessRequest, addLocalMediaStreams, onRemoteTrackAdded, onStreamAccessError, buildPeerStreamsInfo, muteStreams, getStreamSources, sendStream, getStreams, updateStreamsMediaStatus, splitAudioAndVideoStream, updateStreamsMutedSettings, onStreamAccessSuccess, buildStreamSettings}}
 */
const helpers = {
  parseMediaOptions,
  parseStreamSettings,
  prepMediaAccessRequest,
  addLocalMediaStreams,
  onRemoteTrackAdded,
  onStreamAccessError,
  muteStreams,
  sendStream,
  getStreamSources,
  getStreams,
  updateStreamsMediaStatus,
  splitAudioAndVideoStream,
  updateStreamsMutedSettings,
  onStreamAccessSuccess,
  buildStreamSettings,
};

export default helpers;
