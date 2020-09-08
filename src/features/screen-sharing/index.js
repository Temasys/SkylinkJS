import PeerConnection from '../../peer-connection';
import SkylinkSignalingServer from '../../server-communication/signaling-server';
import mediaStreamHelpers from '../../media-stream/helpers/index';
import logger from '../../logger';
import MESSAGES from '../../messages';
import { isAObj, isEmptyObj } from '../../utils/helpers';
import { DEFAULTS } from '../../defaults';
import screenshareHelpers from './helpers/index';
import { TAGS } from '../../constants';

const screensharingInstance = {};

/**
 * @classdesc Class used for handling Screensharing.
 * @class
 * @private
 */
class ScreenSharing {
  constructor(roomState) {
    const { room } = roomState;

    if (screensharingInstance[room.id]) {
      return screensharingInstance[room.id];
    }

    this.roomState = roomState;
    this.stream = null;
    this.signaling = new SkylinkSignalingServer();
    this.streamId = null;
    this.settings = null;

    screensharingInstance[room.id] = this;
  }

  streamExists() {
    const streamList = mediaStreamHelpers.getStreams(this.roomState, this.roomState.room.name);
    const streamIds = Object.keys(streamList.userMedia);

    for (let i = 0; i < streamIds.length; i += 1) {
      if (streamIds[i] === this.streamId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Function that starts the screenshare.
   * @param {String} streamId
   * @param {Object} options
   * @return {MediaStream}
   */
  async start(streamId = null, options) {
    this.streamId = streamId;
    this.settings = this.isValidOptions(options) ? mediaStreamHelpers.parseStreamSettings(options) : mediaStreamHelpers.parseStreamSettings(DEFAULTS.MEDIA_OPTIONS.SCREENSHARE);

    try {
      this.checkForExistingScreenStreams();

      this.stream = await this.startScreenCapture(options);
      if (!this.stream) {
        this.deleteScreensharingInstance(this.roomState.room);
        return null;
      }

      screenshareHelpers.onScreenStreamAccessSuccess(this.roomState.room.id, this.stream, null, this.settings, false, true);
      screenshareHelpers.addScreenStreamCallbacks(this.roomState, this.stream);
      this.addScreenshareStream();
    } catch (error) {
      logger.log.ERROR([this.roomState.user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.START_SCREEN], error);
    }

    return this.stream;
  }

  /**
   * Function that stops the screenshare.
   * @param {Boolean} fromLeaveRoom
   * @return {MediaStream}
   */
  stop(fromLeaveRoom = false) {
    if (!this.stream) {
      logger.log.DEBUG([this.roomState.user.sid, TAGS.MEDIA_STREAM, null, `${MESSAGES.MEDIA_STREAM.ERRORS.STOP_SCREEN} - ${MESSAGES.MEDIA_STREAM.ERRORS.NO_STREAM}`]);
      return null;
    }

    try {
      screenshareHelpers.stopScreenStream(this.roomState.room, this.stream, this.roomState.user.sid, fromLeaveRoom);
      this.streamId = null;
      this.stream = null;
    } catch (error) {
      logger.log.ERROR([this.roomState.user.sid, TAGS.MEDIA_STREAM, null, `${MESSAGES.MEDIA_STREAM.ERRORS.STOP_SCREEN}`], error);
    }
    return null;
  }

  // eslint-disable-next-line
  startScreenCapture() {
    const { navigator } = window;
    const displayMediaOptions = this.settings.getUserMediaSettings;
    if (navigator.mediaDevices.getDisplayMedia) {
      return navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
        .then(stream => stream)
        .catch((error) => {
          if (error.name === 'NotAllowedError') {
            logger.log.WARN(error);
          } else {
            logger.log.ERROR(error);
          }
          return null;
        });
    }

    displayMediaOptions.video.mediaSource = 'screen';
    return navigator.mediaDevices.getUserMedia(displayMediaOptions)
      .then(stream => stream)
      .catch((error) => {
        logger.log.ERROR(error);
        return null;
      });
  }

  // eslint-disable-next-line class-methods-use-this
  isValidOptions(options) {
    if (options && isAObj(options) && options.video) {
      return true;
    }

    if (options) {
      logger.log.WARN([this.roomState.user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.INVALID_GDM_OPTIONS], options);
    }

    return false;
  }

  checkForExistingScreenStreams() {
    const peersScreenStream = screenshareHelpers.retrievePeersScreenStreamId(this.roomState);

    if (!isEmptyObj(peersScreenStream)) {
      logger.log.WARN([this.roomState.user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.PEER_SCREEN_ACTIVE]);
    }
  }

  addScreenshareStream() {
    const { peerConnections } = this.roomState;

    if (!isEmptyObj(peerConnections)) {
      PeerConnection.refreshConnection(this.roomState)
        .catch(error => logger.log.ERROR([this.roomState.user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.START_SCREEN], error));
    }
  }

  // eslint-disable-next-line class-methods-use-this
  deleteScreensharingInstance(room) {
    delete screensharingInstance[room.id];
  }
}

export default ScreenSharing;
