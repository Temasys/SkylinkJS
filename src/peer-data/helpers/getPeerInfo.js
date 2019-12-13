import clone from 'clone';
import Skylink from '../../index';
import logger from '../../logger';
import messages from '../../messages';
import { DATA_CHANNEL_STATE, PEER_TYPE } from '../../constants';
import PeerData from '../index';

const isUser = (peerId, roomState) => {
  const { user } = roomState;
  return peerId === user.sid;
};

/**
 * @description Function that returns the User / Peer current session information.
 * @private
 * @param {string} peerId
 * @param {SkylinkState} roomState
 * @return {peerInfo}
 * @memberOf PeerDataHelpers
 */
const getPeerInfo = (peerId, roomState) => {
  let peerInfo = null;
  if (!peerId) {
    return null;
  }
  const state = Skylink.getSkylinkState(roomState.room.id);

  if (!state) {
    Skylink.logNoRoomState(roomState.room.id);
    return peerInfo;
  }

  if (isUser(peerId, roomState)) {
    return PeerData.getCurrentSessionInfo(roomState.room);
  }

  peerInfo = clone(state.peerInformations[peerId]);

  if (!peerInfo) {
    logger.log.ERROR(`${messages.PEER_INFORMATIONS.NO_PEER_INFO} ${peerId}`);
    return peerInfo;
  }

  // FIXME: would there ever be a case of !peerInfo.settings?
  // if (!peerInfo.settings) {
  //   peerInfo.settings = {};
  // }

  // if (!peerInfo.mediaStatus) {
  //   peerInfo.mediaStatus = {};
  // }

  peerInfo.room = clone(roomState.room.roomName);

  peerInfo.settings.data = !!(state.dataChannels[peerId] && state.dataChannels[peerId].main && state.dataChannels[peerId].main.channel && state.dataChannels[peerId].main.channel.readyState === DATA_CHANNEL_STATE.OPEN);
  peerInfo.connected = state.peerConnStatus[peerId] && !!state.peerConnStatus[peerId].connected;
  peerInfo.init = state.peerConnStatus[peerId] && !!state.peerConnStatus[peerId].init;

  // peerInfo.settings.bandwidth = peerInfo.settings.bandwidth || {};
  // peerInfo.settings.googleXBandwidth = peerInfo.settings.googleXBandwidth || {};

  // if (!(typeof peerInfo.settings.video === 'boolean' || typeof peerInfo.settings.video === 'object')) {
  //   // peerInfo.settings.video = false;
  //   peerInfo.mediaStatus.audioMuted = true;
  // }

  // if (!(typeof peerInfo.settings.audio === 'boolean' || typeof peerInfo.settings.audio === 'object')) {
  //   // peerInfo.settings.audio = false;
  //   peerInfo.mediaStatus.audioMuted = true;
  // }

  // if (typeof peerInfo.mediaStatus.audioMuted !== 'boolean') {
  //   peerInfo.mediaStatus.audioMuted = true;
  // }

  // if (typeof peerInfo.mediaStatus.videoMuted !== 'boolean') {
  //   peerInfo.mediaStatus.videoMuted = true;
  // }

  // if (peerInfo.settings.maxBandwidth) {
  //   peerInfo.settings.bandwidth = clone(peerInfo.settings.maxBandwidth);
  //   delete peerInfo.settings.maxBandwidth;
  // }

  // if (peerInfo.settings.video && typeof peerInfo.settings.video === 'object' && peerInfo.settings.video.customSettings && typeof peerInfo.settings.video.customSettings === 'object') {
  // // if (peerInfo.settings.video.customSettings && typeof peerInfo.settings.video.customSettings === 'object') {
  //   if (peerInfo.settings.video.customSettings.frameRate) {
  //     peerInfo.settings.video.frameRate = clone(peerInfo.settings.video.customSettings.frameRate);
  //   }
  //   if (peerInfo.settings.video.customSettings.facingMode) {
  //     peerInfo.settings.video.facingMode = clone(peerInfo.settings.video.customSettings.facingMode);
  //   }
  //   if (peerInfo.settings.video.customSettings.width) {
  //     peerInfo.settings.video.resolution = peerInfo.settings.video.resolution || {};
  //     peerInfo.settings.video.resolution.width = clone(peerInfo.settings.video.customSettings.width);
  //   }
  //   if (peerInfo.settings.video.customSettings.height) {
  //     peerInfo.settings.video.resolution = peerInfo.settings.video.resolution || {};
  //     peerInfo.settings.video.resolution.height = clone(peerInfo.settings.video.customSettings.height);
  //   }
  // }

  // if (peerInfo.settings.audio && typeof peerInfo.settings.audio === 'object') {
  //   peerInfo.settings.audio.stereo = peerInfo.settings.audio.stereo === true;
  // }

  // TODO: check if receiveOnly and publishOnly is required
  if (peerId === PEER_TYPE.MCU) {
    peerInfo.config.receiveOnly = true;
    peerInfo.config.publishOnly = false;
  } else if (state.hasMCU) {
    peerInfo.config.receiveOnly = false;
    peerInfo.config.publishOnly = true;
  }

  // TODO: check if the sdp parsing is required
  // parse sdp to update media settings and status
  // if (!state.sdpSettings.direction.audio.receive) {
  //   peerInfo.settings.audio = false;
  //   peerInfo.mediaStatus.audioMuted = true;
  // }
  //
  // if (!state.sdpSettings.direction.video.receive) {
  //   peerInfo.settings.video = false;
  //   peerInfo.mediaStatus.videoMuted = true;
  // }
  //
  // if (!state.sdpSettings.connection.audio) {
  //   peerInfo.settings.audio = false;
  //   peerInfo.mediaStatus.audioMuted = true;
  // }
  //
  // if (!state.sdpSettings.connection.video) {
  //   peerInfo.settings.video = false;
  //   peerInfo.mediaStatus.videoMuted = true;
  // }

  // Makes sense to be send direction since we are retrieving information if Peer is sending anything to us
  // if (state.sdpSessions[peerId] && state.sdpSessions[peerId].remote && state.sdpSessions[peerId].remote.connection && typeof state.sdpSessions[peerId].remote.connection === 'object') {
  //   if (!(state.sdpSessions[peerId].remote.connection.audio && state.sdpSessions[peerId].remote.connection.audio.indexOf('send') > -1)) {
  //     peerInfo.settings.audio = false;
  //     peerInfo.mediaStatus.audioMuted = true;
  //   }
  //   if (!(state.sdpSessions[peerId].remote.connection.video && state.sdpSessions[peerId].remote.connection.video.indexOf('send') > -1)) {
  //     peerInfo.settings.video = false;
  //     peerInfo.mediaStatus.videoMuted = true;
  //   }
  //   if (!(state.sdpSessions[peerId].remote.connection.data && state.sdpSessions[peerId].remote.connection.data.indexOf('send') > -1)) {
  //     peerInfo.settings.data = false;
  //   }
  // }

  // if (!(peerInfo.userData !== null && typeof peerInfo.userData !== 'undefined')) {
  //   peerInfo.userData = '';
  // }

  // if (!peerInfo.settings.audio) {
  //   peerInfo.mediaStatus.audioMuted = true;
  // }
  //
  // if (!peerInfo.settings.video) {
  //   peerInfo.mediaStatus.videoMuted = true;
  // }

  if (!peerInfo.settings.audio && !peerInfo.settings.video) {
    peerInfo.config.receiveOnly = true;
    peerInfo.config.publishOnly = false;
  }

  return peerInfo;
};

export default getPeerInfo;
