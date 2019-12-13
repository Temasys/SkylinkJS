import React, { Component } from 'react';
import {
  Container,
  Grid,
  Form,
  Button,
  Header,
  Segment,
  Accordion,
  Modal,
  Dropdown,
  Checkbox
} from 'semantic-ui-react';
import icon from './assets/person.svg';
import Skylink, { SkylinkLogger, SkylinkEventManager, SkylinkEvents, SkylinkConstants } from 'skylinkjs';
import { appConfig } from './app-config';
import DemoLoggerHelper from './evtHelpers';

SkylinkLogger.setLevel(SkylinkLogger.logLevels.DEBUG);

class SkylinkDemo extends Component {
  constructor(props) {
    super(props);
    global.Skylink = Skylink;
    this.skylink = new Skylink(appConfig);
    global.SkylinkDemo = this.skylink;
    this.skylinkEventManager = SkylinkEventManager;
    this.demoLoggerHelper = new DemoLoggerHelper();
    this.demoLoggerHelper.initRegisterEvtLoggers();
    this.state = {
      hongkong: {
        username: '',
        newUsername: '',
        peerId: '',
        inRoom: false,
        showLoader: false,
        message: '',
        messages: [],
        title: 'Hong Kong',
        remotePeers: [],
        selectedPeers: [],
        messageChannel: 'P2P',
        roomLocked: false,
        streamMuted: {
          videoMuted: false,
          audioMuted: false,
        }
      },
      singapore: {
        username: '',
        peerId: '',
        inRoom: false,
        showLoader: false,
        message: '',
        messages: [],
        title: 'Singapore',
        remotePeers: [],
        selectedPeers: [],
        messageChannel: 'P2P',
        roomLocked: false,
        streamMuted: {
          videoMuted: false,
          audioMuted: false,
        }
      },
      newyork: {
        username: '',
        peerId: '',
        inRoom: false,
        showLoader: false,
        message: '',
        messages: [],
        title: 'New York',
        remotePeers: [],
        selectedPeers: [],
        messageChannel: 'P2P',
        roomLocked: false,
        streamMuted: {
          videoMuted: false,
          audioMuted: false,
        }
      },
      registeredEvts: this.demoLoggerHelper.registeredEvts,
    };

    this.toggleEvt = this.toggleEvt.bind(this);
    this.prefetchedStream = null;

    this.localFeedRef = React.createRef();
    this.joinRoom = this.joinRoom.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
    this.leaveAllRooms = this.leaveAllRooms.bind(this);
    this.lockRoom = this.lockRoom.bind(this);
    this.userNameEntered = this.userNameEntered.bind(this);
    this.onIncomingStream = this.onIncomingStream.bind(this);
    this.onPeerJoined = this.onPeerJoined.bind(this);
    this.onRoomLocked = this.onRoomLocked.bind(this);
    this.onIncomingMessage = this.onIncomingMessage.bind(this);
    this.messageEntered = this.messageEntered.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getConnectionStatus = this.getConnectionStatus.bind(this);
    this.refreshDataChannel = this.refreshDataChannel.bind(this);
    this.refreshConnections = this.refreshConnections.bind(this);
    this.onPeerLeft = this.onPeerLeft.bind(this);
    this.shareScreen = this.shareScreen.bind(this);
    this.shareScreenReplace = this.shareScreenReplace.bind(this);
    this.onStreamEnded = this.onStreamEnded.bind(this);
    this.getPeerCustomSettings = this.getPeerCustomSettings.bind(this);
    this.getUserMedia = this.getUserMedia.bind(this);
    this.stopStream = this.stopStream.bind(this);
    this.stopScreen = this.stopScreen.bind(this);
    this.onPeerSelected = this.onPeerSelected.bind(this);
    this.onMessageChannelSelected = this.onMessageChannelSelected.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.onSystemAction = this.onSystemAction.bind(this);
    this.muteStream = this.muteStream.bind(this);
    this.sendStream = this.sendStream.bind(this);
    this.prefetchGetUserMedia = this.prefetchGetUserMedia.bind(this);
    this.onIncomingScreenStream = this.onIncomingScreenStream.bind(this);
    this.getPeersInRoom = this.getPeersInRoom.bind(this);
    this.getPeerInfo = this.getPeerInfo.bind(this);
    this.getUserData = this.getUserData.bind(this);
    this.setUserData = this.setUserData.bind(this);
    this.getPeersStream = this.getPeersStream.bind(this);
    this.getPeersDataChannels = this.getPeersDataChannels.bind(this);
    this.getPeersScreenshare = this.getPeersScreenshare.bind(this);
    this.getRecordings = this.getRecordings.bind(this);
    this.getStreamSources = this.getStreamSources.bind(this);
    this.getScreenSources = this.getScreenSources.bind(this);
    this.getPeers = this.getPeers.bind(this);
    this.toggleAudioVideo = this.toggleAudioVideo.bind(this);
    this.updateUsername = this.updateUsername.bind(this);
    this.onServerPeerLeft = this.onServerPeerLeft.bind(this);


    this.skylinkEventManager.addEventListener(SkylinkEvents.INCOMING_STREAM, this.onIncomingStream);
    this.skylinkEventManager.addEventListener(SkylinkEvents.PEER_LEFT, this.onPeerLeft);
    this.skylinkEventManager.addEventListener(SkylinkEvents.ON_INCOMING_MESSAGE, this.onIncomingMessage);
    this.skylinkEventManager.addEventListener(SkylinkEvents.PEER_JOINED, this.onPeerJoined);
    this.skylinkEventManager.addEventListener(SkylinkEvents.HANDSHAKE_PROGRESS, this.handshakeProgress);
    this.skylinkEventManager.addEventListener(SkylinkEvents.STREAM_ENDED, this.onStreamEnded);
    this.skylinkEventManager.addEventListener(SkylinkEvents.SYSTEM_ACTION, this.onSystemAction);
    this.skylinkEventManager.addEventListener(SkylinkEvents.ROOM_LOCK, this.onRoomLocked);
    this.skylinkEventManager.addEventListener(SkylinkEvents.INCOMING_SCREEN_STREAM, this.onIncomingScreenStream);
    this.skylinkEventManager.addEventListener(SkylinkEvents.INCOMING_SCREEN_STREAM, this.onIncomingScreenStream);
    this.skylinkEventManager.addEventListener(SkylinkEvents.SERVER_PEER_LEFT, this.onServerPeerLeft);
  }

  toggleEvt(evt) {
    this.demoLoggerHelper.registerOrUnregisterEvts(evt.currentTarget.value);
    this.setState({registeredEvts: this.demoLoggerHelper.registeredEvts });
  }

  joinRoom(location) {
    const locationState = Object.assign({}, this.state[location]);
    const joinRoomOptions = {
      audio: !locationState.streamMuted.audio,
      video: !locationState.streamMuted.video,
      roomName: location,
      userData: {
        username: locationState.username
      },
    };

    locationState.showJoinRoomLoader = true;
    this.setState({ [location]: locationState });

    this.skylink.joinRoom(joinRoomOptions, this.prefetchedStream).then((streams) => {
      DemoLoggerHelper.logToConsole('joinRoom', undefined, streams);

      const locationState = Object.assign({}, this.state[location]);
      locationState.inRoom = true;
      locationState.showJoinRoomLoader = false;

      this.setState({ [location]: locationState }, () => {
        const localFeedElem = document.getElementById(`local-feed_${location}`);
        streams.forEach((stream) => {
          if (stream.getVideoTracks().length > 0) {
            window.attachMediaStream(localFeedElem, stream);
          }
       })
      });
    }).catch((error) => {
      DemoLoggerHelper.logToConsole('joinRoom', undefined, null, error);
    });
  }

  sendMessage(location) {
    const message = this.state[location]['message'];
    const selectedPeers = this.state[location]['selectedPeers'];
    const messageChannel = this.state[location]['messageChannel'];
    if (messageChannel === 'P2P') {
      this.skylink.sendP2PMessage(message, selectedPeers, location);
    } else {
      this.skylink.sendMessage(location, message, selectedPeers);
    }
  }

  getPeersInRoom(location) {
    DemoLoggerHelper.logToConsole('getPeersInRoom', undefined, this.skylink.getPeersInRoom(location));
  }

  getPeerInfo(location) {
    const peerIds = Object.keys(this.skylink.getPeersInRoom(location));
    peerIds.forEach(peerId => {
      DemoLoggerHelper.logToConsole('getPeerInfo', undefined, this.skylink.getPeerInfo(location, peerId));
    })
  }

  getUserData(location) {
    DemoLoggerHelper.logToConsole('getUserData', undefined, JSON.parse(this.skylink.getUserData(location)));
  }

  updateUsername(location, evt) {
    const locationState = Object.assign({}, this.state[location]);
    locationState.newUsername = evt.target.value;
    this.setState({[location]: locationState });
  }

  setUserData(location) {
      const locationState = Object.assign({}, this.state[location]);
      locationState.username = locationState.newUsername;
      locationState.newUsername = '';
      const userData = {
        username: locationState.username,
      };
      DemoLoggerHelper.logToConsole('setUserData', undefined, this.skylink.setUserData(location, JSON.stringify(userData)));
      this.setState({[location]: locationState });
  }

  getConnectionStatus(location) {
    this.skylink.getConnectionStatus(location).then((result) => {
      DemoLoggerHelper.logToConsole('getConnectionStatus', undefined, result);
    }).catch((error) => {
      DemoLoggerHelper.logToConsole('getConnectionStatus', undefined, undefined, error);
    })
  }

  getPeers(location) {
    this.skylink.getPeers(location, true)
      .then((result) => {
        DemoLoggerHelper.logToConsole('getPeers', undefined, result);
      })
      .catch((error) => {
        DemoLoggerHelper.logToConsole('getPeers', undefined, null, error);
      })
  }

  getPeersStream(location) {
    DemoLoggerHelper.logToConsole('getPeersStream', undefined, this.skylink.getPeersStream(location));
  }

  getPeersDataChannels(location) {
    DemoLoggerHelper.logToConsole('getPeersDataChannels', undefined, this.skylink.getPeersDataChannels(location));
  }

  getPeerCustomSettings(location) {
    DemoLoggerHelper.logToConsole('getPeerCustomSettings', undefined, this.skylink.getPeersCustomSettings(location));
  }

  refreshDataChannel(location) {
    const peers = this.skylink.getPeersInRoom(location);
    const peerIds = Object.keys(peers);

    for(let i = 0; i < peerIds.length; i += 1) {
      this.skylink.refreshDatachannel(location, peerIds[i]);
    }
  }

  refreshConnections(location) {
    this.skylink.refreshConnection(location).then((result) => {
      DemoLoggerHelper.logToConsole('refreshConnection', undefined, result);

      if (result.refreshErrors.length > 0) {
        DemoLoggerHelper.logToConsole('refreshConnection', undefined, result, result.refreshErrors);
      }
    }).catch((error) => { DemoLoggerHelper.logToConsole('refreshConnection', undefined, undefined, error); });
  }

  shareScreen(location) {
    this.skylink.shareScreen(location, false).then((screenStream) => {
      DemoLoggerHelper.logToConsole('shareScreen', undefined, screenStream);
      window.attachMediaStream(document.getElementById(`local-feed_screen_${location}`), screenStream);
    });
  }

  getPeersScreenshare(location) {
    DemoLoggerHelper.logToConsole('getPeersScreenshare', undefined, this.skylink.getPeersScreenshare(location));
  }

  prefetchGetUserMedia() {
    this.skylink.getUserMedia({ audio: false, video: true }).then((stream) => {
      DemoLoggerHelper.logToConsole('getUserMedia', undefined, stream);
      this.prefetchedStream = stream;
    }).catch((error) => { DemoLoggerHelper.logToConsole('getUserMedia', undefined, undefined, error)});
  }

  stopScreen(location) {
    this.skylink.stopScreen(location);
  }

  stopStream(location) {
    const streamList = this.skylink.retrieveStreams(location);
    if(streamList.userMedia) {
      const streamIds = Object.keys(streamList.userMedia);
      this.skylink.stopStream(location);
    }
  }

  leaveRoom(location) {
    this.skylink.leaveRoom(location)
      .then(() => {
        const locationState = this.state[location];
        locationState.remotePeers = [];
        this.setState({ [location]: locationState });
        this.removeFeed(location)
      })
      .catch((error) => {
        DemoLoggerHelper.logToConsole('leaveRoom', undefined, undefined, error);
        this.removeFeed(location)
      });
  }

  leaveAllRooms() {
    this.skylink.leaveAllRooms()
      .then(roomNames => roomNames.forEach(location => this.removeFeed(location)))
      .catch(error => DemoLoggerHelper.logToConsole('leaveAllRooms', undefined, null, error))
  }

  startRecording(location) {
    this.skylink.startRecording(location)
      .then(recordingId => DemoLoggerHelper.logToConsole('startRecording', undefined, recordingId))
      .catch(error => DemoLoggerHelper.logToConsole('startRecording', undefined, null, error))
  }

  stopRecording(location) {
    this.skylink.stopRecording(location)
      .then(recordingId => DemoLoggerHelper.logToConsole('stopRecording', undefined, recordingId))
      .catch(error => DemoLoggerHelper.logToConsole('stopRecording', undefined, null, error))
  }

  getRecordings(location) {
    DemoLoggerHelper.logToConsole('getRecordings', undefined, this.skylink.getRecordings(location))
  }

  lockRoom(location) {
    if (this.state[location].roomLocked) {
      DemoLoggerHelper.logToConsole('lockRoom', undefined, null);
      this.skylink.unlockRoom(location);
    } else {
      DemoLoggerHelper.logToConsole('unlockRoom', undefined, null);
      this.skylink.lockRoom(location);
    }
  }

  muteStream(location, evt) {
    const locationState = this.state[location];
    const newStreamMutedState = {
      videoMuted: evt.target.value === 'video' ? !locationState.streamMuted.videoMuted : locationState.streamMuted.videoMuted,
      audioMuted: evt.target.value === 'audio' ? !locationState.streamMuted.audioMuted : locationState.streamMuted.audioMuted,
    };
    locationState.streamMuted = newStreamMutedState;
    this.setState({ location: locationState });
    this.skylink.muteStream(location, newStreamMutedState);
  }

  getStreamSources() {
    this.skylink.getStreamSources()
      .then((result) => {
        DemoLoggerHelper.logToConsole('getStreamSources', undefined, result);
      })
  }

  sendStream(location) {
    const options = { audio: true, video: false };
    this.skylink.sendStream(location, options).then((stream) => {
      DemoLoggerHelper.logToConsole('sendStream', undefined, stream);

      const localFeedElem = document.getElementById(`local-feed_${location}`);
      window.attachMediaStream(localFeedElem, stream);
    }).catch((error) => { DemoLoggerHelper.logToConsole('sendStream', undefined, null, error); });
  }

  getScreenSources() {
    this.skylink.getScreenSources()
      .then((result) => {
        DemoLoggerHelper.logToConsole('getScreamSources', undefined, result);
      })
  }

  shareScreenReplace(location) {
    const streamList = this.skylink.retrieveStreams(location);
    const streamIds = Object.keys(streamList.userMedia);
    this.skylink.shareScreen(location, true).then((screenStream) => {
      DemoLoggerHelper.logToConsole('shareScreenReplace', undefined, screenStream);
      window.attachMediaStream(document.getElementById(`local-feed_screen_${location}`), screenStream);
    });
  }

  removeFeed(location) {
    let localFeedElem = document.getElementById(`local-feed_${location}`)
    if (localFeedElem) {
      localFeedElem.srcObject = null;
    }

    const locationState = Object.assign({}, this.state[location]);

    locationState.inRoom = false;
    this.setState({ [location]: locationState });
  }

  userNameEntered(location, ev) {
    const locationState = Object.assign({}, this.state[location]);
    locationState.username = ev.target.value;
    this.setState({ [location]: locationState });
  }

  onStreamEnded(evt) {
    const detail = evt.detail;
    const { isSelf, isScreensharing, room, peerId } = detail;

    if(isSelf) {
      if (isScreensharing) {
        const localVideoScreenElem = document.getElementById(`local-feed_screen_${room.roomName}`);
        localVideoScreenElem.srcObject = null;
      } else {
        const localVideoElem = document.getElementById(`local-feed_${room.roomName}`);
        localVideoElem.srcObject = null;
        localVideoElem.style.display = 'none';
        const localPlaceholder = document.getElementById(`local-feed_icon_${room.roomName}`);
        localPlaceholder.style.display = 'inline';
      }
    } else {
      const remoteStreams = this.skylink.getPeersStream(room.roomName, false);
      if (remoteStreams) {
        if (isScreensharing) {
          const remoteVideoScreenElem = document.getElementById(`remote-feed_screen_${peerId}_${room.roomName}`);
          if (remoteVideoScreenElem) {
            remoteVideoScreenElem.srcObject = null;
          }
        } else {
          const remoteVideoElem = document.getElementById(`remote-feed_${peerId}_${room.roomName}`);
          if (remoteVideoElem.srcObject.active !== true){
            remoteVideoElem.srcObject = null;
            remoteVideoElem.style.display = 'none';
          }
          const remotePlaceholder = document.getElementById(`remote-feed_icon_${room.roomName}`);
          if (remotePlaceholder && remoteVideoElem.srcObject && remoteVideoElem.srcObject.active !== true){
            remotePlaceholder.style.display = 'inline';
          }
        }
      } else {
          const remoteVideoScreenElem = document.getElementById(`remote-feed_screen_${peerId}_${room.roomName}`);
          if (remoteVideoScreenElem) {
            remoteVideoScreenElem.srcObject = null;
          }
          const remoteVideoElem = document.getElementById(`remote-feed_${peerId}_${room.roomName}`);
          if (remoteVideoElem && remoteVideoElem.srcObject){
            remoteVideoElem.srcObject = null;
            remoteVideoElem.style.display = 'none';
          }
          const remotePlaceholder = document.getElementById(`remote-feed_icon_${room.roomName}`);
          if (remotePlaceholder) {
            remotePlaceholder.style.display = 'inline';
          }
      }
    }
  }

  onSystemAction(evt) {
    if (evt.detail.reason === SkylinkConstants.SYSTEM_ACTION.LOCKED) {
      alert('Room is locked.')
    }
  }

  onRoomLocked(evt) {
    const { isLocked, peerInfo } = evt.detail;
    const roomName = peerInfo.room;
    const locationState = Object.assign({}, this.state[roomName]);

    locationState.roomLocked = isLocked;
    this.setState({ [roomName]: locationState });
  }

  onIncomingScreenStream(evt) {
    const props = evt.detail;
    const { room, peerId, stream, isSelf } = props;

    if (isSelf) {
      const localVideoScreenElem = document.getElementById(`local-feed_screen_${room.roomName}`);
      window.attachMediaStream(localVideoScreenElem, stream);
    } else {
      const remoteVideoScreenElem = document.getElementById(`remote-feed_screen_${peerId}_${room.roomName}`);
      window.attachMediaStream(remoteVideoScreenElem, stream);
    }
  }

  onIncomingStream(evt) {
    const props = evt.detail;
    const { stream, isSelf, peerId, room, isReplace, streamId, isVideo, isAudio } = props;

    if (!isSelf && !isReplace) {
      if ((isAudio && isVideo) || (isVideo && !isAudio)) {
        const remoteVideoElem = document.getElementById(`remote-feed_${peerId}_${room.roomName}`);
        const remotePlaceholder = document.getElementById(`remote-feed_icon_${room.roomName}`);
        window.attachMediaStream(remoteVideoElem, stream);
        remoteVideoElem.style.display = 'inline';
        remotePlaceholder.style.display = 'none';
      } else {
        const rremoteAudioElem = document.getElementById(`remote-feed_audio_${peerId}_${room.roomName}`);
        window.attachMediaStream(rremoteAudioElem, stream);
      }
    }
  }

  messageEntered(location, ev) {
    const locationState = Object.assign({}, this.state[location]);
    locationState.message = ev.target.value;
    this.setState({ [location]: locationState });
  }

  onPeerJoined(evt) {
    const eventDetail = evt.detail;
    const { isSelf, peerId, room } = eventDetail;
    const location = Object.assign([], this.state[room.roomName]);

    if (!isSelf) {
      location.remotePeers.push(peerId);
    } else {
      location.peerId = peerId;
    }

    this.setState({ [room.roomName]: location });
  }

  onIncomingMessage(evt) {
    const message = evt.detail;
    const { room } = message;
    const locationState = Object.assign({}, this.state[room.roomName]);
    locationState.messages.push(message);
    this.setState({ [room.roomName]: locationState });
  }

  getUserMedia(location) {
    this.skylink.getUserMedia(location, {
      audio: false,
      video: true,
    })
      .then((stream) => {
        DemoLoggerHelper.logToConsole('getUserMedia', undefined, stream)
      }).catch((error) => {
        console.error(error)
    });
  }

  onPeerLeft(evt) {
    const props = evt.detail;
    const { isSelf, room, peerId } = props;
    const location = Object.assign([], this.state[room.roomName]);

    if (!isSelf){
      const peerIndex = location.remotePeers.indexOf(peerId);
      if (peerIndex !== -1) {
        location.remotePeers.splice(peerIndex, 1);
        this.setState({ [room.roomName]: location });
      }
    } else {
      this.removeFeed(room.roomName);
    }
  }

  onServerPeerLeft(evt) {
    // const { room } = evt.detail;
    // this.removeFeed(room.roomName);
    // const location = Object.assign([], this.state[room.roomName]);
    // const peerIndex = location.remotePeers.indexOf(peerId);

  }

  onMessageChannelSelected(location, evt, checkbox) {
    const locationState = Object.assign({}, this.state[location]);
    const channel = checkbox.value;
    locationState.messageChannel = channel;
    this.setState({ [location]: locationState });
  }

  onPeerSelected(location, evt, selector) {
    const locationState = Object.assign({}, this.state[location]);
    const selectedPeers = selector.value;
    locationState.selectedPeers = selectedPeers;
    this.setState({ [location]: locationState });
  }

  toggleAudioVideo(location, evt, checkbox) {
    const locationState = Object.assign({}, this.state[location]);
    const streamMuted = {
      audioMuted: checkbox.value === 'audio' ? !checkbox.checked : locationState.streamMuted.audioMuted,
      videoMuted: checkbox.value === 'video' ? !checkbox.checked : locationState.streamMuted.videoMuted,
    };
    locationState.streamMuted = streamMuted;
    this.setState({[location]: locationState });
  }

  render() {
    const { hongkong, singapore, newyork } = this.state;
    const segmentArray = [
      {
        stateKey: 'hongkong',
        buttonText: 'Join Hong Kong Room',
        stateObject: hongkong,
      },
      {
        stateKey: 'singapore',
        buttonText: 'Join Singapore Room',
        stateObject: singapore,
      },
      {
        stateKey: 'newyork',
        buttonText: 'Join New York Room',
        stateObject: newyork,
      }
    ];

    const panels = segmentArray.map((segment, index) => {
      return {
        key: `panel-${index}`,
        title: `${segment.stateObject.title}`,
        content: {
          content: (
            <RoomSegment
          key={index}
          sendMessage={this.sendMessage}
        userNameEntered={this.userNameEntered}
          updateUsername={this.updateUsername}
      messageEntered={this.messageEntered}
          toggleAudioVideo={this.toggleAudioVideo}
      joinRoom={this.joinRoom}
      location={segment.stateObject}
      buttonText={segment.buttonText}
      stateKey={segment.stateKey}
      getConnectionStatus={this.getConnectionStatus}
      refreshDataChannel={this.refreshDataChannel}
          refreshConnections={this.refreshConnections}
          shareScreen={this.shareScreen}
          shareScreenReplace={this.shareScreenReplace}
          getPeerCustomSettings={this.getPeerCustomSettings}
          getUserMedia={this.getUserMedia}
          leaveRoom={this.leaveRoom}
          stopStream={this.stopStream}
          stopScreen={this.stopScreen}
          RoomSegment={this.RoomSegment}
          onPeerSelected={this.onPeerSelected}
          onMessageChannelSelected={this.onMessageChannelSelected}
          startRecording={this.startRecording}
          stopRecording={this.stopRecording}
          leaveAllRooms={this.leaveAllRooms}
          lockRoom={this.lockRoom}
          muteStream={this.muteStream}
          sendStream={this.sendStream}
          getPeersInRoom={this.getPeersInRoom}
          getPeerInfo={this.getPeerInfo}
          getUserData={this.getUserData}
          setUserData={this.setUserData}
          getPeersStream={this.getPeersStream}
          getPeersDataChannels={this.getPeersDataChannels}
          getPeersScreenshare={this.getPeersScreenshare}
          getRecordings={this.getRecordings}
          getStreamSources={this.getStreamSources}
          getScreenSources={this.getScreenSources}
          getPeers={this.getPeers}
      />
    )
    }
    }
    });
    return (
      <Container fluid className='skylink-demo-body' style={{ padding: '10px' }}>
        <Container fluid style={{ padding: '0' }}>
          <span style={{ margin: '5px'}}>Registered Demo Events (Logged on console) : </span><br/>
          <Button disabled={this.state.registeredEvts.allEvts} color={this.state.registeredEvts.allEvts ? 'green' : 'red'} onClick={this.toggleEvt.bind(this)} style={{ margin: '5px'}} value={'allEvts'}>Register All Evts</Button>
          <Button color={this.state.registeredEvts.candidate ? 'green' : 'red'} onClick={this.toggleEvt.bind(this)} style={{ margin: '5px'}} value={'candidate'}>Candidate Evts</Button>
          <Button color={this.state.registeredEvts.dataTransfer ? 'green' : 'red'} onClick={this.toggleEvt.bind(this)} style={{ margin: '5px'}} value={'dataTransfer'}>Data Transfer Evts</Button>
          <Button color={this.state.registeredEvts.dataChannel ? 'green' : 'red'} onClick={this.toggleEvt.bind(this)} style={{ margin: '5px'}} value={'dataChannel'}>Data Channel Evts</Button>
          <Button color={this.state.registeredEvts.media ? 'green' : 'red'} onClick={this.toggleEvt.bind(this)} style={{ margin: '5px'}} value={'media'}>Media Evts</Button>
          <Button color={this.state.registeredEvts.peer ? 'green' : 'red'} onClick={this.toggleEvt.bind(this)} style={{ margin: '5px'}} value={'peer'}>Peer Evts</Button>
          <Button color={this.state.registeredEvts.peerHandshake ? 'green' : 'red'} onClick={this.toggleEvt.bind(this)} style={{ margin: '5px'}} value={'peerHandshake'}>Peer Handshake Evts</Button>
          <Button color={this.state.registeredEvts.room ? 'green' : 'red'} onClick={this.toggleEvt.bind(this)} style={{ margin: '5px'}} value={'room'}>Room Evts</Button>
          <Button color={this.state.registeredEvts.socket ? 'green' : 'red'} onClick={this.toggleEvt.bind(this)} style={{ margin: '5px'}} value={'socket'}>Socket Evts</Button>
          <Button color={this.state.registeredEvts.stream ? 'green' : 'red'} onClick={this.toggleEvt.bind(this)} style={{ margin: '5px'}} value={'stream'}>Stream Evts</Button>
        </Container>
        <Button primary onClick={this.prefetchGetUserMedia.bind(this)} style={{ margin: '5px'}}>Pre-Fetch getUserMedia stream</Button>
        <Accordion styled defaultActiveIndex={[0]} panels={panels} exclusive={false} fluid />
    </Container>
  )
  }
}

const HorizontalLine = ({ color }) => (
  <div
    style={{
      borderBottomWidth: '0.5px',
      borderBottomStyle: 'solid',
      borderBottomColor: color,
      padding: '5px 5px 10px',
      opacity: 0.3,
    }}
  ></div>
);

const UserFormFieldCmp = (props) => {
  const { location, stateKey, buttonText, userNameEntered, joinRoom, toggleAudioVideo } = props;
  return <Grid.Row>
  <Grid.Column width={3}>
    <Form>
    <Form.Field>
    <label>Username</label>
    <input value={location.username} onChange={userNameEntered.bind(this, stateKey)} placeholder='@user' />
    </Form.Field>
    <Button loading={location.showJoinRoomLoader} primary disabled={location.username === ''} onClick={joinRoom.bind(this, stateKey)}>{buttonText}</Button>
      <div style={{ padding: '5px'}}>
        <label style={{ paddingRight: '5px'}}>Audio</label>
        <Checkbox style={{ verticalAlign: 'middle'}} value={'audio'} checked={!location.streamMuted.audioMuted} onClick={toggleAudioVideo.bind(this, stateKey)}/>
        <br/>
        <label style={{ paddingRight: '5px'}}>Video</label>
        <Checkbox style={{ verticalAlign: 'middle'}} value={'video'} checked={!location.streamMuted.videoMuted} onClick={toggleAudioVideo.bind(this, stateKey)}/>
      </div>
  </Form>
  </Grid.Column>
  </Grid.Row>
}

const LocalFeedColumn = (props) => {
  const { stateKey, location } = props;
  return <Grid.Column width={6}>
  <Header as='div' attached='top'>
    <Header.Content style={{ padding: '0px' }}>{location.username} ({location.peerId})</Header.Content>
    <Messaging {...props} />
  </Header>
  <Segment attached>
    <video autoPlay muted style={{ width: '100%' }} playsInline id={`local-feed_${stateKey}`} />
    <img src={icon} style={{ width: '100%', display: 'none', padding: '1rem 5rem'}} id={`local-feed_icon_${stateKey}`}/>
    <video autoPlay muted style={{ width: '100%' }} playsInline id={`local-feed_screen_${stateKey}`} />
    <PublicMethodsForRoom {...props} />
  </Segment>
  </Grid.Column>
}

const RemoteFeedColumn = (props) => {
  const { stateKey, location: { remotePeers } } = props;
  return <Grid.Column width={10}>
  <Header as='div' attached='top'>
    <Header.Content style={{ padding: '0px' }}>Remote Peers</Header.Content>
  </Header>
  <Segment attached>
  <Grid columns={4} padded>
  {
    remotePeers.map((peerId) => {
    return <Grid.Column key={peerId}>
      <label id={`remote-feed_peerId_${peerId}_${stateKey}`}>{peerId}</label>
      <video autoPlay playsInline id={`remote-feed_${peerId}_${stateKey}`} style={{ width: '100%' }} />
      <img alt="The feed of remote peer" src={icon} style={{ width: '100%', display: 'none', padding: '0.5rem 1rem'}} id={`remote-feed_icon_${stateKey}`} />
      <video autoPlay playsInline id={`remote-feed_screen_${peerId}_${stateKey}`} style={{ width: '50%' }} />
    <audio autoPlay playsInline id={`remote-feed_audio_${peerId}_${stateKey}`} style={{ width: '50%' }} />
    </Grid.Column>
  })
}
</Grid>
  </Segment>
  </Grid.Column>
}

const Messaging = (props) => {
  const { stateKey, location, sendMessage, messageEntered, onPeerSelected, onMessageChannelSelected } = props;
  const peerSelectorOptions = location.remotePeers.map((remotePeer) => {
    return {
      text: remotePeer,
      value: remotePeer
    }
  });
  return <Modal trigger={<Button primary size='mini' floated='right' style={{ marginTop: '-5px' }}>Messaging</Button>}>
  <Modal.Header>Messaging</Modal.Header>
  <Modal.Content>
  <Modal.Description>
  {
    location.messages.map((message, index) => {
    const { isSelf, peerInfo, message :{content, isPrivate, isDataChannel }} = message;
    let toPrint = isSelf ? 'You:' : `${peerInfo.userData.username}:`;
    const channelUsed = isDataChannel ? 'P2P' : 'SIG';
    toPrint += ` [${isPrivate ? `Private | ${channelUsed} |` : `Public | ${channelUsed} |`}]`;
    toPrint += ` ${content}`;
    return <p key={index}>
      {toPrint}
      </p>
  })
}
<Form>
  <Form.Field>
    <Grid>
      <Grid.Column width={12}>
        <label>Select Peer</label>
        <Dropdown placeholder='Select Peer' multiple fluid selection options={peerSelectorOptions} onChange={onPeerSelected.bind(this, stateKey)} />
      </Grid.Column>
      <Grid.Column width={4}>
        <Form>
          <Form.Field>
            Choose Channel <b>{this.state}</b>
          </Form.Field>
          <Form.Field>
            <Checkbox
              radio
              label='P2P Message'
              name='channelRdoGroup'
              value='P2P'
              checked={location.messageChannel === 'P2P'}
              onChange={onMessageChannelSelected.bind(this, stateKey)}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              radio
              label='Signaling Message'
              name='channelRdoGroup'
              value='SIG'
              checked={location.messageChannel === 'SIG'}
              onChange={onMessageChannelSelected.bind(this, stateKey)}
            />
          </Form.Field>
        </Form>
      </Grid.Column>
    </Grid>
  <label>Enter Message</label>
  <input onChange={messageEntered.bind(this, stateKey)} placeholder='@message' />
    </Form.Field>
    <Button disabled={location.message === ''} primary onClick={sendMessage.bind(this, stateKey)}>Send Message</Button>
  </Form>
  </Modal.Description>
  </Modal.Content>
  </Modal>
}

  const PublicMethodsForRoom = (props) => {
    const {
      stateKey,
      location,
      updateUsername,
      getConnectionStatus,
      refreshDataChannel,
      refreshConnections,
      shareScreen,
      getPeerCustomSettings,
      getUserMedia,
      stopStream,
      stopScreen,
      leaveRoom,
      lockRoom,
      leaveAllRooms,
      shareScreenReplace,
      muteStream,
      stopRecording,
      startRecording,
      sendStream,
      getPeersInRoom,
      getPeerInfo ,
      getUserData,
      setUserData,
      getPeersStream,
      getPeersDataChannels,
      getPeersScreenshare,
      getRecordings,
      getStreamSources,
      getScreenSources,
      getPeers,
    } = props;
    return <Grid.Column>
      <Form>
        <Form.Field>
          <input value={location.newUsername} onChange={updateUsername.bind(this, stateKey)} placeholder='@user' />
          <Button username={stateKey.newUsername} compact className='public-method-btn' primary onClick={setUserData.bind(this, stateKey)} >Set User Data</Button>
          <Button compact className='public-method-btn' primary onClick={getUserData.bind(this, stateKey)}>Get User Data</Button>
        </Form.Field>
      </Form>
      <HorizontalLine color='light-grey'></HorizontalLine>
    <Button compact color='red' className='public-method-btn' onClick={leaveRoom.bind(this, stateKey)}>Leave Room</Button>
    <Button compact color='red' className='public-method-btn' onClick={leaveAllRooms.bind(this, stateKey)}>Leave All Rooms</Button>
    <Button compact color='yellow' className='public-method-btn' onClick={lockRoom.bind(this, stateKey)}>{location.roomLocked ? 'Unlock Room': 'Lock Room'}</Button>
      <HorizontalLine color='light-grey'></HorizontalLine>
    <Button compact color={location.streamMuted.audioMuted ? 'green' : 'red'} className='public-method-btn' onClick={muteStream.bind(this, stateKey)} value={'audio'}>{location.streamMuted.audioMuted ? 'Unmute Audio' : 'Mute Audio'}</Button>
    <Button compact color={location.streamMuted.videoMuted ? 'green' : 'red'} className='public-method-btn' onClick={muteStream.bind(this, stateKey)} value={'video'}>{location.streamMuted.videoMuted ? 'Unmute Video' : 'Mute Video'}</Button>
      <HorizontalLine color='light-grey'></HorizontalLine>
    <Button compact className='public-method-btn' primary onClick={sendStream.bind(this, stateKey)}>Send Stream</Button>
    <Button compact color='red' className='public-method-btn' onClick={stopStream.bind(this, stateKey)}>Stop Stream</Button>
      <HorizontalLine color='light-grey'></HorizontalLine>
    <Button compact className='public-method-btn' primary onClick={shareScreen.bind(this, stateKey)}>Share Screen</Button>
    <Button compact className='public-method-btn' primary onClick={shareScreenReplace.bind(this, stateKey)}>Share Screen (Replace)</Button>
    <Button compact color='red' className='public-method-btn' onClick={stopScreen.bind(this, stateKey)}>Stop Screen</Button>
      <HorizontalLine color='light-grey'></HorizontalLine>
    <Button compact className='public-method-btn' primary onClick={startRecording.bind(this, stateKey)}>Start Recording</Button>
    <Button compact color='red' className='public-method-btn' onClick={stopRecording.bind(this, stateKey)}>Stop Recording</Button>
    <Button compact className='public-method-btn' primary onClick={getRecordings.bind(this, stateKey)}>Get Recordings</Button>
      <HorizontalLine color='light-grey'></HorizontalLine>
    <Button compact className='public-method-btn' primary onClick={refreshDataChannel.bind(this, stateKey)}>Refresh Data Channel</Button>
    <Button compact className='public-method-btn' primary onClick={refreshConnections.bind(this, stateKey)}>Refresh Connections</Button>
    <Button compact className='public-method-btn' primary onClick={getConnectionStatus.bind(this, stateKey)}>Get Connection Status</Button>
    <Button compact className='public-method-btn' primary onClick={getPeerCustomSettings.bind(this, stateKey)}>Get Peer Custom Settings</Button>
    <Button compact className='public-method-btn' primary onClick={getUserMedia.bind(this, stateKey)}>Get User Media</Button>
    <Button compact className='public-method-btn' primary onClick={getPeersInRoom.bind(this, stateKey)}>Get Peers In Room</Button>
    <Button compact className='public-method-btn' primary onClick={getPeerInfo.bind(this, stateKey)}>Get Peer Info</Button>
    <Button compact className='public-method-btn' primary onClick={getPeersStream.bind(this, stateKey)}>Get Peers Stream</Button>
    <Button compact className='public-method-btn' primary onClick={getPeersDataChannels.bind(this, stateKey)}>Get Peers Data Channels</Button>
    <Button compact className='public-method-btn' primary onClick={getPeersScreenshare.bind(this, stateKey)}>Get Peers Screenshare</Button>
    <Button compact className='public-method-btn' primary onClick={getStreamSources.bind(this, stateKey)}>Get Stream Sources</Button>
    <Button compact className='public-method-btn' primary onClick={getScreenSources.bind(this, stateKey)}>Get Screen Sources</Button>
    <Button compact className='public-method-btn' primary onClick={getPeers.bind(this, stateKey)}>Get Peers (Privilege Key)</Button>
    </Grid.Column>
  }

  const RoomSegment = (props) => {
    const {
      location,
      stateKey,
      buttonText,
      joinRoom,
      toggleAudioVideo,
      updateUsername,
      userNameEntered,
      sendMessage,
      messageEntered,
      getConnectionStatus,
      refreshDataChannel,
      refreshConnections,
      shareScreen,
      getPeerCustomSettings,
      getUserMedia,
      stopStream,
      stopScreen,
      leaveRoom,
      onPeerSelected,
      onMessageChannelSelected,
      leaveAllRooms,
      lockRoom,
      shareScreenReplace,
      muteStream,
      startRecording,
      stopRecording,
      sendStream,
      getPeersInRoom,
      getPeerInfo ,
      getUserData,
      setUserData,
      getPeersStream,
      getPeersDataChannels,
      getPeersScreenshare,
      getRecordings,
      getStreamSources,
      getScreenSources,
      getPeers,
    } = props;
    return (
      <Grid celled='internally'>
      {
    !location.inRoom ? <UserFormFieldCmp
    location={location}
    stateKey={stateKey}
    buttonText={buttonText}
    joinRoom={joinRoom}
    toggleAudioVideo={toggleAudioVideo}
    userNameEntered={userNameEntered}
    /> : <Grid.Row>
    <LocalFeedColumn
    stateKey={stateKey}
    location={location}
    sendMessage={sendMessage}
    messageEntered={messageEntered}
    updateUsername={updateUsername}
    getConnectionStatus={getConnectionStatus}
    refreshDataChannel={refreshDataChannel}
    refreshConnections={refreshConnections}
    shareScreen={shareScreen}
    shareScreenReplace={shareScreenReplace}
    getPeerCustomSettings={getPeerCustomSettings}
    getUserMedia={getUserMedia}
    stopStream={stopStream}
    stopScreen={stopScreen}
    leaveRoom={leaveRoom}
    onPeerSelected={onPeerSelected}
    onMessageChannelSelected={onMessageChannelSelected}
    startRecording={startRecording}
    stopRecording={stopRecording}
    leaveAllRooms={leaveAllRooms}
    lockRoom={lockRoom}
    muteStream={muteStream}
    sendStream={sendStream}
    getPeersInRoom={getPeersInRoom}
    getPeerInfo={getPeerInfo}
    getUserData={getUserData}
    setUserData={setUserData}
    getPeersStream={getPeersStream}
    getPeersDataChannels={getPeersDataChannels}
    getPeersScreenshare={getPeersScreenshare}
    getRecordings={getRecordings}
    getStreamSources={getStreamSources}
    getScreenSources={getScreenSources}
    getPeers={getPeers}
    />
    <RemoteFeedColumn stateKey={stateKey} location={location} />
  </Grid.Row>
  }
  </Grid>
  )
  };

  export default SkylinkDemo;
