import helpers from './helpers/index';

class SessionDescription {
  static getSDPCommonSupports(...args) {
    return helpers.getSDPCommonSupports(...args);
  }

  static getCodecsSupport(...args) {
    return helpers.getCodecsSupport(...args);
  }

  static setSDPCodecParams(...args) {
    return helpers.setSDPCodecParams(...args);
  }

  static removeSDPFilteredCandidates(...args) {
    return helpers.removeSDPFilteredCandidates(...args);
  }

  static setSDPCodec(...args) {
    return helpers.setSDPCodec(...args);
  }

  static setSDPBitrate(...args) {
    return helpers.setSDPBitrate(...args);
  }

  static removeSDPCodecs(...args) {
    return helpers.removeSDPCodecs(...args);
  }

  static removeSDPREMBPackets(...args) {
    return helpers.removeSDPREMBPackets(...args);
  }

  static handleSDPConnectionSettings(...args) {
    return helpers.handleSDPConnectionSettings(...args);
  }

  static removeSDPUnknownAptRtx(...args) {
    return helpers.removeSDPUnknownAptRtx(...args);
  }

  static getSDPCodecsSupport(...args) {
    return helpers.getSDPCodecsSupport(...args);
  }

  static removeSDPFirefoxH264Pref(...args) {
    return helpers.removeSDPFirefoxH264Pref(...args);
  }

  static renderSDPOutput(...args) {
    return helpers.renderSDPOutput(...args);
  }

  static getSDPICECandidates(...args) {
    return helpers.getSDPICECandidates(...args);
  }

  static getSDPSelectedCodec(...args) {
    return helpers.getSDPSelectedCodec(...args);
  }

  static getTransceiverMid(...args) {
    return helpers.getTransceiverMid(...args);
  }
}

export default SessionDescription;
