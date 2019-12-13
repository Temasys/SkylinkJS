import { mediaTrack } from './mediaTrack';

export const singaporeRoomState = () => {
  return {
    streams: {
      userMedia: {
        stream: {
          getAudioTracks: () => {
            return [mediaTrack(), mediaTrack()];
          },
          getVideoTracks: () => {
            return [mediaTrack(), mediaTrack()];
          }
        }
      },
      screenshare: {
        stream: {
          getAudioTracks: () => {
            return [mediaTrack(), mediaTrack()];
          },
          getVideoTracks: () => {
            return [mediaTrack(), mediaTrack()];
          }
        }
      }
    }
  };
}

export const singaporeAndHongKongRoomState = () => {
  return {
    singapore: {
      streams: {
        userMedia: {
          stream: {
            getAudioTracks: () => {
              return [mediaTrack(), mediaTrack()];
            },
            getVideoTracks: () => {
              return [mediaTrack(), mediaTrack()];
            }
          }
        }
      }
    },
    hongkong: {
      streams: {
        userMedia: {
          stream: {
            getAudioTracks: () => {
              return [mediaTrack(), mediaTrack()];
            },
            getVideoTracks: () => {
              return [mediaTrack(), mediaTrack()];
            }
          }
        }
      }
    }
  };
}

export const roomStateNoPeerInformationsAndPeerConnections = () => {
  return {
    id: '0001',
    peerInformations: {
      '04jdjsdokxhs': undefined,
    },
    peerConnections: {
      '04jdjsdokxhs': {
        signalingState: 'open',
        close: () => {},
        signalingStateClosed: false,
        iceConnectionStateClosed: false,
        getStats: () => new Promise((resolve, reject) => {

        }),
      },
    },
    streamsSession: {

    },
  }
}

export const roomStateWithPeerObjects = () => {
  return {
    id: '0002',
    peerConnectionConfig: {
      certificate: () => {}
    },
    room: {
      id: 'singapore',
    },
    user: {
      sid: 'user-sid-9999',
    },
    peerInformations: {
      '04jdjsdokxhs': {
        settings: {
          bandwidth: '',
        },
        mediaStatus: {
          audioMuted: true
        },
        config: {
          receiveOnly: ''
        }
      },
    },
    peerConnections: {
      '04jdjsdokxhs': {
        signalingState: 'open',
        close: () => {},
        signalingStateClosed: false,
        iceConnectionStateClosed: false,
        getStats: () => new Promise((resolve, reject) => {
        }),
      },
      'peer-1': {
        signalingState: 'open',
        close: () => {},
        signalingStateClosed: false,
        iceConnectionStateClosed: false,
        getStats: () => new Promise((resolve, reject) => {
        }),
      },
      'peer-2': {
        signalingState: 'open',
        close: () => {},
        signalingStateClosed: false,
        iceConnectionStateClosed: false,
        getStats: () => new Promise((resolve, reject) => {
        }),
      }
    },
    peerInformations: {
      '04jdjsdokxhs': {
        settings: {
          bandwidth: '',
          video: {
            customSettings: {
              frameRate: 1
            }
          }
        },
        mediaStatus: {
          audioMuted: true,
        },
        config: {
          receiveOnly: true,
          publishOnly: false,
        }
      },
    },
    peerMessagesStamps: {
      '04jdjsdokxhs': {
      },
    },
    streamsSession: {
      'peer-1': {
        'stream-id-000001': {
          audio: true,
          video: {
            resolution: {
              width: 640,
              height: 480
            },
            screenshare: true,
          },
          settings: {
            audio: true,
            video: {
              screenshare: true,
            }
          }
        },
        'stream-id-000002': {
          audio: true,
          video: {
            resolution: {
              width: 640,
              height: 480
            },
            screenshare: true,
          },
          settings: {
            audio: true,
            video: {
              screenshare: true,
            }
          }
        },
      },
      'peer-2': {
      },
    },
    peerEndOfCandidatesCounter: {
      '04jdjsdokxhs': {
      },
    },
    peerCandidatesQueue: {
      '04jdjsdokxhs': {
      },
    },
    sdpSessions: {
      '04jdjsdokxhs': {
      },
    },
    peerStats: {
      '04jdjsdokxhs': {
      },
    },
    peerBandwidth: {
      '04jdjsdokxhs': {
      },
    },
    gatheredCandidates: {
      '04jdjsdokxhs': {
      },
    },
    peerCustomConfigs: {
      '04jdjsdokxhs': {
      },
    },
    sdpSettings: {
      direction: {
        audio: {
          receive: ''
        },
        video: {
          receive: ''
        }
      },
      connection:{
        audio: ''
      }
    },
    dataChannels: {
      '04jdjsdokxhs': {}
    },
    peerConnStatus: {
      '04jdjsdokxhs': {
        signalingState: 'open',
        close: () => {},
        signalingStateClosed: false,
        iceConnectionStateClosed: false
      }
    },
    sdpSessions: {
      '04jdjsdokxhs': {}
    },
    hasMCU: false
  }
}

export const roomStateArgentinaWithPeerMCUObjects = () => {
  return {
    id: '0003',
    peerConnectionConfig: {
      certificate: () => {}
    },
    room: {
      id: 'argentina',
    },
    user: {
      sid: 'user-sid-9999',
    },
    peerInformations: {
      'MCU': {
        settings: {
          bandwidth: '',
        },
        mediaStatus: {
          audioMuted: true
        },
        config: {
          receiveOnly: ''
        }
      },
    },
    peerConnections: {
      'MCU': {
        signalingState: 'open',
        close: () => {},
        signalingStateClosed: false,
        iceConnectionStateClosed: false,
        getStats: () => new Promise((resolve, reject) => {
        }),
      },
      'peer-1': {
        signalingState: 'open',
        close: () => {},
        signalingStateClosed: false,
        iceConnectionStateClosed: false,
        getStats: () => new Promise((resolve, reject) => {
        }),
      }
    },
    peerInformations: {
      'MCU': {
        settings: {
          bandwidth: '',
          video: {
            customSettings: {
              frameRate: 1
            }
          }
        },
        mediaStatus: {
          audioMuted: true,
        },
        config: {
          receiveOnly: true,
          publishOnly: false,
        }
      },
    },
    peerMessagesStamps: {
      'MCU': {
      },
    },
    streamsSession: {
      'peer-1': {
        'stream-id-000001': {
          audio: true,
          video: {
            resolution: {
              width: 640,
              height: 480
            },
            screenshare: true,
          },
          settings: {
            audio: true,
            video: {
              screenshare: true,
            }
          }
        },
        'MCU': {
          audio: true,
          video: {
            resolution: {
              width: 640,
              height: 480
            },
            screenshare: true,
          },
          settings: {
            audio: true,
            video: {
              screenshare: true,
            }
          }
        },
      },
      'peer-2': {
      },
    },
    peerEndOfCandidatesCounter: {
      'MCU': {
      },
    },
    peerCandidatesQueue: {
      'MCU': {
      },
    },
    sdpSessions: {
      'MCU': {
      },
    },
    peerStats: {
      'MCU': {
      },
    },
    peerBandwidth: {
      'MCU': {
      },
    },
    gatheredCandidates: {
      'MCU': {
      },
    },
    peerCustomConfigs: {
      'MCU': {
      },
    },
    sdpSettings: {
      direction: {
        audio: {
          receive: ''
        },
        video: {
          receive: ''
        }
      },
      connection:{
        audio: ''
      }
    },
    dataChannels: {
      '04jdjsdokxhs': {}
    },
    peerConnStatus: {
      '04jdjsdokxhs': {
        signalingState: 'open',
        close: () => {},
        signalingStateClosed: false,
        iceConnectionStateClosed: false
      }
    },
    sdpSessions: {
      '04jdjsdokxhs': {}
    },
    hasMCU: false
  }
}

export const roomStateWithPeerMCUObjects = () => {
  return {
    id: '0003',
    peerConnectionConfig: {
      certificate: 'AUTO'
    },
    room: {
      id: 'singapore',
    },
    user: {
      sid: 'user-sid-9999',
    },
    peerInformations: {
      'MCU': {
        settings: {
          bandwidth: '',
        },
        mediaStatus: {
          audioMuted: true
        },
        config: {
          receiveOnly: ''
        }
      },
    },
    peerConnections: {
      'MCU': {
        signalingState: 'open',
        close: () => {},
        signalingStateClosed: false,
        iceConnectionStateClosed: false,
        getStats: () => new Promise((resolve, reject) => {

        }),
      },
      '04jdjsdokxhs': {
        signalingState: 'open',
        close: () => {},
        signalingStateClosed: false,
        iceConnectionStateClosed: false,
        getStats: () => new Promise((resolve, reject) => {

        }),
      },
    },
    peerInformations: {
      'MCU': {
        settings: {
          bandwidth: '',
        },
        mediaStatus: {
          audioMuted: true,
        },
        config: {
          receiveOnly: true,
          publishOnly: false,
        }
      },
    },
    peerMessagesStamps: {
      'MCU': {
      },
    },
    streamsSession: {
      'MCU': {
      },
    },
    peerEndOfCandidatesCounter: {
      'MCU': {
      },
    },
    peerCandidatesQueue: {
      'MCU': {
      },
    },
    sdpSessions: {
      'MCU': {
      },
    },
    peerStats: {
      'MCU': {
      },
    },
    peerBandwidth: {
      'MCU': {
      },
    },
    gatheredCandidates: {
      'MCU': {
      },
    },
    peerCustomConfigs: {
      'MCU': {
      },
    },
    peerConnStatus: {
      'MCU': {
      },
    },
    sdpSettings: {
      direction: {
        audio: {
          receive: ''
        },
        video: {
          receive: ''
        }
      },
      connection:{
        audio: ''
      }
    },
    dataChannels: {
      'MCU': {}
    },
    peerConnStatus: {
      'MCU': {
        signalingState: 'open',
        close: () => {},
        signalingStateClosed: false,
        iceConnectionStateClosed: false
      }
    },
    sdpSessions: {
      'MCU': {}
    },
    hasMCU: true
  }
}

