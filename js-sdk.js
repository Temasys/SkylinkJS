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
		var args = Array.prototype.slice.call(arguments),
			arr = this._events[eventName];
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
    var ip_signaling =
      'ws://' + this._room.signalingServer.ip + ':' + this._room.signalingServer.port;
    console.log( 'API - [' + this._user.id + '] signaling server URL: ' + ip_signaling );
    socket = io.connect( ip_signaling );
    socket.on('connect',   (function(tem){ tem.trigger("channelOpen"       ); })(this) );
    socket.on('error',     (function(tem){ tem.trigger("channelError"      ); })(this) );
    socket.on('close',     (function(tem){ tem.trigger("channelClose"      ); })(this) );
    socket.on('disconnect',(function(tem){ tem.trigger("channelDisconnect" ); })(this) );
    socket.on('message',   (function(tem){ tem.trigger("channelMessage"    ); })(this) );
    //   function( message ) { processSignalingMessage( message ); });
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
    // trace( 'MAIN - [' + targetMid + '] C->S: ' + message.type );
    // NOTE ALEX: should check that socket is not null
    socket.send( msgString );
    // NOTE ALEX: we should capture some errors here instead of assuming it s gonna be alright
	};

	/* Backend API */
	Temasys.prototype.authenticate = function (email, password) {

	};

  // NOTE ALEX: should I use "this" or pass objects by param?
	Temasys.prototype.joinRoom = function ( user, room ) {
    // JoinRoom with username, roomCred and tokenTempCreated
    // for signaling-server to authenticate via shared secret.
    console.log(
      'API - [' + user.id + ']' +
      ' joining room: '      + room.id + 
      ' username: '          + user.id +
      ', tokenTempCreated: ' + user.tokenTimestamp +
      ', roomCred: '         + room.token
    );
 
    // this.sendMessage({
    //  type:      'joinRoom',
    //  mid:       user.id,
    //  rid:       room.id,
    //  cid:       key,
    //  roomCred:  room.token,
    //  userCred:  user.token,
    //  tokenTempCreated: user.tokenTimestamp,
    //  timeStamp: room.tokenTimestamp
    //});
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
