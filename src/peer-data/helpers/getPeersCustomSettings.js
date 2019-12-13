import clone from 'clone';
import {
  isEmptyObj, isAObj, isANumber,
} from '../../utils/helpers';
import { PEER_CONNECTION_STATE, PEER_TYPE } from '../../constants';
import Skylink from '../..';
import PeerData from '../index';

const hasPeers = peerInformations => !isEmptyObj(peerInformations);

/**
 * Function that gets a current custom Peer settings.
 * @param {SkylinkState} state
 * @param {String} peerId
 * @private
 * @return {Object}
 * @memberof PeerDataHelpers
 */
const getPeerCustomSettings = (state, peerId) => {
  const { streams } = state;
  const customSettings = {};
  customSettings.settings = {
    audio: false,
    video: false,
    data: false,
    bandwidth: clone(state.streamsBandwidthSettings.bAS),
    googleXBandwidth: clone(state.streamsBandwidthSettings.googleX),
  };

  const usePeerId = state.hasMCU ? PEER_TYPE.MCU : peerId;

  if (state.peerConnections[usePeerId].signalingState !== PEER_CONNECTION_STATE.CLOSED) {
    const initOptions = Skylink.getInitOptions();
    const peerInfo = PeerData.getPeerInfo(usePeerId, state);

    customSettings.settings = clone(peerInfo.settings);
    customSettings.settings.data = initOptions.enableDataChannel && state.peerInformations[usePeerId].config.enableDataChannel;

    // TODO: check logic - why the need to build again and not take from getPeerInfo since the signature is the same
    if (streams.userMedia || streams.screenshare) {
      // if (state.streams.userMedia) {
      //   const streamIds = Object.keys(streams.userMedia);
      //   selectedStream = state.streams.userMedia[streamIds[0]];
      // } else if (state.streams.screenshare) {
      //   selectedStream = state.streams.screenshare;
      // }

      // customSettings.settings.audio = clone(selectedStream.settings.audio);
      // customSettings.settings.video = clone(selectedStream.settings.video);
      // customSettings.mediaStatus = clone(state.streamsMutedSettings);

      // typeof state.peerConnections[peerId].getSenders === 'function' - native function
      // if (!initOptions.useEdgeWebRTC && !window.msRTCPeerConnection) {
      //   const senders = state.peerConnections[usePeerId].getSenders();
      //   let hasSendAudio = false;
      //   let hasSendVideo = false;
      //
      //   if (senders.length !== 0) {
      //     for (let i = 0; i < senders.length; i += 1) {
      //       if (senders[i].track && senders[i].track.kind === 'audio') {
      //         hasSendAudio = true;
      //       } else if (senders[i].track && senders[i].track.kind === 'video') {
      //         hasSendVideo = true;
      //       }
      //     }
      //
      //     if (!hasSendAudio) {
      //       customSettings.settings.audio = false;
      //       customSettings.mediaStatus.audioMuted = true;
      //     }
      //
      //     if (!hasSendVideo) {
      //       customSettings.settings.video = false;
      //       customSettings.mediaStatus.videoMuted = true;
      //     }
      //   }
      // }
    }
  }

  //  update default conifg with peer custom config TODO: check if parsing of state.peerCustomConfigs is required or if it can be assigned directly
  if (state.peerCustomConfigs[usePeerId]) {
    if (Object.hasOwnProperty.call(state.peerCustomConfigs[usePeerId], 'bandwidth')) {
      const peerCustomConfigBandwidth = state.peerCustomConfigs[usePeerId].bandwidth;

      if (isAObj(peerCustomConfigBandwidth)) {
        if (isANumber(peerCustomConfigBandwidth.audio)) {
          customSettings.settings.bandwidth.audio = peerCustomConfigBandwidth.audio;
        }
        if (isANumber(peerCustomConfigBandwidth.video)) {
          customSettings.settings.bandwidth.video = peerCustomConfigBandwidth.video;
        }
        if (isANumber(peerCustomConfigBandwidth.data)) {
          customSettings.settings.bandwidth.data = peerCustomConfigBandwidth.data;
        }
      }
    }

    if (Object.hasOwnProperty.call(state.peerCustomConfigs[usePeerId], 'googleXBandwidth')) {
      const peerCustomConfigGoogleXBandwidth = state.peerCustomConfigs[usePeerId].googleXBandwidth;

      if (isAObj(peerCustomConfigGoogleXBandwidth)) {
        if (isANumber(peerCustomConfigGoogleXBandwidth.min)) {
          customSettings.settings.googleXBandwidth.min = peerCustomConfigGoogleXBandwidth.min;
        }
        if (isANumber(peerCustomConfigGoogleXBandwidth.max)) {
          customSettings.settings.googleXBandwidth.max = peerCustomConfigGoogleXBandwidth.max;
        }
      }
    }
  }

  // Check we are going to send data to peer // TODO: is the above check enough or do we need to parse it from sdp
  // if (state.sdpSessions[usePeerId]) {
  //   const peerLocalConnection = state.sdpSessions[usePeerId].local.connection;
  //   if (isAObj(peerLocalConnection)) {
  //     if (state.sdpSessions[usePeerId].local.connection.audio
  //       && state.sdpSessions[usePeerId].local.connection.audio.indexOf('send') > -1) {
  //       customSettings.settings.audio = true;
  //       customSettings.mediaStatus.audioMuted = false;
  //     }
  //     if (state.sdpSessions[usePeerId].local.connection.video
  //       && state.sdpSessions[usePeerId].local.connection.video.indexOf('send') > -1) {
  //       customSettings.settings.video = true;
  //       customSettings.mediaStatus.videoMuted = false;
  //     }
  //     if (state.sdpSessions[usePeerId].local.connection.data
  //       && state.sdpSessions[usePeerId].local.connection.data.indexOf('send') > -1) {
  //       customSettings.settings.data = true;
  //     }
  //   }
  // }

  return customSettings;
};

/**
 * @description Function that gets the list of current custom Peer settings sent and set.
 * @param {SkylinkState} roomState
 * @return {Object} customSettingsList
 * @memberOf PeerDataHelpers
 */
const getPeersCustomSettings = (roomState) => {
  const { peerInformations } = roomState;
  const customSettingsList = {};

  if (hasPeers(peerInformations)) {
    const peerIds = Object.keys(peerInformations);

    for (let peerId = 0; peerId < peerIds.length; peerId += 1) {
      customSettingsList[peerIds[peerId]] = getPeerCustomSettings(roomState, peerIds[peerId]);
    }

    return customSettingsList;
  }

  return customSettingsList;
};

export default getPeersCustomSettings;
