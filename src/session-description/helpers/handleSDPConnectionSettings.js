/* eslint-disable no-continue,no-nested-ternary */
import clone from 'clone';
import Skylink from '../../index';
import logger from '../../logger';
import PeerData from '../../peer-data';
import { PEER_TYPE, BUNDLE_POLICY, HANDSHAKE_PROGRESS } from '../../constants';
import SessionDescription from '../index';

const handleSDPConnectionSettings = (targetMid, sessionDescription, roomKey, direction) => {
  const state = Skylink.getSkylinkState(roomKey);

  if (!state.sdpSessions[targetMid]) {
    return sessionDescription.sdp;
  }

  let sessionDescriptionStr = sessionDescription.sdp;

  // Handle a=end-of-candidates signaling for non-trickle ICE before setting remote session description
  if (direction === 'remote' && !PeerData.getPeerInfo(targetMid, state).config.enableIceTrickle) {
    sessionDescriptionStr = sessionDescriptionStr.replace(/a=end-of-candidates\r\n/g, '');
  }

  const sdpLines = sessionDescriptionStr.split('\r\n');
  const peerAgent = ((state.peerInformations[targetMid] || {}).agent || {}).name || '';
  const bundleLineMids = [];
  const settings = clone(state.sdpSettings);
  let mediaType = '';
  let bundleLineIndex = -1;
  let mLineIndex = -1;

  if (targetMid === PEER_TYPE.MCU) {
    settings.connection.audio = true;
    settings.connection.video = true;
    settings.connection.data = true;
  }

  // Patches for MCU sending empty video stream despite audio+video is not sending at all
  // Apply as a=inactive when supported
  if (state.hasMCU) {
    const peerStreamSettings = clone(PeerData.getPeerInfo(targetMid, state)).settings || {};
    settings.direction.audio.receive = targetMid === PEER_TYPE.MCU ? true : !!peerStreamSettings.audio;
    settings.direction.audio.send = targetMid === PEER_TYPE.MCU;
    settings.direction.video.receive = targetMid === PEER_TYPE.MCU ? true : !!peerStreamSettings.video;
    settings.direction.video.send = targetMid === PEER_TYPE.MCU;
  }

  if (direction === 'remote') {
    const offerCodecs = SessionDescription.getSDPCommonSupports(targetMid, sessionDescription, roomKey);

    if (!offerCodecs.audio) {
      settings.connection.audio = false;
    }

    if (!offerCodecs.video) {
      settings.connection.video = false;
    }
  }

  // ANSWERER: Reject only the m= lines. Returned rejected m= lines as well.
  // OFFERER: Remove m= lines

  state.sdpSessions[targetMid][direction].mLines = [];
  state.sdpSessions[targetMid][direction].bundleLine = '';
  state.sdpSessions[targetMid][direction].connection = {
    audio: null,
    video: null,
    data: null,
  };

  for (let i = 0; i < sdpLines.length; i += 1) {
    // Cache the a=group:BUNDLE line used for remote answer from Edge later
    if (sdpLines[i].indexOf('a=group:BUNDLE') === 0) {
      state.sdpSessions[targetMid][direction].bundleLine = sdpLines[i];
      bundleLineIndex = i;

      // Check if there's a need to reject m= line
    } else if (sdpLines[i].indexOf('m=') === 0) {
      mediaType = (sdpLines[i].split('m=')[1] || '').split(' ')[0] || '';
      mediaType = mediaType === 'application' ? 'data' : mediaType;
      mLineIndex += 1;

      state.sdpSessions[targetMid][direction].mLines[mLineIndex] = sdpLines[i];

      // Check if there is missing unsupported video codecs support and reject it regardles of MCU Peer or not
      if (!settings.connection[mediaType]) {
        logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type, `Removing rejected m=${mediaType} line ->`], sdpLines[i]);

        // Check if answerer and we do not have the power to remove the m line if index is 0
        // Set as a=inactive because we do not have that power to reject it somehow.
        // first m= line cannot be rejected for BUNDLE
        if (state.peerConnectionConfig.bundlePolicy === BUNDLE_POLICY.MAX_BUNDLE && bundleLineIndex > -1 && mLineIndex === 0 && (direction === 'remote' ? sessionDescription.type === HANDSHAKE_PROGRESS.OFFER : sessionDescription.type === HANDSHAKE_PROGRESS.ANSWER)) {
          logger.log.WARN([targetMid, 'RTCSessionDesription', sessionDescription.type, `Not removing rejected m='${mediaType} line ->`], sdpLines[i]);
          settings.connection[mediaType] = true;
          if (['audio', 'video'].indexOf(mediaType) > -1) {
            settings.direction[mediaType].send = false;
            settings.direction[mediaType].receive = false;
          }
          continue;
        }

        if (window.webrtcDetectedBrowser === 'edge') {
          sdpLines.splice(i, 1);
          i -= 1;
          continue;
        } else if (direction === 'remote' || sessionDescription.type === HANDSHAKE_PROGRESS.ANSWER) {
          const parts = sdpLines[i].split(' ');
          parts[1] = 0;
          sdpLines[i] = parts.join(' ');
          continue;
        }
      }
    }

    if (direction === 'remote' && sdpLines[i].indexOf('a=candidate:') === 0
      && !PeerData.getPeerInfo(targetMid, state).config.enableIceTrickle) {
      if (sdpLines[i + 1] ? !(sdpLines[i + 1].indexOf('a=candidate:') === 0 || sdpLines[i + 1].indexOf('a=end-of-candidates') === 0) : true) {
        logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Appending end-of-candidates signal for non-trickle ICE connection.']);
        sdpLines.splice(i + 1, 0, 'a=end-of-candidates');
        i += 1;
      }
    }

    if (mediaType) {
      // Remove lines if we are rejecting the media and ensure unless (rejectVideoMedia is true), MCU has to enable those m= lines
      if (!settings.connection[mediaType]) {
        sdpLines.splice(i, 1);
        i -= 1;

        // Store the mids session description
      } else if (sdpLines[i].indexOf('a=mid:') === 0) {
        bundleLineMids.push(sdpLines[i].split('a=mid:')[1] || '');

        // Configure direction a=sendonly etc for local sessiondescription
      } else if (mediaType && ['a=sendrecv', 'a=sendonly', 'a=recvonly'].indexOf(sdpLines[i]) > -1) {
        if (['audio', 'video'].indexOf(mediaType) === -1) {
          state.sdpSessions[targetMid][direction].connection.data = sdpLines[i];
          continue;
        }

        if (direction === 'local') {
          if (settings.direction[mediaType].send && !settings.direction[mediaType].receive) {
            sdpLines[i] = sdpLines[i].indexOf('send') > -1 ? 'a=sendonly' : 'a=inactive';
          } else if (!settings.direction[mediaType].send && settings.direction[mediaType].receive) {
            sdpLines[i] = sdpLines[i].indexOf('recv') > -1 ? 'a=recvonly' : 'a=inactive';
          } else if (!settings.direction[mediaType].send && !settings.direction[mediaType].receive) {
            // MCU currently does not support a=inactive flag.. what do we do here?
            sdpLines[i] = 'a=inactive';
          }

          // Handle Chrome bundle bug. - See: https://bugs.chromium.org/p/webrtc/issues/detail?id=6280
          if (!state.hasMCU && window.webrtcDetectedBrowser !== 'firefox' && peerAgent === 'firefox'
            && sessionDescription.type === HANDSHAKE_PROGRESS.OFFER && sdpLines[i] === 'a=recvonly') {
            logger.log.WARN([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Overriding any original settings to receive only to send and receive to resolve chrome BUNDLE errors.']);
            sdpLines[i] = 'a=sendrecv';
            settings.direction[mediaType].send = true;
            settings.direction[mediaType].receive = true;
          }
          // Patch for incorrect responses
        } else if (sessionDescription.type === HANDSHAKE_PROGRESS.ANSWER) {
          const localOfferRes = state.sdpSessions[targetMid].local.connection[mediaType];
          // Parse a=sendonly response
          if (localOfferRes === 'a=sendonly') {
            sdpLines[i] = ['a=inactive', 'a=recvonly'].indexOf(sdpLines[i]) === -1 ? (sdpLines[i] === 'a=sendonly' ? 'a=inactive' : 'a=recvonly') : sdpLines[i];
            // Parse a=recvonly
          } else if (localOfferRes === 'a=recvonly') {
            sdpLines[i] = ['a=inactive', 'a=sendonly'].indexOf(sdpLines[i]) === -1 ? (sdpLines[i] === 'a=recvonly' ? 'a=inactive' : 'a=sendonly') : sdpLines[i];
            // Parse a=sendrecv
          } else if (localOfferRes === 'a=inactive') {
            sdpLines[i] = 'a=inactive';
          }
        }
        state.sdpSessions[targetMid][direction].connection[mediaType] = sdpLines[i];
      }
    }

    // Remove weird empty characters for Edge case.. :(
    // eslint-disable-next-line
    if (!(sdpLines[i] || '').replace(/\n|\r|\s|\ /gi, '')) {
      sdpLines.splice(i, 1);
      i -= 1;
    }
  }

  // Fix chrome "offerToReceiveAudio" local offer not removing audio BUNDLE
  if (bundleLineIndex > -1) {
    if (state.peerConnectionConfig.bundlePolicy === BUNDLE_POLICY.MAX_BUNDLE) {
      // eslint-disable-next-line
      sdpLines[bundleLineIndex] = 'a=group:BUNDLE ' + bundleLineMids.join(' ');
      // Remove a=group:BUNDLE line
    } else if (state.peerConnectionConfig.bundlePolicy === BUNDLE_POLICY.NONE) {
      sdpLines.splice(bundleLineIndex, 1);
    }
  }

  // Append empty space below
  if (window.webrtcDetectedBrowser !== 'edge') {
    if (!sdpLines[sdpLines.length - 1].replace(/\n|\r|\s/gi, '')) {
      sdpLines[sdpLines.length - 1] = '';
    } else {
      sdpLines.push('');
    }
  }

  logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Handling connection lines and direction ->'], settings);

  return sdpLines.join('\r\n');
};

export default handleSDPConnectionSettings;
