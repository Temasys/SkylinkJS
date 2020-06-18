import Skylink from '../index';
import helpers from './helpers/index';
import stopStreamHelpers from './helpers/stopStream/index';
import logger from '../logger';
import MESSAGES from '../messages';
import { isAObj } from '../utils/helpers';
import { TAGS, TRACK_KIND } from '../constants';

/**
 * @private
 * @classdesc Class used for handling RTCMediaStream. Helper methods are listed inside <code>{@link MediaStreamHelpers}</code>.
 * @class
 */
class MediaStream {
  /**
   * @description Function that retrieves camera Stream.
   * @param {SkylinkState} state
   * @param {getUserMediaOptions} mediaOptions - The camera Stream configuration options.
   * @return {Promise}
   */
  static getUserMedia(state, mediaOptions = {}) {
    const { room } = state;
    const updatedRoomState = helpers.parseMediaOptions(mediaOptions, state);
    const { audio, video } = mediaOptions;
    const useExactConstraints = !!mediaOptions.useExactConstraints;
    Skylink.setSkylinkState(updatedRoomState, room.id);

    return helpers.prepMediaAccessRequest({
      useExactConstraints,
      audio,
      video,
      roomKey: room.id,
    });
  }

  /**
   * @description Function that filters user input from getUserMedia public method
   * @param {SkylinkState} roomState
   * @param {getUserMediaOptions} options
   */
  static processUserMediaOptions(roomState, options = null) {
    return new Promise((resolve, reject) => {
      let mediaOptions = {
        audio: true,
        video: true,
      };

      if (!options) {
        logger.log.WARN([roomState.user.sid, TAGS.MEDIA_STREAM, null, `${MESSAGES.MEDIA_STREAM.NO_OPTIONS} - ${MESSAGES.MEDIA_STREAM.DEFAULT_OPTIONS}`], mediaOptions);
      }

      if (!isAObj(options)) {
        logger.log.ERROR([roomState.user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.INVALID_GUM_OPTIONS], options);
        reject(new Error(MESSAGES.MEDIA_STREAM.ERRORS.INVALID_GUM_OPTIONS), null);
      }

      mediaOptions = options;

      const getUserMediaPromise = MediaStream.getUserMedia(roomState, mediaOptions);
      getUserMediaPromise.then((stream) => {
        resolve(stream);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * Function that stops the getUserMedia() streams.
   * @param {SkylinkState} roomState
   * @param {String} streamId - The id of the stream to stop if there is more than one getUserMedia stream.
   */
  static stopStreams(roomState, streamId) {
    return stopStreamHelpers.prepStopStreams(roomState.room.id, streamId);
  }

  /**
   * Function that sets User's Stream to send to Peer connection.
   * @param {String} targetMid - The mid of the target peer
   * @param {SkylinkState} roomState - Skylink State of current room
   */
  static addLocalMediaStreams(targetMid, roomState) {
    helpers.addLocalMediaStreams(targetMid, roomState);
  }

  /**
   * Function that handles the <code>RTCPeerConnection.ontrack</code> event on remote stream added.
   * @param {MediaStream} stream - {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStream}
   * @param {SkylinkState} currentRoomState - Current room state
   * @param {String} targetMid - The mid of the target peer
   * @param {boolean} [isScreensharing=false] - The flag if stream is a screenshare stream.
   */
  static onRemoteTrackAdded(stream, currentRoomState, targetMid, isScreensharing, isVideo, isAudio) {
    helpers.onRemoteTrackAdded(stream, currentRoomState, targetMid, isScreensharing, isVideo, isAudio);
  }

  /**
   * Function that mutes the stream.
   * @param {SkylinkState} roomState
   * @param {Object} options
   * @param {boolean} options.audioMuted
   * @param {boolean} options.videoMuted
   * @param {String} streamId
   */
  static muteStreams(roomState, options, streamId) {
    return helpers.muteStreams(roomState, options, streamId);
  }

  /**
   * Function that sends the MediaStream object if present or mediaStream settings.
   * @param {SkylinkState} roomState
   * @param {MediaStream|Object} options
   */
  static sendStream(roomState, options) {
    return helpers.sendStream(roomState, options);
  }

  static getStreamSources() {
    return helpers.getStreamSources();
  }

  /**
   * Function that returns all active streams including screenshare stream if present.
   * @param {SkylinkState} roomState
   * @param {boolean} includeSelf
   * @return {streamList} streamList
   */
  static getStreams(roomState, includeSelf) {
    return helpers.getStreams(roomState, includeSelf);
  }

  static usePrefetchedStream(roomKey, stream, options = null) {
    return new Promise((resolve) => {
      if (!stream && (options.id && options.active)) {
        // eslint-disable-next-line no-param-reassign
        stream = options;
      }

      const streamOptions = { audio: stream.getAudioTracks().length !== 0, video: stream.getVideoTracks().length !== 0 };
      const audioSettings = helpers.parseStreamSettings(streamOptions, TRACK_KIND.AUDIO);
      const videoSettings = helpers.parseStreamSettings(streamOptions, TRACK_KIND.VIDEO);
      const isAudioFallback = false;
      const streams = helpers.onStreamAccessSuccess(roomKey, stream, audioSettings, videoSettings, isAudioFallback, resolve);

      resolve(streams);
    });
  }

  static buildStreamSettings(room, stream, settings) {
    return helpers.buildStreamSettings(room, stream, settings);
  }
}

export default MediaStream;
