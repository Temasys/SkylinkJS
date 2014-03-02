(function(exports) {

	function Temasys(key, user, room) {
		if (!(this instanceof Temasys)) return new Temasys(key, user, room);
		// Constructor work...
		this._key  = key;
		this._socket = null;
    this._user = user;
		this._room = room;
	};

	exports.Temasys = Temasys;

	/* Syntactically private variables and utility functions */

	Temasys.prototype._events = {

		// Event documentation
    
    //-- signaling events
    "channelOpen": [],
    "channelClose": [],
    "channelMessage": [],
    "channelError": [],

    //-- higher level events
		"chatMessage": [], // chatMsg, peer
		"presenceChanged": [], // [peer], room
		"peerJoined": [], // peer, room
		"peerLeft": [], // peer, room
		"addStream": [], // stream, peer, room
		"removeStream": [], // stream, peer, room
		"peerVideoMute": [], // videoMute, peer, room
		"peerAudioMute": [], // audioMute, peer, room
		"signalingConnectionState": [], // connectionState, room
		"peerConnectionState": [], // connectionState, peer, room
		"roomLock": [], // locked, room
		"mediaAccessError": [] // error,
	};

  Temasys.prototype._processSigMsg = function( message ){
    var msg = JSON.parse( message );
    if( msg.type === 'group' ){
      console.log( 'API - Bundle of' + msg.lists.length + 'messages.' );
      for( var i=0; i<msg.lists.length; i++)
        this._processSingleMsg( msg.lists[i] );
    } else {
      this._processSingleMsg( msg );
    } 
  };

  Temasys.prototype._processSingleMsg = function( msg ){
    this.trigger("channelMessage");
    console.log( 'API - Received a sig msg: ' + msg.type );
  };

 	/*
	Object documentation

	var chatMsg = {
		body: '',
		timestamp: '',
		peer: {},
		room: {}
	};

  var user = {
    id: '',
    token: '',
    tokenTimestamp: '',
    serverUserID: '',
    displayName: ''
  }; 

	var peer = {
		user: <user>
    connectionState: {},
		room: {},
		stream: {},
		videoMute: false,
		audioMute: false,
		codec: '',
		bandwidth: '',
	};

	var room = {
		id: '',
    token: '',
    tokenTimestamp: '',
		signalingServer: {
      ip: '',
      port: ''
    },
    notOwnerHost: true,
		locked: false,
    //--------------------------------------------------------
    // this part is filled after joining the room
    // and can be updated during the life of the conference
		peers: [peer]
	};

	var connectionState: {
		state: 'welcome',
		timestamp: ''
	}
	*/

	/* Basic event system */

	Temasys.prototype.on = function(eventName, callback) {
		if ('function' === typeof callback) {
			this._events[eventName] = this._events[eventName] || [];
			this._events[eventName].push(callback);
		}
	};

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

	/* Signaling */
	Temasys.prototype.openChannel = function () {
    // NOTE ALEX: check input first.
    // _user.id ?
    // _room.signalingServer ?
    // socket ?

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
    socket.on('message',   function(message){self._processSigMsg(message);});
  };

	Temasys.prototype.closeChannel = function () {

	};

	Temasys.prototype.toggleLock = function () {

	};

	Temasys.prototype.toggleAudio = function (audioMute) {

	};

	Temasys.prototype.toggleVideo = function (videoMute) {

	};

  // send a message to the signaling server
	Temasys.prototype.sendMessage = function (message) {
    var msgString = JSON.stringify( message );
    console.log( 'API - [' + this._user.id + '] Outgoing message : ' + message.type );
    // NOTE ALEX: should check that socket is not null
    socket.send( msgString );
    // NOTE ALEX: we should capture some errors here instead of assuming it s gonna be alright
	};

	/* Backend API */
	Temasys.prototype.authenticate = function (email, password) {

	};

	Temasys.prototype.joinRoom = function ( ) {
    console.log( 'API - [' + this._user.id + ']' + ' joining room: ' + this._room.id );
    this.sendMessage({
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
