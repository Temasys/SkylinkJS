import helpers from './helpers/index';

class SessionDescription {
  static getSDPCommonSupports(...args) {
    return helpers.getSDPCommonSupports(...args);
  }

  static getCodecsSupport(...args) {
    return helpers.getCodecsSupport(...args);
  }

  static setSDPBitrate(...args) {
    return helpers.setSDPBitrate(...args);
  }

  static getSDPCodecsSupport(...args) {
    return helpers.getSDPCodecsSupport(...args);
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

  static removeSDPFilteredCandidates(...args) {
    return helpers.removeSDPFilteredCandidates(...args);
  }
}

export default SessionDescription;
