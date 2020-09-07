import clone from 'clone';
import Skylink from '../index';
import helpers from './helpers/index';
import {
  MEDIA_TYPE, MEDIA_INFO, TAGS, TRACK_KIND, MEDIA_STATE, PEER_TYPE,
} from '../constants';
import logger from '../logger';
import MESSAGES from '../messages';
import { mediaInfoDeleted } from '../skylink-events';
import { dispatchEvent } from '../utils/skylinkEventManager';
import { isEmptyArray } from '../utils/helpers';

class PeerMedia {
  /**
   * Method that updates local media info with user sid returned from inRoom message. There is no user.sid information prior to inRoom message.
   * @param room
   * @param sid
   * @private
   */
  static updatePeerMediaWithUserSid(room, sid) {
    const updatedState = Skylink.getSkylinkState(room.id);

    updatedState.peerMedias[sid] = Object.assign({}, updatedState.peerMedias.null);
    delete updatedState.peerMedias.null;
    Skylink.setSkylinkState(updatedState, room.id);
    Object.keys(updatedState.peerMedias[sid]).forEach((mediaId) => {
      helpers.updatePeerMediaInfo(room, sid, false, mediaId, MEDIA_INFO.PUBLISHER_ID, sid);
    });
  }

  /**
   * Method that updates the stream id of the remote peer in the peer media info
   * @param room
   * @param peerId
   * @param transceiverMid
   * @param streamId
   */
  static updateStreamIdFromOntrack(room, peerId, transceiverMid, streamId) {
    const state = Skylink.getSkylinkState(room.id);
    const mediaId = helpers.retrieveValueGivenTransceiverMid(state, peerId, transceiverMid, MEDIA_INFO.MEDIA_ID);
    helpers.updatePeerMediaInfo(room, peerId, false, mediaId, MEDIA_INFO.STREAM_ID, streamId);
  }

  /**
   * Method that checks if a transceiver mid corresponds to a screen stream
   * @param state
   * @param peerId
   * @param transceiverMid
   * @returns {boolean}
   */
  static isVideoScreenTrack(state, peerId, transceiverMid) {
    const { peerMedias } = state;
    const mediaInfos = Object.values(peerMedias[peerId]);

    for (let m = 0; m < mediaInfos.length; m += 1) {
      if (mediaInfos[m].transceiverMid === transceiverMid) {
        return mediaInfos[m].mediaType === MEDIA_TYPE.VIDEO_SCREEN;
      }
    }

    return false;
  }

  /**
   * Method that updates the peer media info state to unavailable.
   * @param room
   * @param peerId
   * @param mediaId
   */
  static setMediaStateToUnavailable(room, peerId, mediaId) {
    helpers.updatePeerMediaInfo(room, peerId, false, mediaId, MEDIA_INFO.MEDIA_STATE, MEDIA_STATE.UNAVAILABLE);
  }

  /**
   * Method that removes mediaInfo that has mediaState set to unavailable.
   * @param {SkylinkRoom} room
   * @param {String} peerId
   * @param {String|null} mediaId
   */
  static deleteUnavailableMedia(room, peerId, mediaId = null) {
    const updatedState = Skylink.getSkylinkState(room.id);

    if (peerId === PEER_TYPE.MCU || !updatedState.peerMedias[peerId]) {
      return;
    }

    let clonedMediaInfo;
    if (!mediaId) {
      const mediaInfos = updatedState.peerMedias[peerId];
      Object.values(mediaInfos).forEach((mInfo) => {
        if (mInfo.mediaState === MEDIA_STATE.UNAVAILABLE) {
          clonedMediaInfo = clone(mInfo);
          delete updatedState.peerMedias[peerId][mInfo.mediaId];
        }
      });
    } else {
      clonedMediaInfo = clone(updatedState.peerMedias[peerId][mediaId]);
      delete updatedState.peerMedias[peerId][mediaId];
    }

    Skylink.setSkylinkState(updatedState, room.id);

    helpers.processOnRemoveTrack(updatedState, peerId, clonedMediaInfo);

    if (clonedMediaInfo) {
      dispatchEvent(mediaInfoDeleted({
        mediaInfo: clonedMediaInfo,
      }));
    }
  }

  /**
   * Method that updates the peer media info.
   * @param room
   * @param peerId
   * @param mediaId
   * @param key
   * @param value
   * @private
   */
  static updatePeerMediaInfo(room, peerId, mediaId, key, value) {
    helpers.updatePeerMediaInfo(room, peerId, true, mediaId, key, value);
  }

  /**
   * Method that sets the remote peer media info from the offer.
   * @param room
   * @param targetMid
   * @param mediaInfoList
   */
  static setPeerMediaInfo(room, targetMid, mediaInfoList = []) {
    try {
      const state = Skylink.getSkylinkState(room.id);

      if (targetMid === PEER_TYPE.MCU && !isEmptyArray(mediaInfoList)) { // targetMid needs to be obtained from
        // mediaInfoList
        const targetPeerIds = [];
        mediaInfoList.forEach((mediaInfo) => {
          if (targetPeerIds.indexOf(mediaInfo.publisherId) === -1) {
            targetPeerIds.push(mediaInfo.publisherId);
          }
        });
        targetPeerIds.forEach((peerId) => {
          // eslint-disable-next-line array-callback-return,consistent-return
          const targetMediaInfoList = mediaInfoList.filter((mediaInfo) => {
            if (mediaInfo.publisherId === peerId) {
              return mediaInfo;
            }
          });
          this.setPeerMediaInfo(room, peerId, targetMediaInfoList);
        });
      } else if (targetMid !== PEER_TYPE.MCU) {
        const clonedPeerMedia = clone(state.peerMedias[targetMid]) || {};
        const updatedState = helpers.resetPeerMedia(room, targetMid);
        mediaInfoList.forEach((mediaInfo) => {
          updatedState.peerMedias[mediaInfo.publisherId] = helpers.populatePeerMediaInfo(updatedState, clonedPeerMedia, mediaInfo);
        });
        Skylink.setSkylinkState(updatedState, room.id);
      }
    } catch (err) {
      logger.log.ERROR([targetMid, TAGS.PEER_MEDIA, null, MESSAGES.MEDIA_INFO.ERRORS.FAILED_SETTING_PEER_MEDIA_INFO]);
    }
  }

  /**
   * Method that returns the streamId from the peer media info.
   * @param room
   * @param peerId
   * @param mediaId
   * @returns {String} streamId
   */
  static retrieveStreamId(room, peerId, mediaId) {
    const state = Skylink.getSkylinkState(room.id);
    const { peerMedias } = state;
    const mediaInfo = peerMedias[peerId][mediaId];
    const { streamId } = mediaInfo;

    if (!streamId) {
      logger.log.ERROR([peerId, TAGS.PEER_MEDIA, null, MESSAGES.MEDIA_INFO.ERRORS.NO_ASSOCIATED_STREAM_ID]);
    }

    return streamId;
  }

  /**
   * Method that returns the mediaId
   * @param trackKind
   * @param streamId
   * @returns {String} mediaId
   */
  static retrieveMediaId(trackKind, streamId) {
    return helpers.retrieveMediaId(trackKind, streamId);
  }

  /**
   * Method that returns the local media info format for offer and answer message.
   * @param room
   * @param peerId
   * @param sessionDescription
   * @returns {object} mediaInfo
   * @private
   */
  static retrieveMediaInfoForOfferAnswer(room, sessionDescription) {
    const state = Skylink.getSkylinkState(room.id);
    const peerId = state.user.sid;

    helpers.parseSDPForTransceiverMid(room, peerId, sessionDescription);
    return helpers.retrieveFormattedMediaInfo(room, peerId);
  }

  /**
   * Method that processes the peer media and adds it to the state after successfully obtaining the stream from getUserMedia. MediaInfoEvent is not dispatched.
   * @param room
   * @param peerId
   * @param stream
   * @param isScreensharing
   * @param dispatchEvt - The flag if the update should dispatch mediaInfoEvent signaling message.
   * @private
   */
  static processPeerMedia(room, peerId, stream, isScreensharing, dispatchEvt = false) {
    const updatedState = Skylink.getSkylinkState(room.id);
    const peerMedia = updatedState.peerMedias[peerId] || {};
    const tracks = stream.getTracks();
    let mediaId = null;

    try {
      tracks.forEach((track) => {
        mediaId = helpers.retrieveMediaId(track.kind, stream.id);
        // eslint-disable-next-line no-nested-ternary
        peerMedia[mediaId] = helpers.buildPeerMediaInfo(room, peerId, track, stream.id, track.kind === TRACK_KIND.AUDIO ? MEDIA_TYPE.AUDIO_MIC : (isScreensharing ? MEDIA_TYPE.VIDEO_SCREEN : MEDIA_TYPE.VIDEO_CAMERA));
        helpers.updatePeerMediaInfo(room, peerId, dispatchEvt, mediaId, null, null, peerMedia[mediaId]);
      });
    } catch (err) {
      logger.log.ERROR([peerId, TAGS.MEDIA_INFO, MESSAGES.MEDIA_INFO.ERRORS.FAILED_PROCESSING_PEER_MEDIA], err);
    }
  }

  /**
   * Method that checks if a given stream is a screen share stream
   * @param room
   * @param peerId
   * @param options
   * @return {boolean|any}
   */
  static retrieveScreenMediaInfo(room, peerId, options) {
    const state = Skylink.getSkylinkState(room.id);
    const { peerMedias } = state;
    const mediaInfos = Object.values(peerMedias[peerId]);
    for (let i = 0; i < mediaInfos.length; i += 1) {
      if (options.streamId && mediaInfos[i].streamId === options.streamId) {
        return mediaInfos[i].mediaType === MEDIA_TYPE.VIDEO_SCREEN ? mediaInfos[i] : false;
      }

      if (options.transceiverMid && mediaInfos[i].transceiverMid === options.transceiverMid) {
        return mediaInfos[i].mediaType === MEDIA_TYPE.VIDEO_SCREEN;
      }

      if (!options) {
        return mediaInfos[i].mediaType === MEDIA_TYPE.VIDEO_SCREEN;
      }
    }

    logger.log.ERROR([peerId, TAGS.PEER_MEDIA, null, MESSAGES.MEDIA_INFO.ERRORS.STREAM_ID_NOT_MATCHED]);
    return false;
  }
}

export default PeerMedia;
