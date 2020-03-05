/* eslint-disable prefer-template */
/* eslint-disable no-useless-escape */
/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-restricted-syntax */
import * as constants from '../../constants';
import Skylink from '../../index';

const parseFn = (sessionDescription, type, codecName, samplingRate, settings) => {
  const mLine = sessionDescription.sdp.match(new RegExp('m=' + type + '\ .*\r\n', 'gi'));
  // Find the m= line
  if (Array.isArray(mLine) && mLine.length > 0) {
    const codecsList = sessionDescription.sdp.match(new RegExp('a=rtpmap:.*\ ' + codecName + '\/'
      + (samplingRate ? samplingRate + (type === 'audio' ? '[\/]*.*' : '.*') : '.*') + '\r\n', 'gi'));
    // Get the list of codecs related to it
    if (Array.isArray(codecsList) && codecsList.length > 0) {
      for (let i = 0; i < codecsList.length; i += 1) {
        const payload = (codecsList[i].split('a=rtpmap:')[1] || '').split(' ')[0];
        if (!payload) {
          continue;
        }
        const fmtpLine = sessionDescription.sdp.match(new RegExp('a=fmtp:' + payload + '\ .*\r\n', 'gi'));
        let updatedFmtpLine = 'a=fmtp:' + payload + ' ';
        const addedKeys = [];
        // Check if a=fmtp: line exists
        if (Array.isArray(fmtpLine) && fmtpLine.length > 0) {
          const fmtpParts = (fmtpLine[0].split('a=fmtp:' + payload + ' ')[1] || '').replace(/ /g, '').replace(/\r\n/g, '').split(';');
          for (let j = 0; j < fmtpParts.length; j += 1) {
            if (!fmtpParts[j]) {
              continue;
            }
            const keyAndValue = fmtpParts[j].split('=');
            if (settings.hasOwnProperty(keyAndValue[0])) {
              // Dont append parameter key+value if boolean and false
              updatedFmtpLine += typeof settings[keyAndValue[0]] === 'boolean' ? (settings[keyAndValue[0]]
                ? keyAndValue[0] + '=1;' : '') : keyAndValue[0] + '=' + settings[keyAndValue[0]] + ';';
            } else {
              updatedFmtpLine += fmtpParts[j] + ';';
            }
            addedKeys.push(keyAndValue[0]);
          }
          sessionDescription.sdp = sessionDescription.sdp.replace(fmtpLine[0], '');
        }
        for (const key in settings) {
          if (settings.hasOwnProperty(key) && addedKeys.indexOf(key) === -1) {
            // Dont append parameter key+value if boolean and false
            updatedFmtpLine += typeof settings[key] === 'boolean' ? (settings[key] ? key + '=1;' : '') : key + '=' + settings[key] + ';';
            addedKeys.push(key);
          }
        }
        if (updatedFmtpLine !== 'a=fmtp:' + payload + ' ') {
          sessionDescription.sdp = sessionDescription.sdp.replace(codecsList[i], codecsList[i] + updatedFmtpLine + '\r\n');
        }
      }
    }
  }
};

const setSDPCodecParams = (targetMid, sessionDescription, roomKey) => {
  const state = Skylink.getSkylinkState(roomKey);
  const initOptions = Skylink.getInitOptions();

  // Set audio codecs -> OPUS
  // RFC: https://tools.ietf.org/html/draft-ietf-payload-rtp-opus-11
  parseFn(sessionDescription, 'audio', constants.AUDIO_CODEC.OPUS, 48000, (() => {
    const opusOptions = {};
    // let audioSettings = state.streams.screenshare ? state.streams.screenshare.settings.audio : (state.streams.userMedia ? state.streams.userMedia.settings.audio : {});
    // TODO: check if settings across different streams are the same
    // FIXME: Quickfix to pass in first stream
    const streamIds = Object.keys(state.streams.userMedia);
    let audioSettings = state.streams.userMedia ? state.streams.userMedia[streamIds[0]].settings.audio : {};
    audioSettings = audioSettings && typeof audioSettings === 'object' ? audioSettings : {};
    if (typeof initOptions.codecParams.audio.opus.stereo === 'boolean') {
      opusOptions.stereo = initOptions.codecParams.audio.opus.stereo;
    } else if (typeof audioSettings.stereo === 'boolean') {
      opusOptions.stereo = audioSettings.stereo;
    }
    if (typeof initOptions.codecParams.audio.opus['sprop-stereo'] === 'boolean') {
      opusOptions['sprop-stereo'] = initOptions.codecParams.audio.opus['sprop-stereo'];
    } else if (typeof audioSettings.stereo === 'boolean') {
      opusOptions['sprop-stereo'] = audioSettings.stereo;
    }
    if (typeof initOptions.codecParams.audio.opus.usedtx === 'boolean') {
      opusOptions.usedtx = initOptions.codecParams.audio.opus.usedtx;
    } else if (typeof audioSettings.usedtx === 'boolean') {
      opusOptions.usedtx = audioSettings.usedtx;
    }
    if (typeof initOptions.codecParams.audio.opus.useinbandfec === 'boolean') {
      opusOptions.useinbandfec = initOptions.codecParams.audio.opus.useinbandfec;
    } else if (typeof audioSettings.useinbandfec === 'boolean') {
      opusOptions.useinbandfec = audioSettings.useinbandfec;
    }
    if (typeof initOptions.codecParams.audio.opus.maxplaybackrate === 'number') {
      opusOptions.maxplaybackrate = initOptions.codecParams.audio.opus.maxplaybackrate;
    } else if (typeof audioSettings.maxplaybackrate === 'number') {
      opusOptions.maxplaybackrate = audioSettings.maxplaybackrate;
    }
    if (typeof initOptions.codecParams.audio.opus.minptime === 'number') {
      opusOptions.minptime = initOptions.codecParams.audio.opus.minptime;
    } else if (typeof audioSettings.minptime === 'number') {
      opusOptions.minptime = audioSettings.minptime;
    }
    // Possible future params: sprop-maxcapturerate, maxaveragebitrate, sprop-stereo, cbr
    // NOT recommended: maxptime, ptime, rate, minptime
    return opusOptions;
  })());

  // RFC: https://tools.ietf.org/html/rfc4733
  // Future: Set telephone-event: 100 0-15,66,70

  // RFC: https://tools.ietf.org/html/draft-ietf-payload-vp8-17
  // Set video codecs -> VP8
  parseFn(sessionDescription, 'video', constants.VIDEO_CODEC.VP8, null, (() => {
    const vp8Options = {};
    // NOT recommended: max-fr, max-fs (all are codec decoder capabilities)
    if (typeof initOptions.codecParams.video.vp8.maxFr === 'number') {
      vp8Options['max-fr'] = initOptions.codecParams.video.vp8.maxFr;
    }
    if (typeof initOptions.codecParams.video.vp8.maxFs === 'number') {
      vp8Options['max-fs'] = initOptions.codecParams.video.vp8.maxFs;
    }
    return vp8Options;
  })());

  // RFC: https://tools.ietf.org/html/draft-ietf-payload-vp9-02
  // Set video codecs -> VP9
  parseFn(sessionDescription, 'video', constants.VIDEO_CODEC.VP9, null, (() => {
    const vp9Options = {};
    // NOT recommended: max-fr, max-fs (all are codec decoder capabilities)
    if (typeof initOptions.codecParams.video.vp9.maxFr === 'number') {
      vp9Options['max-fr'] = initOptions.codecParams.video.vp9.maxFr;
    }
    if (typeof initOptions.codecParams.video.vp9.maxFs === 'number') {
      vp9Options['max-fs'] = initOptions.codecParams.video.vp9.maxFs;
    }
    return vp9Options;
  })());

  // RFC: https://tools.ietf.org/html/rfc6184
  // Set the video codecs -> H264
  parseFn(sessionDescription, 'video', constants.VIDEO_CODEC.H264, null, (() => {
    const h264Options = {};
    if (typeof initOptions.codecParams.video.h264.levelAsymmetryAllowed === 'string') {
      h264Options['profile-level-id'] = initOptions.codecParams.video.h264.profileLevelId;
    }
    if (typeof initOptions.codecParams.video.h264.levelAsymmetryAllowed === 'boolean') {
      h264Options['level-asymmetry-allowed'] = initOptions.codecParams.video.h264.levelAsymmetryAllowed;
    }
    if (typeof initOptions.codecParams.video.h264.packetizationMode === 'boolean') {
      h264Options['packetization-mode'] = initOptions.codecParams.video.h264.packetizationMode;
    }
    // Possible future params (remove if they are decoder/encoder capabilities or info):
    //   max-recv-level, max-mbps, max-smbps, max-fs, max-cpb, max-dpb, max-br,
    //   max-mbps, max-smbps, max-fs, max-cpb, max-dpb, max-br, redundant-pic-cap, sprop-parameter-sets,
    //   sprop-level-parameter-sets, use-level-src-parameter-sets, in-band-parameter-sets,
    //   sprop-interleaving-depth, sprop-deint-buf-req, deint-buf-cap, sprop-init-buf-time,
    //   sprop-max-don-diff, max-rcmd-nalu-size, sar-understood, sar-supported
    //   NOT recommended: profile-level-id (WebRTC uses "42e00a" for the moment)
    //   https://bugs.chromium.org/p/chromium/issues/detail?id=645599
    return h264Options;
  })());

  return sessionDescription.sdp;
};

export default setSDPCodecParams;
