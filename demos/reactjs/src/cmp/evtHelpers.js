import { SkylinkEventManager, SkylinkEvents } from 'skylinkjs';

class DemoLoggerHelper {
  constructor() {
    this.skylinkEventManager = SkylinkEventManager;
    this.evts = {
      candidate: [
        SkylinkEvents.CANDIDATE_PROCESSING_STATE,
        SkylinkEvents.CANDIDATE_GENERATION_STATE,
        SkylinkEvents.CANDIDATES_GATHERED,
        SkylinkEvents.ICE_CONNECTION_STATE,
        SkylinkEvents.DATA_STREAM_STATE,
        SkylinkEvents.DATA_STREAM_STATE,
        SkylinkEvents.DATA_TRANSFER_STATE
      ],
      dataTransfer: [
        SkylinkEvents.CANDIDATE_GENERATION_STATE,
        SkylinkEvents.CANDIDATES_GATHERED,
        SkylinkEvents.ICE_CONNECTION_STATE,
        SkylinkEvents.DATA_STREAM_STATE,
        SkylinkEvents.DATA_TRANSFER_STATE
      ],
      dataChannel: [
        SkylinkEvents.ON_INCOMING_DATA,
        SkylinkEvents.ON_INCOMING_DATA_REQUEST,
        SkylinkEvents.ON_INCOMING_DATA_STREAM,
        SkylinkEvents.ON_INCOMING_DATA_STREAM_STARTED,
        SkylinkEvents.ON_INCOMING_DATA_STREAM_STOPPED,
        SkylinkEvents.DATA_CHANNEL_STATE,
        SkylinkEvents.ON_INCOMING_MESSAGE
      ],
      media: [
        SkylinkEvents.MEDIA_ACCESS_FALLBACK,
        SkylinkEvents.MEDIA_ACCESS_REQUIRED,
        SkylinkEvents.MEDIA_ACCESS_STOPPED,
        SkylinkEvents.MEDIA_ACCESS_SUCCESS,
        SkylinkEvents.RECORDING_STATE,
        SkylinkEvents.RTMP_STATE,
        SkylinkEvents.LOCAL_MEDIA_MUTED,
        SkylinkEvents.MEDIA_ACCESS_ERROR
      ],
      peer: [
        SkylinkEvents.PEER_UPDATED,
        SkylinkEvents.PEER_JOINED,
        SkylinkEvents.PEER_LEFT,
        SkylinkEvents.PEER_RESTART,
        SkylinkEvents.SERVER_PEER_JOINED,
        SkylinkEvents.SERVER_PEER_LEFT,
        SkylinkEvents.SERVER_PEER_RESTART,
        SkylinkEvents.GET_PEERS_STATE_CHANGE,
        SkylinkEvents.PEER_CONNECTION_STATE,
        SkylinkEvents.SESSION_DISCONNECT,
        SkylinkEvents.GET_CONNECTION_STATUS_STATE_CHANGE
      ],
      peerHandshake: [
        SkylinkEvents.HANDSHAKE_PROGRESS,
        SkylinkEvents.INTRODUCE_STATE_CHANGE
      ],
      room: [
        SkylinkEvents.ROOM_LOCK,
        SkylinkEvents.BYE
      ],
      socket: [
        SkylinkEvents.CHANNEL_OPEN,
        SkylinkEvents.CHANNEL_CLOSE,
        SkylinkEvents.CHANNEL_ERROR,
        SkylinkEvents.CHANNEL_MESSAGE,
        SkylinkEvents.CHANNEL_RETRY,
        SkylinkEvents.SOCKET_ERROR,
        SkylinkEvents.SYSTEM_ACTION
      ],
      stream: [
        SkylinkEvents.ON_INCOMING_STREAM,
        SkylinkEvents.ON_INCOMING_SCREEN_STREAM,
        SkylinkEvents.STREAM_ENDED,
        SkylinkEvents.STREAM_MUTED
      ],
    };

    this.registeredEvts = null;
  }

  static logToConsole(trigger, type = "METHOD", payload = "", error) {
    if (error) {
      console.error(`SKYLINK DEMO - [${trigger}]`, error);
      return;
    }
    console.log(`SKYLINK DEMO - [${trigger}] [${type}] -->`, payload);
  };

  static evtLogger(evt) {
    const { detail } = evt;
    DemoLoggerHelper.logToConsole(evt.type, 'EVT', detail);
  };

  initRegisterEvtLoggers() {
    this.registeredEvts = {
      candidate: false,
      dataTransfer: false,
      dataChannel: false,
      media: false,
      peer: false,
      peerHandshake: false,
      room: false,
      socket: false,
      stream: false,
      allEvts: false
    };
  }

  registerAllEvents() {
    this.evts.candidate.forEach((evt) => {
      this.skylinkEventManager.addEventListener(evt, DemoLoggerHelper.evtLogger);
      this.registeredEvts.candidate = true;
    });

    this.evts.dataTransfer.forEach((evt) => {
      this.skylinkEventManager.addEventListener(evt, DemoLoggerHelper.evtLogger);
      this.registeredEvts.dataTransfer = true;
    });

    this.evts.dataChannel.forEach((evt) => {
      this.skylinkEventManager.addEventListener(evt, DemoLoggerHelper.evtLogger);
      this.registeredEvts.dataChannel = true;
    });

    this.evts.media.forEach((evt) => {
      this.skylinkEventManager.addEventListener(evt, DemoLoggerHelper.evtLogger);
      this.registeredEvts.media = true;
    });

    this.evts.peer.forEach((evt) => {
      this.skylinkEventManager.addEventListener(evt, DemoLoggerHelper.evtLogger);
      this.registeredEvts.peer = true;
    });

    this.evts.peerHandshake.forEach((evt) => {
      this.skylinkEventManager.addEventListener(evt, DemoLoggerHelper.evtLogger);
      this.registeredEvts.peerHandshake = true;
    });

    this.evts.room.forEach((evt) => {
      this.skylinkEventManager.addEventListener(evt, DemoLoggerHelper.evtLogger);
      this.registeredEvts.room = true;
    });

    this.evts.socket.forEach((evt) => {
      this.skylinkEventManager.addEventListener(evt, DemoLoggerHelper.evtLogger);
      this.registeredEvts.socket = true;
    });

    this.evts.stream.forEach((evt) => {
      this.skylinkEventManager.addEventListener(evt, DemoLoggerHelper.evtLogger);
      this.registeredEvts.stream = true;
    });

    this.registeredEvts.allEvts = true;

    DemoLoggerHelper.logToConsole("demoLoggerHelper", `All evts`, 'registered');
  };

  isAllEvtsRegistered() {
    let isAll = true;
    const evts = this.registeredEvts;

    Object.keys(evts).forEach((key) => {
      if (!evts[key] && key !== 'allEvts') {
        isAll = false;
      }
    });

    return isAll;
  }

  registerOrUnregisterEvts(evtToToggle) {
    if (evtToToggle === 'allEvts') {
      this.registerAllEvents();
      return;
    }

    if (this.registeredEvts[evtToToggle]) {
      this.evts[evtToToggle].forEach((evtType) => {
        this.skylinkEventManager.removeEventListener(evtType, DemoLoggerHelper.evtLogger)
      });

      DemoLoggerHelper.logToConsole("demoLoggerHelper", `${evtToToggle} evts`, 'unregistered');
      this.registeredEvts[evtToToggle] = false;
      this.registeredEvts.allEvts = this.isAllEvtsRegistered();
    } else {
      if (!this.registeredEvts[evtToToggle]) {
        this.evts[evtToToggle].forEach((evtType) => {
          this.skylinkEventManager.addEventListener(evtType, DemoLoggerHelper.evtLogger)
        });

        DemoLoggerHelper.logToConsole("demoLoggerHelper", `${evtToToggle} evts`, 'registered');
        this.registeredEvts[evtToToggle] = true;
        this.registeredEvts.allEvts = this.isAllEvtsRegistered();
      }
    }
  }
}

export default DemoLoggerHelper;


