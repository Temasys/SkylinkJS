import {
  TURN_TRANSPORT,
  AUDIO_CODEC,
  VIDEO_CODEC,
} from '../../constants';

/**
 * @namespace initOptions
 * @private
 * @module skylink/defaultOptions
 */
const defaultOptions = {
  /*
   * @param {String} options.appKey The App Key.
   * <small>By default, <code>init()</code> uses [HTTP CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
   * authentication. For credentials based authentication, see the <code>options.credentials</code> configuration
   * below. You can know more about the <a href="http://support.temasys.io/support/solutions/articles/
   * 12000002712-authenticating-your-application-key-to-start-a-connection">in the authentication methods article here</a>
   * for more details on the various authentication methods.</small>
   * <small>If you are using the Persistent Room feature for scheduled meetings, you will require to
   * use the credential based authentication. See the <a href="http://support.temasys.io/support
   * /solutions/articles/12000002811-using-the-persistent-room-feature-to-configure-meetings">Persistent Room article here
   * </a> for more information.</small>
   */
  defaultRoom: null,
  appKey: null,
  roomServer: '//api.temasys.io',
  enableDataChannel: true,
  enableSTUNServer: true,
  enableTURNServer: true,
  socketServerPath: null,
  enableStatsGathering: true,
  audioFallback: true,
  socketTimeout: 7000,
  forceTURNSSL: false,
  forceTURN: false,
  forceSSL: true,
  usePublicSTUN: false,
  mcuUseRenegoRestart: true,
  useEdgeWebRTC: false,
  enableSimultaneousTransfers: true,
  TURNServerTransport: TURN_TRANSPORT.ANY,
  credentials: null,
  iceServer: null,
  socketServer: null,
  audioCodec: AUDIO_CODEC.AUTO,
  videoCodec: VIDEO_CODEC.AUTO,
  codecParams: { // TODO: review if codec setting is needed
    audio: {
      opus: {
        stereo: null,
        'sprop-stereo': null,
        usedtx: null,
        useinbandfec: null,
        maxplaybackrate: null,
        minptime: null,
      },
    },
    video: {
      h264: {
        profileLevelId: null,
        levelAsymmetryAllowed: null,
        packetizationMode: null,
      },
      vp8: {
        maxFs: null,
        maxFr: null,
      },
      vp9: {
        maxFs: null,
        maxFr: null,
      },
    },
  },
  beSilentOnStatsLogs: false,
  beSilentOnParseLogs: false,
  statsInterval: 20, // sec
};

/**
 * Default values for options available to initialise SkylinkJS.
 */
export default defaultOptions;
