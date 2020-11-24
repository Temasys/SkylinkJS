const config = {
  apiBase: 'https://api.temasys.io',
  stats: {
    endPoints: {
      client: '/client',
      session: '/session',
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

config.stats.statsBase = `${config.apiBase}/rest/stats`;

export default config;
