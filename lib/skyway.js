/**
 *
 * @class Skyway
 * @version @@version:@@rev
 * @date @@date
 */
(function(exports) {

	/**
   * @class Skyway
   * @constructor
   * @param {String} serverpath Path to the server to collect infos from.
   *                            Ex: https://www.webrtc-enterprise.com:8080
   * @param {String} apikey     Owner of the room. Ex: MomentMedia.
   * @param {string} [room]     Name of the room to join. Default room is used if null.
   */
  function Skyway( serverpath, apikey, room ) {
		if (!(this instanceof Skyway)) {
      return new Skyway( serverpath, apikey, room );
    }

    this.version = '@@version';

    // NOTE ALEX: check if last char is '/'
    /**
      * @attribute _path
      * @type String
      * @default serverpath
      * @final
      * @required
      * @private
      */
    this._path = serverpath + apikey + '/room/' + (room?room:apikey) + '?client=native';

    /**
     * The API key (not used)
     * @attribute key
     * @type String
     * @private
     */
		this._key = apikey;
    /**
     * the actual socket that handle the connection
     *
     * @attribute _socket
     * @required
     * @private
     */
		this._socket = null;
    /**
     * User Information, credential and the local stream(s).
     * @attribute _user
     * @required
     * @private
     *
     */
    this._user = null;
    /**
     * @attribute _room
     * @type JSON
     * @required
     * @private
     *
     * @param {} room  Room Information, and credentials.
     * @param {String} room.id
     * @param {String} room.token
     * @param {String} room.tokenTimestamp
     * @param {String} room.displayName Displayed name
     * @param {JSON} room.signalingServer
     * @param {String} room.signalingServer.ip
     * @param {String} room.signalingServer.port
     * @param {JSON} room.pcHelper Holder for all the constraints objects used
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
    this._room = null;

    /**
     * Internal array of peerconnections
     * @attribute _peerConnections
     * @attribute
     * @private
     * @required
     */
    this._peerConnections = [];

    this._readystate = false;
    this._channel_open = false;
    this._in_room = false;

    var _fetchInfo = function ( self ) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if(this.readyState === this.DONE) {
          if( this.status !== 200 ){
            console.log( 'XHR  - ERROR ' + this.status, false );
            return;
          }
          console.log( 'API - Got infos from webserver.' );
          _parseInfo( JSON.parse(this.response), self );
        }
      };
      xhr.open( 'GET', self._path, true );
      console.log( 'API - Fetching infos from webserver' );
      xhr.send(  );
      console.log( 'API - Waiting for webserver to provide infos.' );
    };
    var _parseInfo = function ( Info, self ) {
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
      console.log( 'API - Parsed infos from webserver. Ready.' );
      self._readystate = true;
      self._trigger( 'readystateChange','true' );
    }
  }

  _fetchInfo( this );
	exports.Skyway = Skyway;

  /**
    * Let app register a callback function to an event
    *
    * @method on
    * @param {String} eventName
    * @param {Function} callback
    */
  Skyway.prototype.on = function (eventName, callback) {
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
	Skyway.prototype.off = function (eventName, callback) {
		if (callback === undefined) {
			this._events[eventName] = [];
			return;
		}
		var arr = this._events[eventName],
			l = arr.length,
			e = false;
		for (var i = 0; i < l; i) {
			if (arr[i] === callback) {
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
    * @for Skyway
    * @private
    */
	Skyway.prototype._trigger = function (eventName) {
		var args = Array.prototype.slice.call(arguments),
        arr  = this._events[eventName];
		args.shift();
		for (var e in arr) {
			if(arr[e](args) === false) {
				break;
			}
		}
	};

  /**
   * @method setUser
   * @param {} user
   * @param {String} user.id username in the system, will be 'Guestxxxxx' if not logged in
   * @param {String} user.token Token for user verification upon connection
   * @param {String} user.tokenTimestamp Token timestamp for connection validation.
   * @param {String} user.displayName Displayed name
   * @param {Array}  user.streams List of all the local streams. Can ge generated internally
   *                              by getDefaultStream(), or provided through updateUser().
   */
  Skyway.prototype.setUser = function( user ){
    // NOTE ALEX: be smarter and copy fields and only if different
    this._user = user;
  };

	/* Syntactically private variables and utility functions */

	Skyway.prototype._events = {
    /**
      * Event fired when a successfull connection channel has been established
      * with the signaling server
      * @event channelOpen
      */
    'channelOpen':    [],
    /**
      * Event fired when the channel has been closed.
      * @event channelClose
      */
    'channelClose':   [],
    /**
      * Event fired when we received a message from the sig server..
      * @event channelMessage
      */
    'channelMessage': [],
    /**
      * Event fired when there was an error with the connection channel to the sig server.
      * @event channelError
      */
    'channelError':   [],

    /**
      * @event joinedRoom
      */
    'joinedRoom': [],
    /**
      *
      * @event readystateChange
      * @param {String} readystate
      */
    'readystateChange': [],
    /**
      * Event fired when a step of the handshake has happened. Usefull for diagnostic
      * or progress bar.
      * @event handshakeProgress
      * @param {String} step In order the steps of the handshake are: 'enter', 'welcome',
      *                 'offer', 'answer'
      */
    'handshakeProgress': [],

    /**
     * Event fired during ICE gathering
     * @event candidateGenerationState
     * @param {String} 'gathering' 'done'
     */
    'candidateGenerationState': [],


    'peerConnectionState':      [],
    /**
     * Event fired during ICE connection
     * @iceConnectionState
     * @param {String} 'new' 'closed' 'failed' 'checking' 'disconnected' 'connected'
     *   'completed'
     */
    'iceConnectionState':       [],

    //-- per peer, local media events
    /**
      * @event mediaAccessError
      */
		'mediaAccessError': [],
    /**
     * @event mediaAccessSuccess
     * @param {} stream
     */
    'mediaAccessSuccess': [],

    /**
      * @event chatMessage
      * @param {String}  msg
      * @param {String}  displayName
      * @param {Boolean} pvt
      */
		'chatMessage':     [],
    /**
      * Event fired when a peer joins the room
      * @event peerJoined
      * @param {String} peerID
      */
		'peerJoined':      [],
    /**
      * TODO Event fired when a peer leaves the room
      * @event peerLeft
      * @param {String} peerID
      */
		'peerLeft':        [],
    /**
      * TODO Event fired when a peer joins the room
      * @event peerLeft
      * @param {JSON} List of users
      */
		'presenceChanged': [],
    /**
      * TODO
      *
      */
		'roomLock':        [],

		//-- per peer, peer connection events
    /**
      * Event fired when a remote stream has become available
      * @event addPeerStream
      * @param {String} peerID peerID
      * @param {} stream
      */
    'addPeerStream':    [],
    /**
      * Event fired when a remote stream has become unavailable
      * @event removePeerStream
      * @param {String} peerID peerID
      */
		'removePeerStream': [],
    /**
      * TODO
      *
      */
		'peerVideoMute':    [],
    /**
      * TODO
      *
      */
		'peerAudioMute':    [],

    //-- per user events
    /**
      * TODO
      *
      */
    'addContact':    [],
    /**
      * TODO
      *
      */
    'removeContact': [],
    /**
      * TODO
      *
      */
    'invitePeer':    []
	};

  /**
   * Send a chat message
   * @method sendChatMsg
   * @param {JSON}   chatMsg
   * @param {String} chatMsg.msg
   * @param {String} [targetPeerID]
   */
  Skyway.prototype.sendChatMsg = function ( chatMsg, targetPeerID ) {
    var msg_json = {
      cid: this._key,
      data: chatMsg,
      mid: this._user.id,
      nick: this._user.displayName,
      rid: this._room.id,
      type: 'chat'
    };
    if ( targetPeerID ) {
      msg_json.target = targetPeerID;
    }
    this._sendMessage( msg_json );
  };

  /**
   * Get the default cam and microphone
   * @method getDefaultStream
   */
  Skyway.prototype.getDefaultStream = function () {
    var self = this;
    try {
      getUserMedia(
        { 'audio': true, 'video': true },
        function(s){ self._onUserMediaSuccess( s, self ); },
        function(e){ self._onUserMediaError(   e, self ); }
      );
      console.log( 'API - Requested: A/V.' );
    }
    catch (e) {
      this._onUserMediaError(e);
    }
  };

  /**
   * Stream is available, let's throw the corresponding event with the stream attached.
   *
   * @method getDefaultStreama
   * @param {} stream The acquired stream
   * @param {} t      A convenience pointer to the Skyway object for callbacks
   * @private
   */
  Skyway.prototype._onUserMediaSuccess = function( stream, t ) {
    console.log( 'API - User has granted access to local media.' );
    t._trigger( 'mediaAccessSuccess', stream );
    t._user.streams.push( stream );
  };

  /**
   * getUserMedia could not succeed.
   *
   * @method _onUserMediaError
   * @param {} e error
   * @param {} t A convenience pointer to the Skyway object for callbacks
   * @private
   */
  Skyway.prototype._onUserMediaError = function (e, t) {
    console.log( 'API  - getUserMedia failed with exception type: ' + e.name );
    if ( e.message ) {
      console.log( 'API  - getUserMedia failed with exception: ' + e.message );
    }
    if ( e.constraintName ) {
      console.log( 'API  - getUserMedia failed because of the following constraint: ' +
        e.constraintName );
    }
    t._trigger('mediaAccessError', e.name);
  };

  /**
    * Handle every incoming message. If it's a bundle, extract single messages
    * Eventually handle the message(s) to _processSingleMsg
    *
    * @method _processingSigMsg
    * @param {JSON} message
    * @private
    */
  Skyway.prototype._processSigMsg = function ( message ) {
    var msg = JSON.parse( message );
    if ( msg.type === 'group' ){
      console.log( 'API - Bundle of ' + msg.lists.length + ' messages.' );
      for( var i = 0; i < msg.lists.length; i++) {
        this._processSingleMsg( msg.lists[i] );
      }
    }
    else {
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
  Skyway.prototype._processSingleMsg = function ( msg ) {
    this._trigger('channelMessage');
    var origin = msg.mid;
    if( !origin || origin === this._user.id ) {
      origin = 'Server';
    }
    console.log( 'API - [' + origin + '] Incoming message : ' + msg.type );
    if (  msg.mid  === this._user.id &&
      msg.type !== 'redirect' &&
      msg.type !== 'inRoom' &&
      msg.type !== 'chat'
      ) {
      console.log( 'API - Ignoring message: ' + msg.type + '.' );
      return;
    }
    switch (msg.type) {
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
    case'update_guest_name':
      // this._updateGuestNameHandler(msg);
      break;
    case 'error':
      // location.href = '/?error=' + msg.kind;
      break;
    //--- ADVANCED API Msgs ----
    case 'invite':
      // this._inviteHandler();
      break;
    case 'video_mute_event':
      // this._handleVideoMuteEventMessage( msg.mid, msg.guest );
      break;
    case 'roomLockEvent':
      // this._roomLockEventHandler(msg);
      break;
    default:
      console.log( 'API - [' + msg.mid + '] Unsupported message type received: ' + msg.type);
      break;
    }

  };

  /**
    * Throw an event with the received chat msg
    *
    * @method _chatHandler
    * @private
    * @param {JSON} msg
    * @param {String} msg.data
    * @param {String} msg.nick
    */
  Skyway.prototype._chatHandler = function ( msg ) {
    this._trigger( 'chatMessage',
      msg.data,
      ((msg.id === this._user.id) ? 'Me, myself and I' : msg.nick),
      (msg.target ? true : false)
    );
  };

  /**
    * Signaller server wants us to move out.
    *
    * @method _redirectHandler
    * @private
    * @param {JSON} msg
    */
  Skyway.prototype._redirectHandler = function ( msg ) {
    console.log( 'API - [Server] You are being redirected: ' + msg.info );
    if( msg.action === 'warning' ) {
      // nothing
    }
    else if ( msg.action === 'reject'  ) {
      location.href = msg.url;
    }
    else if ( msg.action === 'close'   ) {
      location.href = msg.url;
    }
  };

  /**
    * A peer left, let.s clean the corresponding connection, and trigger an event.
    *
    * @method _byeHandler
    * @private
    * @param {JSON} msg
    */
  Skyway.prototype._byeHandler = function ( msg ) {
    var targetMid = msg.mid;
    console.log( 'API - [' + targetMid + '] received \'bye\'.' );
    this._removePeer( targetMid );
  };

  /**
   * Actually clean the peerconnection and trigger an event. Can be called by _byHandler
   * and leaveRoom.
   *
   * @method _removePeer
   * @private
   * @param {String} peerID Id of the peer to remove
   */
  Skyway.prototype._removePeer = function ( peerID ) {
    this._trigger('peerLeft',peerID);
    if ( this._peerConnections[peerID] ) {
      this._peerConnections[peerID].close();
    }
    this._peerConnections[peerID] = null;
  };

  /**
    * We just joined a room! Let's send a nice message to all to let them know I'm in.
    *
    * @method _inRoomHandler
    * @private
    * @param {JSON} msg
    */
  Skyway.prototype._inRoomHandler = function ( msg ) {
    console.log( 'API - We\'re in the room! Chat functionalities are now available.');
    console.log( 'API - We\'ve been given the following PC Constraint by the sig server: ');
    console.dir( msg.pc_config );
    this._room.pcHelper.pcConfig = msg.pc_config;
    this._in_room = true;
    this._trigger('joinedRoom', this._room.id);

    // NOTE ALEX: should we wait for local streams?
    // or just go with what we have (if no stream, then one way?)
    // do we hardcode the logic here, or give the flexibility?
    // It would be better to separate, do we could choose with whom
    // we want to communicate, instead of connecting automatically to all.
    console.log( 'API - Sending enter.' );
    this._trigger('handshakeProgress', 'enter');
    this._sendMessage({
      type: 'enter',
      mid:  this._user.id,
      rid:  this._room.id,
      nick: this._user.displayName
    });
  };

  /**
    * Someone just entered the room. If we don't have a connection with him/her,
    * send him a welcome. Handshake step 2 and 3.
    *
    * @method _enterHandler
    * @private
    * @param {JSON} msg
    */
  Skyway.prototype._enterHandler = function ( msg ) {
    var targetMid = msg.mid;
    this._trigger('handshakeProgress', 'enter', targetMid );
    this._trigger('peerJoined', targetMid );
    // need to check entered user is new or not.
    if ( !this._peerConnections[targetMid] ) {
      console.log( 'API - [' + targetMid + '] Sending welcome.' );
      this._trigger('handshakeProgress', 'welcome', targetMid);
      this._sendMessage({
        type   : 'welcome',
        mid    : this._user.id,
        target : targetMid,
        rid    : this._room.id,
        nick   : this._user.displayName
      });
    }
    else {
      // NOTE ALEX: and if we already have a connection when the peer enter,
      // what should we do? what are the possible use case?
    }
  };

  /**
    * We have just received a welcome. If there is no existing connection with this peer,
    * create one, then set the remotedescription and answer.
    *
    * @method _offerHandler
    * @private
    * @param {JSON} msg
    */
  Skyway.prototype._welcomeHandler = function( msg ){
    var targetMid = msg.mid;
    this._trigger('handshakeProgress', 'welcome', targetMid );
    this._trigger('peerJoined', targetMid );
    if( !this._peerConnections[targetMid] ) {
      this._openPeer( targetMid, true );
    }
  };

  /**
    * We have just received an offer. If there is no existing connection with this peer,
    * create one, then set the remotedescription and answer.
    *
    * @method _offerHandler
    * @private
    * @param {JSON} msg
    */
  Skyway.prototype._offerHandler = function( msg ){
    var targetMid = msg.mid;
    this._trigger('handshakeProgress', 'offer', targetMid );
    var offer = new RTCSessionDescription(msg);
    console.log( 'API - [' + targetMid + '] Received offer:' );
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

  /**
    * We have succesfully received an offer and set it locally. This function will take care
    * of cerating and sendng the corresponding answer. Handshake step 4.
    *
    * @method _doAnswer
    * @private
    * @param {String} targetMid The peer we should connect to.
    * @param {Boolean} toOffer Wether we should start the O/A or wait.
    */
  Skyway.prototype._doAnswer = function( targetMid ){
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

  /**
    * We have a peer, this creates a peerconnection object to handle the call.
    * if we are the initiator, we then starts the O/A handshake.
    *
    * @method _openPeer
    * @private
    * @param {String} targetMid The peer we should connect to.
    * @param {Boolean} toOffer Wether we should start the O/A or wait.
    */
  Skyway.prototype._openPeer = function ( targetMid, toOffer ) {
    console.log( 'API - [' + targetMid + '] Creating PeerConnection.' );
    this._peerConnections[targetMid] = this._createPeerConnection(targetMid);

    // NOTE ALEX: here we could do something smarter
    // a mediastream is mainly a container, most of the info
    // are attached to the tracks. We should iterates over track and print
    console.log( 'API - [' + targetMid + '] Adding local stream.' );

    if( this._user.streams.length > 0 ) {
      for ( var i in this._user.streams ) {
        this._peerConnections[targetMid].addStream( this._user.streams[i] );
      }
    } else {
      console.log( 'API - WARNING - No stream to send. You will be only receiving.' );
    }
    // I'm the callee I need to make an offer
    if( toOffer ) {
      this._doCall(targetMid);
    }
  };

  /**
    * The remote peer advertised streams, that we are forwarding to the app. This is part
    * of the peerConnection's addRemoteDescription() API's callback.
    *
    * @method _onRemoteStreamAdded
    * @private
    * @param {String} targetMid
    * @param {Event}  event      This is provided directly by the peerconnection API.
    */
  Skyway.prototype._onRemoteStreamAdded = function( targetMid, event ){
    console.log( 'API - [' + targetMid + '] Remote Stream added.' );
    this._trigger( 'addPeerStream', targetMid, event.stream );
  };

  /**
    * it then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
    *
    * @method _doCall
    * @private
    * @param {String} targetMid
    */
  Skyway.prototype._doCall = function ( targetMid ) {
    var pc = this._peerConnections[ targetMid ];
    // NOTE ALEX: handle the pc = 0 case, just to be sure

    // temporary measure to remove Moz* constraints in Chrome
    var oc = this._room.pcHelper.offerConstraints;
    if ( webrtcDetectedBrowser === 'chrome' ) {
      for ( var prop in oc.mandatory ) {
        if ( prop.indexOf('Moz') !== -1 ) {
          delete oc.mandatory[prop];
        }
      }
    }

    var constraints = oc;
    var sc = this._room.pcHelper.sdpConstraints;
    for ( var name in sc.mandatory ) {
      constraints.mandatory[name] = sc.mandatory[name];
    }
    constraints.optional.concat(sc.optional);
    console.log( 'API - [' + targetMid + '] Creating offer.');
    var self = this;
    pc.createOffer(
      function (offer) {
        self._setLocalAndSendMessage( targetMid, offer );
      },
      null,
      // onOfferOrAnswerError,
      constraints
    );
  };

  /**
    * This takes an offer or an aswer generated locally and set it in the peerconnection
    * it then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
    *
    * @method _setLocalAndSendMessage
    * @private
    * @param {String} targetMid
    * @param {JSON} sessionDescription This should be provided by the peerconnection API.
    * User might 'tamper' with it, but then , the setLocal may fail.
    */
  Skyway.prototype._setLocalAndSendMessage = function( targetMid, sessionDescription ){
    console.log( 'API - [' + targetMid + '] Created ' + sessionDescription.type + '.' );
    console.dir( sessionDescription );
    var pc = this._peerConnections[ targetMid ];
    // NOTE ALEX: handle the pc = 0 case, just to be sure

    // NOTE ALEX: opus should not be used for mobile
    // Set Opus as the preferred codec in SDP if Opus is present.
    // sessionDescription.sdp = preferOpus(sessionDescription.sdp);

    // limit bandwidth
    // sessionDescription.sdp = limitBandwidth(sessionDescription.sdp);

    console.log( 'API - [' + targetMid + '] Setting local Description (' +
      sessionDescription.type + ' ).' );

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
        console.log( 'API - [' +
          targetMid + '] There was a problem setting the Local Description.');
      }
    );
  };

  /**
    * Create a peerconnection to communicate with the peer whose ID is 'targetMid'.
    * All the peerconnection callbacks are set up here. This is a quite central piece.
    *
    * @method _createPeerConnection
    * @return the created peer connection.
    * @private
    * @param {String} targetMid
    */
  Skyway.prototype._createPeerConnection = function( targetMid ){
    var pc;

    try {
      pc = new RTCPeerConnection( this._room.pcHelper.pcConfig,
        this._room.pcHelper.pcConstraints );
      console.log(
        'API - [' + targetMid + '] Created PeerConnection.' );
      console.log(
        'API - [' + targetMid + '] PC config: ' );
      console.dir( this._room.pcHelper.pcConfig );
      console.log(
        'API - [' + targetMid + '] PC constraints: ' +
          JSON.stringify( this._room.pcHelper.pcConstraints ) );
    } catch (e) {
      console.log( 'API - [' + targetMid + '] Failed to create PeerConnection: ' + e.message );
      return null;
    }

    // callbacks
    // standard not implemented: onnegotiationneeded,
    var self = this;
    pc.onaddstream = function ( event ) {
        self._onRemoteStreamAdded( targetMid, event );
    };
    pc.onicecandidate = function ( event ) {
        self._onIceCandidate( targetMid, event );
    };
    pc.oniceconnectionstatechange = function() {
      console.log( 'API - [' + targetMid + '] ICE connection state changed -> ' +
        pc.iceConnectionState
      );
      self._trigger('iceConnectionState', pc.iceConnectionState, targetMid );
    };
    // pc.onremovestream = onRemoteStreamRemoved;
    pc.onsignalingstatechange = function() {
      console.log( 'API - [' + targetMid + '] PC  connection state changed -> ' +
        pc.signalingState
      );
      self._trigger('peerConnectionState', pc.signalingState, targetMid );
    };
    pc.onicegatheringstatechange = function() {
      console.log( 'API - [' + targetMid + '] ICE gathering  state changed -> ' +
        pc.iceGatheringState
      );
      self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid );
    };
    return pc;
  };

  /**
    * A candidate has just been generated (ICE gathering) and will be sent to the peer.
    * Part of connection establishment.
    *
    * @method _onIceCandidate
    * @private
    * @param {String} targetMid
    * @param {Event}  event      This is provided directly by the peerconnection API.
    */
  Skyway.prototype._onIceCandidate = function ( targetMid, event ) {
    if( event.candidate ) {
      var msgCan = event.candidate.candidate.split( ' ' );
      var candidateType = msgCan[7];
      console.log( 'API - [' + targetMid + '] Created and sending ' +
        candidateType + ' candidate.');
      this._sendMessage({
        type:     'candidate',
        label:     event.candidate.sdpMLineIndex,
        id:        event.candidate.sdpMid,
        candidate: event.candidate.candidate,
        mid:       this._user.id,
        target:    targetMid,
        rid:       this._room.id
      });
    }
    else {
      console.log( 'API - [' + targetMid + '] End of gathering.' );
      this._trigger('candidateGenerationState', 'done', targetMid);
    }
  };

  /**
    * Handling reception of a candidate. handshake done, connection ongoing.
    * @method _candidateHandler
    * @private
    * @param {JSON} msg
    */
  Skyway.prototype._candidateHandler = function( msg ){
    var targetMid = msg.mid;
    var pc = this._peerConnections[targetMid];
    if( pc ) {
      if( pc.iceConnectionState === 'connected' ){
        console.log( 'API - [' + targetMid + '] Received but not adding Candidate ' +
          'as we are already connected to this peer.');
        return;
      }
      var msgCan = msg.candidate.split( ' ' );
      var canType = msgCan[7];
      console.log( 'API - [' + targetMid + '] Received '+ canType +' Candidate.' );
      // if( canType !== 'relay' && canType !== 'srflx' ) {
      // trace( 'Skipping non relay and non srflx candidates.' );
      var index = msg.label;
      var candidate = new RTCIceCandidate( {
        sdpMLineIndex: index,
        candidate: msg.candidate
      });
      pc.addIceCandidate( candidate );//,
        // NOTE ALEX: not implemented in chrome yet, need to wait
        //  function() { trace('ICE  -  addIceCandidate Succesfull. ' ); },
        //  function(error) { trace('ICE  - AddIceCandidate Failed: ' + error ); }
      //);
      console.log( 'API - [' + targetMid + '] Added Candidate.' );
    }
    else {
      console.log( 'API - [' + targetMid + '] Received but not adding Candidate ' +
        'as PeerConnection not present.' );
      // NOTE ALEX: if the offer was slow, this can happen
      // we might keep a buffer of candidates to replay after receiving an offer.
    }
  };

  /**
    * Handling reception of an answer (to a previous offer). handshake step 4.
    * @method _answerHandler
    * @private
    * @param {JSON} msg
    */
  Skyway.prototype._answerHandler = function( msg ){
    var targetMid = msg.mid;
    this._trigger('handshakeProgress', 'answer', targetMid);
    var answer = new RTCSessionDescription( msg );
    console.log( 'API - [' + targetMid + '] Received answer:' );
    console.dir( answer );
    var pc = this._peerConnections[targetMid];
    pc.setRemoteDescription( answer );
    pc.remotePeerReady = true;
  };

  /**
    * send a message to the signaling server
    * @method _sendMessage
    * @private
    * @param {JSON} message
    */
	Skyway.prototype._sendMessage = function (message) {
    if( !this._channel_open ) {
      return;
    }
    var msgString = JSON.stringify( message );
    console.log( 'API - [' + (message.target?message.target:'server') +
      '] Outgoing message : ' + message.type );
    this._socket.send( msgString );
	};

  /**
    * @method _openChannel
    * @private
    */
  Skyway.prototype._openChannel = function () {
    if( this._channel_open ) {
      return;
    }
    if( !this._readyState  ){
      this.on( 'readyStateChange', _openChannelImpl );
      this._init();
    } else {
      _openChannelImpl();
    }
    function _openChannelImpl( ){
      self.off( 'readyStateChange', _openChannelImpl );
      console.log( 'API - Opening channel.' );
      var ip_signaling =
        'ws://' + self._room.signalingServer.ip + ':' + self._room.signalingServer.port;
      console.log( 'API - Signaling server URL: ' + ip_signaling );
      self._socket = io.connect( ip_signaling, { 'force new connection': true });
      self._socket.on('connect',   function(){
        self._channel_open = true;
        self._trigger("channelOpen");
      });
      self._socket.on('error',     function(err){
        console.log( 'API - Channel Error: ' + err );
        self._channel_open = false;
        self._trigger("channelError");
      });
      self._socket.on('disconnect',function(){
        self._trigger("channelClose" );
      });
      self._socket.on('message',   function(msg){
        self._processSigMsg(msg);
      });
    };
  };

  /**
    * @method _closeChannel 
    * @private
    */
	Skyway.prototype._closeChannel = function (){
    if( !this._channel_open ) {
      return;
    }
    this._socket.disconnect();
    this._socket = null;
    this._channel_open = false;
    this._readyState   = false;
  };

  /**
   * TODO
   * @method toggleLock
   * @protected
   */
	Skyway.prototype.toggleLock = function () { /* TODO */ };

  /**
   * TODO
   * @method toggleAudio
   * @protected
   */
	Skyway.prototype.toggleAudio = function (audioMute) { /* TODO */ };


  /**
   * TODO
   * @method toggleVideo
   * @protected
   */
	Skyway.prototype.toggleVideo = function (videoMute) { /* TODO */ };


  /**
   * TODO
   * @method authenticate
   * @protected
   * @param {String} email
   * @param {String} password
   */
	Skyway.prototype.authenticate = function (email, password) {
	};

  /**
   * @method joinRoom
   */
	Skyway.prototype.joinRoom = function ( ) {
    if( this._in_room ) {
      return;
    }
    var self = this;
    function _sendJoinRoomMsg(){
      self.off( 'channelOpen', _sendJoinRoomMsg );
      console.log( 'API - Joining room: ' + self._room.id );
      self._sendMessage({
        type:      'joinRoom',
        mid:       self._user.id,
        rid:       self._room.id,
        cid:       self._key,
        roomCred:  self._room.token,
        userCred:  self._user.token,
        tokenTempCreated: self._user.tokenTimestamp,
        timeStamp: self._room.tokenTimestamp
      });
    }
    if( !this._channel_open ){
      this.on( 'channelOpen', _sendJoinRoomMsg );
      this._openChannel();
    } else _sendJoinRoomMsg();
	};

  /**
   * @method LeaveRoom
   */
	Skyway.prototype.leaveRoom = function () {
    if ( !this._in_room ) {
      return;
    }
    for ( var pc_index in this._peerConnections ) {
      this._removePeer( pc_index );
    }
    this._in_room = false;
    this._closeChannel();
  };

  /**
   * TODO
   * @method getContacts
   * @protected
   */
	Skyway.prototype.getContacts = function () {
    if( !this._in_room ) {
      return;
    }
    /* TODO */
  };

  /**
   * TODO
   * @method getUser
   * @protected
   */
	Skyway.prototype.getUser = function () { /* TODO */ };

  /**
   * TODO
   * @method inviteContact
   * @protected
   */
	Skyway.prototype.inviteContact = function (contact) { /* TODO */ };

})(this);
