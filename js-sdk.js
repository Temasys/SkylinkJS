(function(exports) {

	function Temasys(key) {
		if (!(this instanceof Temasys)) return new Temasys(key);

		// Constructor work...
		this._key = key;
		this._user = {
			id: 0,
			email: ''
		}; // current user
		this._room = {
			name: '',
			signalingServer: {
				ip: '',
				port: ''
			},
			users: [],
			locked: false,
		};
	}

	exports.Temasys = Temasys;


	/* Syntactically private variables and utility functions */

	Temasys.prototype._events = {
		/*
		Event documentation

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
		*/
	};

 	/*
	Object documentation

	var chatMsg = {
		body: '',
		timestamp: '',
		peer: {},
		room: {}
	};

	var peer = {
		user: {
			id: 0,
			name: "",
			first_name: ""
		},
		connectionState: {},
		room: {},
		stream: {},
		videoMute: false,
		audioMute: false,
		codec: '',
		bandwidth: '',
	};

	var room = {
		name: '',
		signalingServer: {},
		users: [],
		locked: false,
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

	Temasys.prototype.openChannel = function (username) {

	};

	Temasys.prototype.closeChannel = function () {

	};

	Temasys.prototype.toggleLock = function () {

	};

	Temasys.prototype.toggleAudio = function (audioMute) {

	};

	Temasys.prototype.toggleVideo = function (videoMute) {

	};

	Temasys.prototype.sendMessage = function (chatMsg) {

	};


	/* Backend API */

	Temasys.prototype.authenticate = function (email, password) {

	};

	Temasys.prototype.joinRoom = function (roomname) {

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
