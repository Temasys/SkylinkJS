const config = {
  stats: {
    endPoints: {
      client: '/client',
      session: '/client/session',
      auth: '/auth',
      signaling: '/client/signaling',
      iceConnection: '/client/iceconnection',
      iceCandidate: '/client/icecandidate',
      iceGathering: '/client/icegathering',
      negotiation: '/client/negotiation',
      bandwidth: '/client/bandwidth',
      recording: '/client/recording',
      dataChannel: '/client/datachannel',
      userMedia: '/client/usermedia',
    },
  },
};

config.stats.statsBase = '/rest/stats';

export default config;
