import PeerConnection from '../../peer-connection';
import SkylinkSignalingServer from '../../server-communication/signaling-server';
import mediaStreamHelpers from '../../media-stream/helpers/index';
import logger from '../../logger';
import MESSAGES from '../../messages';
import { isEmptyObj, isAString, updateReplacedStreamInState } from '../../utils/helpers';
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
    this.isReplace = null;
    this.streamId = null;

    screensharingInstance[room.id] = this;
  }

  streamExists() {
    const streamList = mediaStreamHelpers.retrieveStreams(this.roomState, this.roomState.room.name);
    const streamIds = Object.keys(streamList.userMedia);

    for (let i = 0; i < streamIds.length; i += 1) {
      if (streamIds[i] === this.streamId) {
        return true;
      }
    }
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  hasMoreThanOneVideoStream() {
    return mediaStreamHelpers.retrieveVideoStreams(this.roomState.room).length > 1;
  }

  hasUserMediaStream() {
    const { streams } = this.roomState;

    return streams.userMedia;
  }

  // TODO: Implement replace logic
  /**
   * Function that starts the screenshare.
   * @param {boolean} isReplace
   * @param {String} streamId
   * @return {MediaStream}
   */
  async start(isReplace, streamId = null) {
    this.isReplace = false;
    this.streamId = streamId;

    try {
      this.checkForExistingScreenStreams();
      this.checksForReplaceScreen();

      this.stream = await this.startScreenCapture();
      if (!this.stream) {
        this.deleteScreensharingInstance(this.roomState.room);
        return null;
      }

      screenshareHelpers.handleScreenStreamStates.addScreenStreamToState(this.roomState, this.stream, this.isReplace);
      screenshareHelpers.addScreenStreamCallbacks(this.roomState, this.stream);

      if (this.isReplace) {
        this.replaceUserMediaStream();
      } else {
        this.addScreenshareStream();
      }
    } catch (error) {
      logger.log.ERROR([this.roomState.user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.REPLACE_SCREEN], error);
    }

    return this.stream;
  }

  /**
   * Function that stops the screenshare.
   * @return {MediaStream}
   */
  stop() {
    if (!this.stream) {
      logger.log.DEBUG([this.roomState.user.sid, TAGS.MEDIA_STREAM, null, `${MESSAGES.MEDIA_STREAM.ERRORS.STOP_SCREEN} - ${MESSAGES.MEDIA_STREAM.ERRORS.NO_STREAM}`]);
      return null;
    }

    try {
      screenshareHelpers.stopScreenStream(this.roomState.room, this.stream);

      this.isReplace = null;
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
    if (navigator.mediaDevices.getDisplayMedia) {
      return navigator.mediaDevices.getDisplayMedia({ video: true })
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
    return navigator.mediaDevices.getUserMedia({ video: { mediaSource: 'screen' } })
      .then(stream => stream)
      .catch((error) => {
        logger.log.ERROR(error);
        return null;
      });
  }

  checksForReplaceScreen() {
    if (!this.isReplace) return;

    if (!this.hasUserMediaStream()) {
      throw new Error(MESSAGES.MEDIA_STREAM.ERRORS.NO_USER_MEDIA_STREAMS);
    }

    if (this.hasMoreThanOneVideoStream() && !this.streamId) {
      throw new Error(MESSAGES.MEDIA_STREAM.ERRORS.NO_STREAM_ID);
    }

    if (this.streamId && !isAString(this.streamId)) {
      throw new Error(MESSAGES.MEDIA_STREAM.ERRORS.INVALID_STREAM_ID_TYPE);
    }

    if (this.streamId && !this.streamExists()) {
      throw new Error(`${MESSAGES.MEDIA_STREAM.ERRORS.INVALID_STREAM_ID} - ${this.streamId}`);
    }
  }

  checkForExistingScreenStreams() {
    const peersScreenStream = screenshareHelpers.retrievePeersScreenStreamId(this.roomState);

    if (!isEmptyObj(peersScreenStream)) {
      logger.log.WARN([this.roomState.user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.PEER_SCREEN_ACTIVE]);
    }
  }

  replaceUserMediaStream() {
    const { peerConnections, streams } = this.roomState;
    const peerIds = Object.keys(peerConnections);
    const oldStream = this.streamId ? streams.userMedia[this.streamId].stream : mediaStreamHelpers.retrieveVideoStreams(this.roomState.room)[0];
    const newStream = this.stream;

    this.streamId = oldStream.id;
    updateReplacedStreamInState(oldStream, newStream, this.roomState, true);

    peerIds.forEach((peerId) => {
      mediaStreamHelpers.replaceTrack(oldStream, newStream, peerId, this.roomState);
    });
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

  isReplaceScreenStream() {
    return this.isReplace;
  }
}

export default ScreenSharing;
