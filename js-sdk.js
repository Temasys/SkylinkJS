(function(exports) {

  //--------------------------------------
	function Temasys(key, user, room) {
		if (!(this instanceof Temasys)) return new Temasys(key, user, room);
		// Constructor work...
		this._key  = key;
		this._socket = null;
    this._user = user;
		this._room = room;
    this._peerConnections = [];
  };

	exports.Temasys = Temasys;

  /* PUBLIC API */

  //------------------------------------------------------------
	// EVENT
  //
  Temasys.prototype.on = function(eventName, callback) {
		if ('function' === typeof callback) {
			this._events[eventName] = this._events[eventName] || [];
			this._events[eventName].push(callback);
		}
	};

  //------------------------------------------------------------
	// EVENT
  //
	Temasys.prototype.off = function(eventName, callback) {
		if(callback === undefined) {
			this._events[eventName] = [];
			return;
		}
		var arr = this._events[eventName],
			l = arr.length,
			e = false;
		for(var i = 0; i < l; i++) {
			if(arr[i] === callback) {
				arr.splice(i, 1);
				break;
			}
		}
	};

  //------------------------------------------------------------
	// EVENT
  //
	Temasys.prototype.trigger = function(eventName) {
		var args = Array.prototype.slice.call(arguments)
      , arr  = this._events[eventName];
		args.shift();
		for (e in arr) {
			if(arr[e](args) === false) {
				break;
			}
		}
	};

  //--------------------------------------
  Temasys.prototype.updateUser = function( user ){
    this._user = user;
  };

	/* Syntactically private variables and utility functions */

  //--------------------------------------
	Temasys.prototype._events = {
    //-- per room, signaling channel events
    "channelOpen":    [],
    "channelClose":   [],
    "channelMessage": [],
    "channelError":   [],

    //-- per peer, handshake event 
    "handshakeProgress": [], // enter, welcome, offer, answer

    //-- per peer, Connection event
    "candidateGenerationState": [],
    "peerConnectionState":      [],
    "iceConnectionState":       [],

    //-- per peer, local media events
		"mediaAccessError": [],

    //-- room level events
		"chatMessage":     [], // chatObj
		"peerJoined":      [], // peerID, room
		"peerLeft":        [], // peerID, room
		"presenceChanged": [], // [peer], room
		"roomLock":        [], // locked, room

		//-- per peer, peer connection events
    "addPeerStream":    [], // stream, peerID, room
		"removePeerStream": [], // stream, peerID, room
		"peerVideoMute":    [], // videoMute, peerID, room
		"peerAudioMute":    [], // audioMute, peerID, room

    //-- per user events
    "addContact":    [],
    "removeContact": [],
    "invitePeer":    []
	};

  //---------------------------------------------------------
  Temasys.prototype._processSigMsg = function( message ){
    var msg = JSON.parse( message );
    if( msg.type === 'group' ){
      console.log( 'API - Bundle of ' + msg.lists.length + ' messages.' );
      for( var i=0; i<msg.lists.length; i++)
        this._processSingleMsg( msg.lists[i] );
    } else {
      this._processSingleMsg( msg );
    } 
  };

  //---------------------------------------------------------
  Temasys.prototype._processSingleMsg = function( msg ){
    // note alex: I want the equivalent of the network blinking led in the GUI
    // to show there is activity even when nothing happens visibly.
    this.trigger("channelMessage");

    console.log( 'API - [' + msg.mid + '] Incoming message : ' + msg.type );

    if(  msg.mid  === this._user.id
      && msg.type !=  'redirect'
      && msg.type !=  'inRoom'
      ){
      console.log( 'API - [' + this._user.id + '] Ignoring message: ' + msg.type + '.' );
      return;
    }

    switch(msg.type){
      //--- BASIC API Msgs ----
      case 'inRoom':
        this._inRoomHandler(msg);
        break;
      case 'offer':
        this._offerHandler(msg);
        break;
      case 'answer':
        this._answerHandler(msg);
        break;
      case'candidate':
        this._candidateHandler(msg);
        break;
      case 'welcome':
        this._welcomeHandler(msg);
        break;
      case 'enter':
        this._enterHandler(msg);
        break;
      case 'bye':
        this._byeHandler(msg);
        break;
      case 'error':
        location.href = '/?error=' + msg.kind;
        break;
      //--- ADVANCED API Msgs ----
      case 'chat':
        // this._chatHandler(msg);
        break;
      case 'presence':
        // this._presenceHandler(msg);
        break;
      case 'invite':
        // this._inviteHandler();
        break;
      case 'redirect':
        // this._redirectHandler(msg);
        break;
      case 'video_mute_event':
        // this._handleVideoMuteEventMessage( msg.mid, msg.guest );
        break;
      case 'roomLockEvent':
        // this._roomLockEventHandler(msg);
        break;
      case'update_guest_name':
        // this._update_guest_nameHandler(msg);
        break;
      default:
        console.log( 'API - [' + msg.mid + '] Unsupported message type received: ' + msg.type);
        break;
    }

  };

  //---------------------------------------------------------
  Temasys.prototype._byeHandler = function( msg ){
    var targetMid = msg.mid;
    console.log( 'API- [' + targetMid + '] received \'bye\'.' );
    if( this._peerConnections[targetMid] )
      this._peerConnections[targetMid].close();
    this._peerConnections[targetMid] = null;
  };

  //---------------------------------------------------------
  Temasys.prototype._inRoomHandler = function( msg ){
    console.log( "API - [" + this._user.id + "] We're in the room!" 
      + " Chat functionalities are now available."
    )

    console.log( "API - [" + this._user.id 
      + "] We've been given the following PeerConnection Constraint: "
    ); 
    console.dir( msg.pc_config );
    this._room.pcHelper.pcConfig = msg.pc_config;

    // NOTE ALEX: should we wait for local streams?
    // or just go with what we have (if no stream, then one way?)
    console.log( 'API - [' + this._user.id + '] Sending enter.' );
    this.trigger('handshakeProgress', 'enter');
    this._sendMessage({
      type: 'enter',
      mid:  this._user.id,
      rid:  this._room.id,
      nick: this._user.displayName
    }); 
  };

  //---------------------------------------------------------
  Temasys.prototype._enterHandler = function( msg ){
    // NOTE ALEX: send a handshake event here
     var targetMid = msg.mid;
     this.trigger('handshakeProgress', 'enter', targetMid );
    // need to check entered user is new or not.
    if( !this._peerConnections[targetMid] ) {
      console.log( 'API - [' + targetMid + '] Sending welcome.' );
      this.trigger('handshakeProgress', 'welcome', targetMid);
      this._sendMessage({
        type    : 'welcome',
        mid     : this._user.id,
        target  : targetMid,
        rid     : this._room.id,
        nick    : this._user.displayName,
      });
    }
  };

  //---------------------------------------------------------
  Temasys.prototype._welcomeHandler = function( msg ){
    var targetMid = msg.mid;
    this.trigger('handshakeProgress', 'welcome', targetMid );
    if( !this._peerConnections[targetMid] ) {
      this._openPeer( targetMid, true );
    }
  };

  //---------------------------------------------------------
  Temasys.prototype._offerHandler = function( msg ){
    var targetMid = msg.mid;
    this.trigger('handshakeProgress', 'offer', targetMid );
    offer = new RTCSessionDescription(msg);
    console.log( 'API - [' + targetMid + '] Received offer:' )
    console.dir( offer );
    var pc = this._peerConnections[ targetMid ];
    if( !pc ) {
      this._openPeer( targetMid, false );
      pc = this._peerConnections[ targetMid ];
    } else {
      // we already had a PC, let's reuse it
    }
    pc.setRemoteDescription( offer );
    this._doAnswer( targetMid );
  };

  //---------------------------------------------------------
  Temasys.prototype._doAnswer = function( targetMid ){ 
    console.log( 'API - [' + targetMid + '] Creating answer.' );
    var pc = this._peerConnections[ targetMid ];
    var self = this;
    if( pc ) {
      pc.createAnswer(
        function( answer ) {
          console.log( 'API - [' + targetMid + '] Created  answer.' );
          console.dir( answer );
          self._setLocalAndSendMessage( targetMid, answer );
        },
        null, // onOfferOrAnswerError,
        self._room.pcHelper.sdpConstraints
        );
    } else { /* Houston ..*/  }
  };

  //---------------------------------------------------------
  Temasys.prototype._openPeer = function( targetMid, toOffer ){
    console.log( 'API - [' + targetMid + '] Creating PeerConnection.' );
    this._peerConnections[targetMid] = this._createPeerConnection(targetMid);

    // NOTE ALEX: here we could do something smarter
    // a mediastream is mainly a container, most of the info
    // are attached to the tracks. We should iterates over track and print
    console.log( 'API - [' + targetMid + '] Adding local stream.' );

    if( this._user.streams.length > 0 ){
      for( i in this._user.streams )
        this._peerConnections[targetMid].addStream( this._user.streams[i] );
    } else {
      console.log( 'API - WARNING - No stream to send. You will be only receiving.' );
    }
    // I'm the callee I need to make an offer 
    if( toOffer )
      this._doCall(targetMid); 
  };

  //---------------------------------------------------------
  Temasys.prototype._onRemoteStreamAdded = function( targetMid, event ){
    console.log( 'API - [' + targetMid + '] Remote Stream added.' );
    this.trigger( "addPeerStream", targetMid, event.stream );
  };

  //---------------------------------------------------------
  Temasys.prototype._doCall = function( targetMid ){
    var pc = this._peerConnections[ targetMid ];
    // NOTE ALEX: handle the pc = 0 case, just to be sure
 
    // temporary measure to remove Moz* constraints in Chrome
    var oc = this._room.pcHelper.offerConstraints;
    if( webrtcDetectedBrowser === "chrome" )
      for( prop in oc.mandatory )
        if( prop.indexOf("Moz") != -1 )
          delete oc.mandatory[prop];
 
    var constraints = oc;
    var sc = this._room.pcHelper.sdpConstraints;
    for( var name in sc.mandatory )
      constraints.mandatory[name] = sc.mandatory[name];
    constraints.optional.concat(sc.optional);
    console.log( 'API - [' + targetMid + '] Creating offer.')
    var self = this;
    pc.createOffer(
      function(offer){ self._setLocalAndSendMessage( targetMid, offer ); },
      null, // onOfferOrAnswerError,
      constraints
    );
  };

  //---------------------------------------------------------
  Temasys.prototype._setLocalAndSendMessage = function( targetMid, sessionDescription ){
    console.log( 'API - [' + targetMid + '] Created ' + sessionDescription.type + '.' );
    console.dir( sessionDescription );
    var pc = this._peerConnections[ targetMid ];
    // NOTE ALEX: handle the pc = 0 case, just to be sure

    // NOTE ALEX: opus should not be used for mobile
    // Set Opus as the preferred codec in SDP if Opus is present.
    // sessionDescription.sdp = preferOpus(sessionDescription.sdp);

    // limit bandwidth
    // sessionDescription.sdp = limitBandwidth(sessionDescription.sdp);
  
    console.log( 'API - [' + targetMid + '] Setting local Description ('
      + sessionDescription.type + ' ).' );
    
    var self = this; 
    pc.setLocalDescription(
      sessionDescription,
      function() {
        console.log( 'API - [' + targetMid + '] Set. Sending ' + sessionDescription.type + '.');
        self.trigger('handshakeProgress', sessionDescription.type, targetMid);
        self._sendMessage({
          type:   sessionDescription.type,
          sdp:    sessionDescription.sdp,
          mid:    self._user.id,
          target: targetMid,
          rid:    self._room.id 
        });
      },
      function(){
        console.log( 'API - ['
          + targetMid + '] There was a problem setting the Local Description.');
      }
    );
  };

  //---------------------------------------------------------
  Temasys.prototype._createPeerConnection = function( targetMid ){
    try {
      var pc =
        new RTCPeerConnection( this._room.pcHelper.pcConfig, this._room.pcHelper.pcConstraints);
      console.log(
        'API - [' + targetMid + '] Created PeerConnection.' );
      console.log(
        'API- [' + targetMid + '] PC config: '
          + JSON.stringify( this._room.pcHelper.pcConfig )      );
      console.log(
        'API- [' + targetMid + '] PC constraints: '
          + JSON.stringify( this._room.pcHelper.pcConstraints ) );
    } catch (e) {
      console.log( 'API - [' + targetMid + '] Failed to create PeerConnection: ' + e.message );
      return;
    } 
   
    // callbacks    
    // standard not implemented: onnegotiationneeded, 
    var self = this;
    pc.onaddstream    = 
      function( event ) { self._onRemoteStreamAdded( targetMid, event ); }
    pc.onicecandidate = 
      function( event ) { self._onIceCandidate( targetMid, event ); }
    pc.oniceconnectionstatechange = 
      function() {
        console.log( 'API - [' + targetMid + '] ICE connection state changed -> '
          + pc.iceConnectionState
        );
        self.trigger('iceConnectionState', pc.iceConnectionState, targetMid );
      };
    // pc.onremovestream = onRemoteStreamRemoved;
    pc.onsignalingstatechange = 
      function() {
        console.log( 'API - [' + targetMid + '] PC  connection state changed -> '
          + pc.signalingState
        );
        self.trigger('peerConnectionState', pc.signalingState, targetMid );
      }; 
    pc.onicegatheringstatechange =
      function() {
        console.log( 'API - [' + targetMid + '] ICE gathering  state changed -> '
          + pc.iceGatheringState
        );
        self.trigger('candidateGenerationState', pc.iceGatheringState, targetMid );
      };
  
    return pc;
  };

  //---------------------------------------------------------
  Temasys.prototype._onIceCandidate = function( targetMid, event ){
    if( event.candidate ) {
      var msgCan = event.candidate.candidate.split( " " );
      var candidateType = msgCan[7];
      console.log( 'API - [' + targetMid + '] Created and sending '
        + candidateType + ' candidate.');
      this._sendMessage({
         type:     'candidate',
         label:     event.candidate.sdpMLineIndex,
         id:        event.candidate.sdpMid,
         candidate: event.candidate.candidate,
         mid:       this._user.id,
         target:    targetMid,
         rid:      this._room.id 
        });
    } else {
      console.log( 'API - [' + targetMid + '] End of gathering.' );
    }
  };

  //---------------------------------------------------------
  Temasys.prototype._candidateHandler = function( msg ){
    var targetMid = msg.mid;
    var pc = this._peerConnections[targetMid];
    if( pc ) {
      if( pc.iceConnectionState == 'connected' ){
        console.log( 'API - [' + targetMid + '] Received but not adding Candidate ' +
          'as we are already connected to this peer.');
        return;
      } 
      var msgCan = msg.candidate.split( " " );
      var canType = msgCan[7];
      console.log( 'API - [' + targetMid + '] Received '+ canType +' Candidate.' );
      // if( canType != 'relay' && canType != 'srflx' ) {
      // trace( 'Skipping non relay and non srflx candidates.' );
      var index = msg.label;
      candidate = new RTCIceCandidate( {sdpMLineIndex:index, candidate:msg.candidate} );
      pc.addIceCandidate( candidate );//,
        // NOTE ALEX: not implemented in chrome yet, need to wait
        //  function() { trace('ICE  -  addIceCandidate Succesfull. ' ); },
        //  function(error) { trace('ICE  - AddIceCandidate Failed: ' + error ); }
      //);
      console.log( 'API - [' + targetMid + '] Added Candidate.' );
    } else {
      console.log( 'API - [' + targetMid + '] Received but not adding Candidate ' +
        'as PeerConnection not present.' );
      // NOTE ALEX: if the offer was slow, this can happen
      //            we might keep a buffer of candidates to replay after receiving
      //            an offer. 
    }
  };

  //---------------------------------------------------------
  Temasys.prototype._answerHandler = function( msg ){
    var targetMid = msg.mid;
    this.trigger('handshakeProgress', 'answer', targetMid);
    answer = new RTCSessionDescription( msg );
    console.log( 'API - [' + targetMid + '] Received answer:' )
    console.dir( answer );
    var pc = this._peerConnections[targetMid]
    pc.setRemoteDescription( answer );
    pc.remotePeerReady = true;
  };

  //---------------------------------------------------------
  // send a message to the signaling server
	Temasys.prototype._sendMessage = function (message) {
    var msgString = JSON.stringify( message );
    console.log( 'API - [' + this._user.id + '] Outgoing message : ' + message.type );
    // NOTE ALEX: should check that socket is not null
    socket.send( msgString );
    // NOTE ALEX: we should capture some errors here instead of assuming it s gonna be alright
	};

	Temasys.prototype.openChannel = function () {
    // NOTE ALEX: check input first.
    // input is properly set, proceed
    console.log( 'API - [' + this._user.id + '] Opening channel.' );
    var self = this;
    var ip_signaling =
      'ws://' + this._room.signalingServer.ip + ':' + this._room.signalingServer.port;
    console.log( 'API - [' + this._user.id + '] signaling server URL: ' + ip_signaling );
    socket = io.connect( ip_signaling );
    socket.on('connect',   function(){ self.trigger("channelOpen"       ); });
    socket.on('error',     function(){ self.trigger("channelError"      ); });
    socket.on('close',     function(){ self.trigger("channelClose"      ); });
    socket.on('disconnect',function(){ self.trigger("channelDisconnect" ); });
    socket.on('message',   function(message){self._processSigMsg(message); });
  };

	Temasys.prototype.closeChannel = function () {

	};

	Temasys.prototype.toggleLock = function () {

	};

	Temasys.prototype.toggleAudio = function (audioMute) {

	};

	Temasys.prototype.toggleVideo = function (videoMute) {

	};


	/* Backend API */
	Temasys.prototype.authenticate = function (email, password) {

	};

	Temasys.prototype.joinRoom = function ( ) {
    console.log( 'API - [' + this._user.id + ']' + ' joining room: ' + this._room.id );
    this._sendMessage({
      type:      'joinRoom',
      mid:       this._user.id,
      rid:       this._room.id,
      cid:       this._key,
      roomCred:  this._room.token,
      userCred:  this._user.token,
      tokenTempCreated: this._user.tokenTimestamp,
      timeStamp: this._room.tokenTimestamp
    });
	};

	Temasys.prototype.leaveRoom = function () {

	};

	Temasys.prototype.getContacts = function () {

	};

	Temasys.prototype.getUser = function () {

	};

	Temasys.prototype.inviteContact = function (contact) {

	};

})(this);
