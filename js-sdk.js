/**
 *
 * @class Temasys
 *
 */
(function(exports) {

	/**
   * @class Temasys
   * @constructor
   * @param {String} key The API key
   * @param {} user  User Information, credential and the local stream(s).
   * @param {String} user.id username in the system, will be "Guestxxxxx" if not logged in
   * @param {String} user.token Token for user verification upon connection
   * @param {String} user.tokenTimestamp Token timestamp for connection validation.
   * @param {String} user.displayName Displayed name
   * @param {Array}  user.streams List of all the local streams. Can ge generated internally
   *                              by getDefaultStream(), or provided through updateUser().
   * @param {} room  Room Information, and credentials.
   * @param {String} room.id
   * @param {String} room.token
   * @param {String} room.tokenTimestamp
   * @param {JSON} room.signalingServer
   * @param {String} room.signalingServer.ip
   * @param {String} room.signalingServer.port
   * @param {JSON} room.pcHelper Holder for all the constraints and configuration objects used
   *   in a peerconnection lifetime. Some are initialized by default, some are initialized by
   *   internal methods, all can be overriden through updateUser. Future APIs will help user
   * modifying specific parts (audio only, video only, ...) separately without knowing the
   * intricacies of constraints.
   * @param {JSON} room.pcHelper.pcConstraints
   * @param {JSON} room.pcHelper.pcConfig Will be provided upon connection to a room
   * @param {JSON}  [room.pcHelper.pcConfig.mandatory]
   * @param {Array} [room.pcHelper.pcConfig.optional]
   *   Ex: [{DtlsSrtpKeyAgreement: true}]
   * @param {JSON} room.pcHelper.offerConstraints
   * @param {JSON} [room.pcHelper.offerConstraints.mandatory]
   *   Ex:  {MozDontOfferDataChannel:true}
   * @param {Array} [room.pcHelper.offerConstraints.optional]
   * @param {JSON} room.pcHelper.sdpConstraints
   * @param {JSON} [room.pcHelper.sdpConstraints.mandatory]
   *   Ex: { 'OfferToReceiveAudio':true, 'OfferToReceiveVideo':true }
   * @param {Array} [room.pcHelper.sdpConstraints.optional]
   */
  function Temasys( serverpath, owner, room ) {
		if (!(this instanceof Temasys)) return new Temasys(key, user, room);

    // NOTE ALEX: check if last char is '/'
    this._path   = serverpath + owner + "/room/" + (room?room:owner) + '?client=native';

		this._key    = null;
		this._socket = null;
    this._user   = null;
		this._room   = null;
    this._peerConnections = [];

    this._readystate   = false;
    this._channel_open = false;
    this._in_room      = false;
    
    _fetchInfo( this );

    function _fetchInfo( self ){
      xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if(this.readyState == this.DONE) {
          if( this.status != 200 ){
            console.log( "XHR  - ERROR " + this.status, false );
            return;
          }
          _parseInfo( JSON.parse(this.response), self );
        }
      } 
      xhr.open( 'GET', self._path, true );
      console.log( 'API: fetching infos from webserver' );
      xhr.send(  );
      console.log( 'API: waiting for webserver answer.' );
    };
    function _parseInfo( Info, self ){
      self._key =        Info.cid;
      self._user = {     
        id:             Info.username,
        token:          Info.userCred,
        tokenTimestamp: Info.tokenTempCreated,
        displayName:    Info.displayName,
        streams:        []
      };  
      self._room = {     
        id:             Info.room_key,
        token:          Info.roomCred,
        tokenTimestamp: Info.timeStamp,
        signalingServer: {
          ip:           Info.ipSigserver,
          port:         Info.portSigserver
        },
        pcHelper: {
          pcConstraints:    JSON.parse(Info.pc_constraints),
          pcConfig:         null,
          offerConstraints: JSON.parse(Info.offer_constraints),
          sdpConstraints:{'mandatory':{'OfferToReceiveAudio':true,'OfferToReceiveVideo':true}}
        }
      };
      self._readystate = true;
      self._trigger( 'readystateChange','true' );
    }
  };

	exports.Temasys = Temasys;

  /**
    * Let app register a callback function to an event
    *
    * @method on
    * @param {String} eventName
    * @param {Function} callback
    */
  Temasys.prototype.on = function(eventName, callback) {
		if ('function' === typeof callback) {
			this._events[eventName] = this._events[eventName] || [];
			this._events[eventName].push(callback);
		}
	};

  /**
    * Let app unregister a callback function from an event
    *
    * @method off
    * @param {String} eventName
    * @param {Function} callback
    */
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

  /**
    * Trigger all the callbacks associated with an event
    * Note that extra arguments can be passed to the callback
    * which extra argument can be expected by callback is documented by each event
    *
    * @method trigger
    * @param {String} eventName
    * @for Temasys
    * @private
    */
	Temasys.prototype._trigger = function(eventName) {
		var args = Array.prototype.slice.call(arguments)
      , arr  = this._events[eventName];
		args.shift();
		for (e in arr) {
			if(arr[e](args) === false) {
				break;
			}
		}
	};

  /**
   * @method updateUser
   * @param {} user
   */
  Temasys.prototype.updateUser = function( user ){
    // NOTE ALEX: be smarter and copy fields and only if different
    this._user = user;
  };

	/* Syntactically private variables and utility functions */

	Temasys.prototype._events = {
    /**
      * Event fired when a successfull connection channel has been established
      * with the signaling server
      * @event channelOpen
      */
    "channelOpen":    [],
    /**
      * Event fired when the channel has been closed.
      * @event channelClose
      */
    "channelClose":   [],
    /**
      * Event fired when we received a message from the sig server..
      * @event channelMessage
      */
    "channelMessage": [],
    /**
      * Event fired when there was an error with the connection channel to the sig server.
      * @event channelError
      */
    "channelError":   [],

    /**
      * @event joinedRoom
      */
    "joinedRoom": [],
    /**
      *
      * @event readystateChange  
      * @param {String} readystate
      */
    "readystateChange": [],
    /**
      * Event fired when a step of the handshake has happened. Usefull for diagnostic
      * or progress bar. 
      * @event handshakeProgress
      * @param {String} step In order the steps of the handshake are: 'enter', 'welcome',
      *                 'offer', 'answer'
      */
    "handshakeProgress": [],

    //-- per peer, Connection event
    "candidateGenerationState": [],
    "peerConnectionState":      [],
    "iceConnectionState":       [],

    //-- per peer, local media events
    /**
      * @event mediaAccessError
      */ 
		"mediaAccessError": [],
    /**
     * @event mediaAccessSuccess
     * @param {} stream
     */
    "mediaAccessSuccess": [],

    /**
      * @event chatMessage
      * @param {JSON} chatObj
      */
		"chatMessage":     [], // chatObj
    /**
      * Event fired when a peer joins the room
      * @event peerJoined
      * @param {JSON} user
      */
		"peerJoined":      [],
    /**
      * Event fired when a peer joins the room
      * @event peerJoined
      * @param {JSON} user
      */
		"peerLeft":        [], // peerID, room
		"presenceChanged": [], // [peer], room
		"roomLock":        [], // locked, room

		//-- per peer, peer connection events
    /**
      * Event fired when a remote stream has become available
      * @event addPeerStream
      * @param {String} peerID peerID
      * @param {} stream 
      */
    "addPeerStream":    [],
    /**
      * Event fired when a remote stream has become unavailable
      * @event removePeerStream
      * @param {String} peerID peerID
      */
		"removePeerStream": [],
		"peerVideoMute":    [], // videoMute, peerID, room
		"peerAudioMute":    [], // audioMute, peerID, room

    //-- per user events
    "addContact":    [],
    "removeContact": [],
    "invitePeer":    []
	};

  /**
   * Send a chat message
   * @method sendChatMsg
   * @param {JSON} chatMsg
   * @param {String} chatMsg.msg
   * @param {String} [chatMsg.targetPeerID] 
   */
  Temasys.prototype.sendChatMsg = function( chatMsg, targetPeerID ){
  };

  /**
   * Get the default cam and microphone
   * @method getDefultStream
   */
  Temasys.prototype.getDefaultStream = function(){
    var self = this;
    try {
      getUserMedia(
        { 'audio': true, 'video': true },   
        function(s){self._onUserMediaSuccess(s,self);},
        function(e){self._onUserMediaError(  e,self);}
      );  
      console.log( 'API - Requested: A/V.' );
    } catch (e) {
      this._onUserMediaError(e)
    }
  };
  //--------------------------------------------------------------------------------------------
  Temasys.prototype._onUserMediaSuccess = function(stream,t) {
    console.log( 'API - User has granted access to local media.' );
    t._trigger("mediaAccessSuccess", stream);
    t._user.streams.push(stream);
  }
  //--------------------------------------------------------------------------------------------
  Temasys.prototype._onUserMediaError = function(e,t) {
    console.log( 'API  - getUserMedia failed with exception type: ' + e.name );
    if( e.message )
      console.log( 'API  - getUserMedia failed with exception: ' + e.message );
    if( e.constraintName )
      console.log( 'API  - getUserMedia failed because of the following constraint: '
        + e.constraintName );
    t._trigger("mediaAccessError", e.name); 
  }

  /** 
    * Handle every incoming message. If it's a bundle, extract single messages
    * Eventually handle the message(s) to _processSingleMsg
    *
    * @method _processingSigMsg
    * @param {JSON} message
    * @private
    */
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

  /**
    * This dispatch all the messages from the infrastructure to their respective handler
    *
    * @method _processingSingleMsg
    * @param {JSON str} msg
    * @private
    */
  Temasys.prototype._processSingleMsg = function( msg ){
    // note alex: I want the equivalent of the network blinking led in the GUI
    // to show there is activity even when nothing happens visibly.
    this._trigger("channelMessage");

    var origin = msg.mid;
    if( !origin ) origin = 'Server';
    console.log( 'API - [' + origin + '] Incoming message : ' + msg.type );

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
      case 'enter':
        this._enterHandler(msg);
        break;
      case 'welcome':
        this._welcomeHandler(msg);
        break;
      case 'offer':
        this._offerHandler(msg);
        break;
      case 'answer':
        this._answerHandler(msg);
        break;
      case 'candidate':
        this._candidateHandler(msg);
        break;
      case 'bye':
        this._byeHandler(msg);
        break;
      case 'chat':
       this._chatHandler(msg);
        break;
      case 'redirect':
        this._redirectHandler(msg);
        break;
      case 'error':
        // location.href = '/?error=' + msg.kind;
        break;
      //--- ADVANCED API Msgs ----
      case 'presence':
        // this._presenceHandler(msg);
        break;
      case 'invite':
        // this._inviteHandler();
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
  Temasys.prototype._chatHandler = function(msg){
    this._trigger( "chatMessage" );
  };

  //---------------------------------------------------------
  Temasys.prototype._redirectHandler = function( msg ){
    console.log( 'API - [Server] You are being redirected: ' + msg.info );
    if(        msg.action === "warning" ){
    } else if( msg.action === "reject"  ){
      location.href = msg.url;
    } else if( msg.action === "close"   ){
      location.href = msg.url;
    } 
  };

  //---------------------------------------------------------
  Temasys.prototype._byeHandler = function( msg ){
    var targetMid = msg.mid;
    console.log( 'API- [' + targetMid + '] received \'bye\'.' );
    if( this._peerConnections[targetMid] )
      this._peerConnections[targetMid].close();
    this._peerConnections[targetMid] = null;
    this._trigger("peerLeft",targetMid);
  };

  //---------------------------------------------------------
  Temasys.prototype._inRoomHandler = function( msg ){
    console.log( "API - [" + this._user.id + "] We're in the room!" 
      + " Chat functionalities are now available."
    )
    console.log( "API - [" + this._user.id 
      + "] We've been given the following PC Constraint by the sig server: "
    ); 
    console.dir( msg.pc_config );
    this._room.pcHelper.pcConfig = msg.pc_config;
    this._trigger("joinedRoom", this._room.id);

    // NOTE ALEX: should we wait for local streams?
    // or just go with what we have (if no stream, then one way?)
    // do we hardcode the logic here, or give the flexibility?
    // It would be better to separate, do we could choose with whom
    // we want to communicate, instead of connecting automatically to all.
    console.log( 'API - [' + this._user.id + '] Sending enter.' );
    this._trigger('handshakeProgress', 'enter');
    this._sendMessage({
      type: 'enter',
      mid:  this._user.id,
      rid:  this._room.id,
      nick: this._user.displayName
    }); 
  };

  //---------------------------------------------------------
  Temasys.prototype._enterHandler = function( msg ){
    var targetMid = msg.mid;
    this._trigger('handshakeProgress', 'enter', targetMid );
    this._trigger('peerJoined', targetMid );
    // need to check entered user is new or not.
    if( !this._peerConnections[targetMid] ) {
      console.log( 'API - [' + targetMid + '] Sending welcome.' );
      this._trigger('handshakeProgress', 'welcome', targetMid);
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
    this._trigger('handshakeProgress', 'welcome', targetMid );
    this._trigger('peerJoined', targetMid );
    if( !this._peerConnections[targetMid] ) {
      this._openPeer( targetMid, true );
    }
  };

  //---------------------------------------------------------
  Temasys.prototype._offerHandler = function( msg ){
    var targetMid = msg.mid;
    this._trigger('handshakeProgress', 'offer', targetMid );
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
    this._trigger( "addPeerStream", targetMid, event.stream );
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
        self._trigger('handshakeProgress', sessionDescription.type, targetMid);
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
        'API - [' + targetMid + '] PC config: '
          + JSON.stringify( this._room.pcHelper.pcConfig )      );
      console.log(
        'API - [' + targetMid + '] PC constraints: '
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
        self._trigger('iceConnectionState', pc.iceConnectionState, targetMid );
      };
    // pc.onremovestream = onRemoteStreamRemoved;
    pc.onsignalingstatechange = 
      function() {
        console.log( 'API - [' + targetMid + '] PC  connection state changed -> '
          + pc.signalingState
        );
        self._trigger('peerConnectionState', pc.signalingState, targetMid );
      }; 
    pc.onicegatheringstatechange =
      function() {
        console.log( 'API - [' + targetMid + '] ICE gathering  state changed -> '
          + pc.iceGatheringState
        );
        self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid );
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
    this._trigger('handshakeProgress', 'answer', targetMid);
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
    if( !this._channel_open ) return;
    var msgString = JSON.stringify( message );
    console.log( 'API - [' + this._user.id + '] Outgoing message : ' + message.type );
    socket.send( msgString );
	};

  /**
    * @method openChannel 
    */
	Temasys.prototype.openChannel = function () {
    if( this._channel_open ) return;
    if( !this._readystate  ) return;
    console.log( 'API - [' + this._user.id + '] Opening channel.' );
    var self = this;
    var ip_signaling =
      'ws://' + this._room.signalingServer.ip + ':' + this._room.signalingServer.port;
    console.log( 'API - [' + this._user.id + '] signaling server URL: ' + ip_signaling );
    socket = io.connect( ip_signaling );
    socket.on('connect',   function(){ self._trigger("channelOpen");
      self._channel_open = true;  });
    socket.on('error',     function(){ self._trigger("channelError");
      self._channel_open = false; });
    socket.on('close',     function(){ self._trigger("channelClose"      ); });
    socket.on('disconnect',function(){ self._trigger("channelDisconnect" ); });
    socket.on('message',   function(message){self._processSigMsg(message); });
  };

  /**
    * @method closeChannel 
    */
	Temasys.prototype.closeChannel = function (){
    if( ! this._channel_open ) return;
    this._socket.close();
    this._socket = null;
    this._channel_open = false;
  };

  /**
   * @method toggleLock
   * @private
   */
	Temasys.prototype.toggleLock = function ()           { /* TODO */ };

  /**
   * @method toggleAudio
   * @private
   */
	Temasys.prototype.toggleAudio = function (audioMute) { /* TODO */ };


  /**
   * @method toggleVideo
   * @private
   */
	Temasys.prototype.toggleVideo = function (videoMute) { /* TODO */ };


  /**
   * @method authenticate
   */
	Temasys.prototype.authenticate = function (email, password) {
	};

  /**
   * @method joinRoom
   */
	Temasys.prototype.joinRoom = function ( ) {
    if( this._in_room ) return;
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

  /**
   * @method LeaveRoom
   */
	Temasys.prototype.leaveRoom = function () {
    if( !this._in_room ) return;
    /* TODO */ 
  };

  /**
   * @method getContacts
   * @private
   */
	Temasys.prototype.getContacts = function () {
    if( !this._in_room ) return;
    /* TODO */
  };

  /**
   * @method getUser
   * @private
   */
	Temasys.prototype.getUser = function () { /* TODO */ };

  /**
   * @method inviteContact
   * @private
   */
	Temasys.prototype.inviteContact = function (contact) { /* TODO */ };

})(this);
